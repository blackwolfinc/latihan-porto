import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Spin, Empty, message, Row, Col, Modal, Tag } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, PlayCircleOutlined, StopOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { bookingsService } from '@/services/bookings.service';
import type { Booking, BookingStatus } from '@/types';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBooking(id);
  }, [id]);

  const fetchBooking = async (bookingId: string) => {
    try {
      const { data } = await bookingsService.getById(bookingId);
      setBooking(data.data);
    } catch {
      message.error('Gagal memuat data booking');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!id) return;
    Modal.confirm({
      title: 'Konfirmasi',
      content: `Ubah status booking menjadi ${status}?`,
      okText: 'Ya',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await bookingsService.updateStatus(id, status);
          message.success('Status berhasil diperbarui');
          fetchBooking(id);
        } catch {
          message.error('Gagal memperbarui status');
        }
      },
    });
  };

  const handleCancel = async () => {
    if (!id) return;
    Modal.confirm({
      title: 'Batalkan Booking',
      content: 'Apakah Anda yakin ingin membatalkan booking ini?',
      okText: 'Ya, Batalkan',
      okType: 'danger',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          await bookingsService.cancel(id, 'Dibatalkan oleh admin');
          message.success('Booking berhasil dibatalkan');
          fetchBooking(id);
        } catch {
          message.error('Gagal membatalkan booking');
        }
      },
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (!booking) {
    return <Empty description="Booking tidak ditemukan" />;
  }

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.bookingNumber}`}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Booking', path: '/bookings' },
          { title: booking.bookingNumber },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')}>Kembali</Button>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Informasi Booking" extra={<StatusTag status={booking.status} type="booking" />} style={{ marginBottom: 16 }}>
            <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
              <Descriptions.Item label="No. Booking">{booking.bookingNumber}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusTag status={booking.status} type="booking" /></Descriptions.Item>
              <Descriptions.Item label="Tanggal Mulai">{dayjs(booking.startDate).format('DD MMMM YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Tanggal Selesai">{dayjs(booking.endDate).format('DD MMMM YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Lokasi Pickup">{booking.pickupLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Lokasi Dropoff">{booking.dropoffLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                <strong style={{ fontSize: 16 }}>Rp {booking.totalAmount?.toLocaleString('id-ID')}</strong>
              </Descriptions.Item>
              {booking.notes && <Descriptions.Item label="Catatan" span={2}>{booking.notes}</Descriptions.Item>}
            </Descriptions>
          </Card>

          <Card title="Informasi Mobil" style={{ marginBottom: 16 }}>
            {booking.car ? (
              <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Mobil">{booking.car.brand} {booking.car.model}</Descriptions.Item>
                <Descriptions.Item label="Plat Nomor">{booking.car.plateNumber}</Descriptions.Item>
                <Descriptions.Item label="Tahun">{booking.car.year}</Descriptions.Item>
                <Descriptions.Item label="Kategori">{booking.car.category}</Descriptions.Item>
                <Descriptions.Item label="Transmisi">{booking.car.transmission}</Descriptions.Item>
                <Descriptions.Item label="Warna">{booking.car.color}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Data mobil tidak tersedia" />
            )}
          </Card>

          <Card title="Informasi Customer" style={{ marginBottom: 16 }}>
            {booking.customer ? (
              <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Nama">{booking.customer.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{booking.customer.email}</Descriptions.Item>
                <Descriptions.Item label="Telepon">{booking.customer.phone || '-'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Data customer tidak tersedia" />
            )}
          </Card>

          {booking.driver && (
            <Card title="Informasi Driver" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Nama">{booking.driver.user?.name}</Descriptions.Item>
                <Descriptions.Item label="No. SIM">{booking.driver.licenseNumber}</Descriptions.Item>
                <Descriptions.Item label="Tipe SIM">{booking.driver.licenseType}</Descriptions.Item>
                <Descriptions.Item label="Rating">{booking.driver.rating || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Pembayaran" style={{ marginBottom: 16 }}>
            {booking.payments && booking.payments.length > 0 ? (
              booking.payments.map((payment) => (
                <Card key={payment.id} size="small" style={{ marginBottom: 8 }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Jumlah">Rp {payment.amount?.toLocaleString('id-ID')}</Descriptions.Item>
                    <Descriptions.Item label="Metode">{payment.method}</Descriptions.Item>
                    <Descriptions.Item label="Status"><StatusTag status={payment.status} type="payment" /></Descriptions.Item>
                    {payment.paidAt && (
                      <Descriptions.Item label="Dibayar">{dayjs(payment.paidAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              ))
            ) : (
              <Empty description="Belum ada pembayaran" />
            )}
          </Card>

          <Card title="Aksi" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {booking.status === 'PENDING' && (
                <Button type="primary" icon={<CheckOutlined />} block onClick={() => handleStatusUpdate('CONFIRMED' as BookingStatus)}>
                  Konfirmasi
                </Button>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button type="primary" icon={<PlayCircleOutlined />} block style={{ background: '#52c41a' }} onClick={() => handleStatusUpdate('ONGOING' as BookingStatus)}>
                  Mulai Rental
                </Button>
              )}
              {booking.status === 'ONGOING' && (
                <Button type="primary" icon={<StopOutlined />} block onClick={() => handleStatusUpdate('COMPLETED' as BookingStatus)}>
                  Selesaikan
                </Button>
              )}
              {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                <Button danger icon={<CloseCircleOutlined />} block onClick={handleCancel}>
                  Batalkan
                </Button>
              )}
              {booking.inspections && booking.inspections.length > 0 && (
                <Button block onClick={() => navigate(`/inspections/${booking.inspections![0].id}`)}>
                  Lihat Inspeksi
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BookingDetailPage;
