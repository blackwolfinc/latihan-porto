import React, { useState, useEffect } from 'react';
import { Card, Tabs, Descriptions, Table, Tag, Image, Row, Col, Button, Space, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { carsService } from '@/services/cars.service';
import type { Car, CarDocument, Booking, MaintenanceRecord } from '@/types';

const CarDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCar(id);
  }, [id]);

  const fetchCar = async (carId: string) => {
    try {
      const { data } = await carsService.getById(carId);
      setCar(data.data);
    } catch {
      message.error('Gagal memuat data mobil');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (!car) {
    return <Empty description="Mobil tidak ditemukan" />;
  }

  const documentColumns = [
    { title: 'Tipe', dataIndex: 'type', key: 'type' },
    { title: 'Nomor Dokumen', dataIndex: 'documentNumber', key: 'documentNumber' },
    {
      title: 'Tanggal Kadaluarsa',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      render: (url: string) => url ? <a href={url} target="_blank" rel="noopener noreferrer">Lihat</a> : '-',
    },
  ];

  const bookingColumns = [
    { title: 'ID', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => record.customer?.name || '-',
    },
    {
      title: 'Mulai',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Selesai',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="booking" />,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `Rp ${amount?.toLocaleString('id-ID')}`,
    },
  ];

  const maintenanceColumns = [
    { title: 'Tipe', dataIndex: 'type', key: 'type' },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description' },
    {
      title: 'Tanggal',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Biaya',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `Rp ${cost?.toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="maintenance" />,
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: 'Informasi',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Image
              src={car.imageUrl || '/placeholder-car.png'}
              alt={`${car.brand} ${car.model}`}
              style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkC1TroQAAAABJRU5ErkJggg=="
            />
            {car.images && car.images.length > 0 && (
              <Image.PreviewGroup>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  {car.images.map((img, idx) => (
                    <Col key={idx} span={6}>
                      <Image src={img} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            )}
          </Col>
          <Col xs={24} md={14}>
            <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
              <Descriptions.Item label="Brand">{car.brand}</Descriptions.Item>
              <Descriptions.Item label="Model">{car.model}</Descriptions.Item>
              <Descriptions.Item label="Tahun">{car.year}</Descriptions.Item>
              <Descriptions.Item label="Plat Nomor">{car.plateNumber}</Descriptions.Item>
              <Descriptions.Item label="Warna">{car.color}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{car.category}</Descriptions.Item>
              <Descriptions.Item label="Transmisi">{car.transmission}</Descriptions.Item>
              <Descriptions.Item label="BBM">{car.fuelType}</Descriptions.Item>
              <Descriptions.Item label="Kapasitas Mesin">{car.engineCapacity} cc</Descriptions.Item>
              <Descriptions.Item label="Kursi">{car.seats}</Descriptions.Item>
              <Descriptions.Item label="Kilometer">{car.mileage?.toLocaleString('id-ID')} km</Descriptions.Item>
              <Descriptions.Item label="Tarif/Hari">Rp {car.pricePerDay?.toLocaleString('id-ID')}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusTag status={car.status} type="car" /></Descriptions.Item>
              <Descriptions.Item label="Cabang">{car.branch?.name || '-'}</Descriptions.Item>
            </Descriptions>
            {car.description && (
              <Card size="small" title="Deskripsi" style={{ marginTop: 16 }}>
                {car.description}
              </Card>
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: 'documents',
      label: 'Dokumen',
      children: (
        <Table
          columns={documentColumns}
          dataSource={car.documents || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="Belum ada dokumen" /> }}
        />
      ),
    },
    {
      key: 'bookings',
      label: 'Riwayat Booking',
      children: (
        <Table
          columns={bookingColumns}
          dataSource={[]}
          rowKey="id"
          locale={{ emptyText: <Empty description="Belum ada riwayat booking" /> }}
        />
      ),
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      children: (
        <Table
          columns={maintenanceColumns}
          dataSource={[]}
          rowKey="id"
          locale={{ emptyText: <Empty description="Belum ada riwayat maintenance" /> }}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`${car.brand} ${car.model} (${car.plateNumber})`}
        subtitle={`Tahun ${car.year} - ${car.color}`}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Mobil', path: '/cars' },
          { title: `${car.brand} ${car.model}` },
        ]}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cars')}>Kembali</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/cars/${car.id}/edit`)}>Edit</Button>
        </Space>
      </PageHeader>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default CarDetailPage;
