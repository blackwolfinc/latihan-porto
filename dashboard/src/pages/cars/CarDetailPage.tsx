import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Tag,
  Image,
  Row,
  Col,
  Button,
  Space,
  message,
  Typography,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { carsService } from '@/services/cars.service';
import type { Car, Booking, MaintenanceRecord, CarDocument } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

const CarDetailPage: React.FC = () => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    setLoading(true);
    try {
      const { data } = await carsService.getById(id!);
      setCar(data.data);
    } catch {
      message.error('Gagal memuat data mobil');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const documentColumns: ColumnsType<CarDocument> = [
    { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Nomor Dokumen', dataIndex: 'documentNumber', key: 'documentNumber' },
    {
      title: 'Kadaluarsa',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => (date ? dayjs(date).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">Lihat</a> : '-',
    },
  ];

  const bookingColumns: ColumnsType<Booking> = [
    { title: 'No. Booking', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusTag type="booking" status={s} />,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (a) => `Rp ${(a || 0).toLocaleString('id-ID')}`,
    },
  ];

  const maintenanceColumns: ColumnsType<MaintenanceRecord> = [
    { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description' },
    {
      title: 'Tanggal',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Biaya',
      dataIndex: 'cost',
      key: 'cost',
      render: (c) => `Rp ${(c || 0).toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusTag type="maintenance" status={s} />,
    },
  ];

  if (loading || !car) {
    return <Card loading={true} />;
  }

  const tabItems = [
    {
      key: 'info',
      label: 'Informasi',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Image
              src={car.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
              style={{ borderRadius: 8, width: '100%' }}
            />
          </Col>
          <Col xs={24} md={16}>
            <Descriptions bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Plat Nomor"><Text strong>{car.plateNumber}</Text></Descriptions.Item>
              <Descriptions.Item label="Merk & Model">{car.brand} {car.model}</Descriptions.Item>
              <Descriptions.Item label="Tahun">{car.year}</Descriptions.Item>
              <Descriptions.Item label="Warna">{car.color}</Descriptions.Item>
              <Descriptions.Item label="Kategori"><Tag color="blue">{car.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="Transmisi">{car.transmission}</Descriptions.Item>
              <Descriptions.Item label="Bahan Bakar">{car.fuelType}</Descriptions.Item>
              <Descriptions.Item label="Kapasitas Mesin">{car.engineCapacity} cc</Descriptions.Item>
              <Descriptions.Item label="Jumlah Kursi">{car.seats}</Descriptions.Item>
              <Descriptions.Item label="Kilometer">{(car.mileage || 0).toLocaleString('id-ID')} km</Descriptions.Item>
              <Descriptions.Item label="Harga/Hari">Rp {(car.pricePerDay || 0).toLocaleString('id-ID')}</Descriptions.Item>
              <Descriptions.Item label="Harga/Jam">{car.pricePerHour ? `Rp ${car.pricePerHour.toLocaleString('id-ID')}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusTag type="car" status={car.status} /></Descriptions.Item>
              <Descriptions.Item label="Cabang">{car.branch?.name || '-'}</Descriptions.Item>
            </Descriptions>
            {car.features && car.features.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Fitur:</Text>
                <div style={{ marginTop: 8 }}>
                  {car.features.map((f, i) => <Tag key={i}>{f}</Tag>)}
                </div>
              </div>
            )}
            {car.description && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Deskripsi:</Text>
                <p>{car.description}</p>
              </div>
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
          dataSource={car.documents || []}
          columns={documentColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Belum ada dokumen' }}
        />
      ),
    },
    {
      key: 'bookings',
      label: 'Riwayat Booking',
      children: (
        <Table
          dataSource={[]}
          columns={bookingColumns}
          rowKey="id"
          locale={{ emptyText: 'Belum ada riwayat booking' }}
        />
      ),
    },
    {
      key: 'maintenance',
      label: 'Riwayat Maintenance',
      children: (
        <Table
          dataSource={[]}
          columns={maintenanceColumns}
          rowKey="id"
          locale={{ emptyText: 'Belum ada riwayat maintenance' }}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`${car.brand} ${car.model} - ${car.plateNumber}`}
        showBack
        extra={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/cars/${car.id}/edit`)}>
              Edit
            </Button>
          </Space>
        }
      />
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default CarDetailPage;
