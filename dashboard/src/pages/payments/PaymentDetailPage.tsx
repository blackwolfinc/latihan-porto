import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Spin, Empty, message, Modal, InputNumber, Row, Col } from 'antd';
import { ArrowLeftOutlined, RollbackOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { paymentsService } from '@/services/payments.service';
import type { Payment } from '@/types';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchPayment(id); }, [id]);

  const fetchPayment = async (paymentId: string) => {
    try {
      const { data } = await paymentsService.getById(paymentId);
      setPayment(data.data);
    } catch {
      message.error('Gagal memuat data pembayaran');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = () => {
    if (!id || !payment) return;
    let refundAmount = payment.amount;
    Modal.confirm({
      title: 'Refund Pembayaran',
      content: (
        <div>
          <p>Masukkan jumlah refund:</p>
          <InputNumber
            defaultValue={payment.amount}
            min={0}
            max={payment.amount}
            style={{ width: '100%' }}
            formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(v) => v!.replace(/Rp\s?|(\.*)/g, '') as any}
            onChange={(v) => { refundAmount = v || 0; }}
          />
        </div>
      ),
      okText: 'Refund',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await paymentsService.refund(id, refundAmount, 'Refund oleh admin');
          message.success('Refund berhasil');
          fetchPayment(id);
        } catch {
          message.error('Gagal melakukan refund');
        }
      },
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!payment) return <Empty description="Pembayaran tidak ditemukan" />;

  return (
    <div>
      <PageHeader
        title={`Detail Pembayaran`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Pembayaran', path: '/payments' }, { title: 'Detail' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/payments')}>Kembali</Button>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Informasi Pembayaran" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
              <Descriptions.Item label="Status"><StatusTag status={payment.status} type="payment" /></Descriptions.Item>
              <Descriptions.Item label="Jumlah">Rp {payment.amount?.toLocaleString('id-ID')}</Descriptions.Item>
              <Descriptions.Item label="Metode">{payment.method}</Descriptions.Item>
              <Descriptions.Item label="Tanggal Dibuat">{dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              {payment.paidAt && <Descriptions.Item label="Tanggal Bayar">{dayjs(payment.paidAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>}
              {payment.refundedAt && <Descriptions.Item label="Tanggal Refund">{dayjs(payment.refundedAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>}
              {payment.refundAmount && <Descriptions.Item label="Jumlah Refund">Rp {payment.refundAmount?.toLocaleString('id-ID')}</Descriptions.Item>}
              {payment.notes && <Descriptions.Item label="Catatan" span={2}>{payment.notes}</Descriptions.Item>}
            </Descriptions>
          </Card>

          <Card title="Detail Midtrans" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Order ID">{payment.midtransOrderId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Transaction ID">{payment.transactionId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Token">{payment.midtransToken || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Booking Terkait" style={{ marginBottom: 16 }}>
            {payment.booking ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="No. Booking">{payment.booking.bookingNumber}</Descriptions.Item>
                <Descriptions.Item label="Customer">{payment.booking.customer?.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mobil">{payment.booking.car ? `${payment.booking.car.brand} ${payment.booking.car.model}` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Total Booking">Rp {payment.booking.totalAmount?.toLocaleString('id-ID')}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Tidak ada data booking" />
            )}
            {payment.bookingId && (
              <Button type="link" block onClick={() => navigate(`/bookings/${payment.bookingId}`)}>
                Lihat Booking
              </Button>
            )}
          </Card>

          {payment.status === 'PAID' && (
            <Card title="Aksi">
              <Button danger icon={<RollbackOutlined />} block onClick={handleRefund}>
                Refund
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PaymentDetailPage;
