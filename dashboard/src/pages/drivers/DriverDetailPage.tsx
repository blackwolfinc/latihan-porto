import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tabs, Table, Tag, Rate, Button, Space, message, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { driversService } from '@/services/drivers.service';
import type { Driver, DriverDocument, Booking, Review } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

const DriverDetailPage: React.FC = () => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadDriver();
  }, [id]);

  const loadDriver = async () => {
    setLoading(true);
    try {
      const { data } = await driversService.getById(id!);
      setDriver(data.data);
    } catch {
      message.error('Gagal memuat data driver');
      navigate('/drivers');
    } finally {
      setLoading(false);
    }
  };

  const docColumns: ColumnsType<DriverDocument> = [
    { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Nomor', dataIndex: 'documentNumber', key: 'documentNumber' },
    { title: 'Kadaluarsa', dataIndex: 'expiryDate', key: 'expiryDate', render: (d) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'File', dataIndex: 'fileUrl', key: 'fileUrl', render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">Lihat</a> : '-' },
  ];

  const tripColumns: ColumnsType<Booking> = [
    { title: 'No. Booking', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: 'Mobil', key: 'car', render: (_, r) => r.car ? `${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Tanggal', dataIndex: 'startDate', key: 'startDate', render: (d) => dayjs(d).format('DD MMM YYYY') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusTag type="booking" status={s} /> },
  ];

  const reviewColumns: ColumnsType<Review> = [
    { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (r) => <Rate disabled value={r} allowHalf style={{ fontSize: 14 }} /> },
    { title: 'Komentar', dataIndex: 'comment', key: 'comment', ellipsis: true },
    { title: 'Tanggal', dataIndex: 'createdAt', key: 'createdAt', render: (d) => dayjs(d).format('DD MMM YYYY') },
  ];

  if (loading || !driver) return <Card loading />;

  const tabItems = [
    {
      key: 'info',
      label: 'Informasi',
      children: (
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Nama">{driver.user?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{driver.user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Telepon">{driver.user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusTag type="driver" status={driver.status} /></Descriptions.Item>
          <Descriptions.Item label="No. SIM">{driver.licenseNumber}</Descriptions.Item>
          <Descriptions.Item label="Tipe SIM">{driver.licenseType}</Descriptions.Item>
          <Descriptions.Item label="Exp. SIM">{dayjs(driver.licenseExpiry).format('DD MMMM YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Rating">
            {driver.rating ? <Rate disabled value={driver.rating} allowHalf /> : 'Belum ada rating'}
          </Descriptions.Item>
          <Descriptions.Item label="Total Trip">{driver.totalTrips}</Descriptions.Item>
          <Descriptions.Item label="Cabang">{driver.branch?.name || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'documents',
      label: 'Dokumen',
      children: <Table dataSource={driver.documents || []} columns={docColumns} rowKey="id" pagination={false} locale={{ emptyText: 'Belum ada dokumen' }} />,
    },
    {
      key: 'trips',
      label: 'Riwayat Trip',
      children: <Table dataSource={[]} columns={tripColumns} rowKey="id" locale={{ emptyText: 'Belum ada riwayat trip' }} />,
    },
    {
      key: 'reviews',
      label: 'Review',
      children: <Table dataSource={[]} columns={reviewColumns} rowKey="id" locale={{ emptyText: 'Belum ada review' }} />,
    },
  ];

  return (
    <div>
      <PageHeader title={`Driver: ${driver.user?.name || '-'}`} subtitle={`SIM: ${driver.licenseNumber}`}>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/drivers/${driver.id}/edit`)}>
          Edit
        </Button>
      </PageHeader>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default DriverDetailPage;
