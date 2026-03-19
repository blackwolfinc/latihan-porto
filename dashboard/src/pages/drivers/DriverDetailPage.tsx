import React, { useState, useEffect } from 'react';
import { Card, Tabs, Descriptions, Table, Avatar, Rate, Row, Col, Button, Space, Spin, Empty, Statistic, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { driversService } from '@/services/drivers.service';
import type { Driver } from '@/types';

const DriverDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchDriver(id); }, [id]);

  const fetchDriver = async (driverId: string) => {
    try {
      const { data } = await driversService.getById(driverId);
      setDriver(data.data);
    } catch {
      message.error('Gagal memuat data driver');
      navigate('/drivers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!driver) return <Empty description="Driver tidak ditemukan" />;

  const tabItems = [
    {
      key: 'profile',
      label: 'Profil',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar size={120} src={driver.user?.avatar} icon={<UserOutlined />} />
            <div style={{ marginTop: 16 }}>
              <Rate disabled value={driver.rating || 0} allowHalf />
              <div style={{ marginTop: 8 }}>
                <Statistic title="Total Trip" value={driver.totalTrips} />
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
              <Descriptions.Item label="Nama">{driver.user?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{driver.user?.email}</Descriptions.Item>
              <Descriptions.Item label="Telepon">{driver.user?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusTag status={driver.status} type="driver" /></Descriptions.Item>
              <Descriptions.Item label="No. SIM">{driver.licenseNumber}</Descriptions.Item>
              <Descriptions.Item label="Tipe SIM">{driver.licenseType}</Descriptions.Item>
              <Descriptions.Item label="Masa Berlaku SIM">{dayjs(driver.licenseExpiry).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Cabang">{driver.branch?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Rating">{driver.rating || '-'}</Descriptions.Item>
              <Descriptions.Item label="Bergabung">{dayjs(driver.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      ),
    },
    {
      key: 'documents',
      label: 'Dokumen',
      children: (
        <Table
          columns={[
            { title: 'Tipe', dataIndex: 'type', key: 'type' },
            { title: 'Nomor', dataIndex: 'documentNumber', key: 'documentNumber' },
            { title: 'Kadaluarsa', dataIndex: 'expiryDate', key: 'expiryDate', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
            { title: 'File', dataIndex: 'fileUrl', key: 'fileUrl', render: (url: string) => url ? <a href={url} target="_blank" rel="noopener noreferrer">Lihat</a> : '-' },
          ]}
          dataSource={driver.documents || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="Belum ada dokumen" /> }}
        />
      ),
    },
    {
      key: 'trips',
      label: 'Riwayat Trip',
      children: (
        <Table
          columns={[
            { title: 'Booking', dataIndex: 'bookingNumber', key: 'bookingNumber' },
            { title: 'Customer', key: 'customer', render: (_: any, r: any) => r.customer?.name || '-' },
            { title: 'Mobil', key: 'car', render: (_: any, r: any) => r.car ? `${r.car.brand} ${r.car.model}` : '-' },
            { title: 'Tanggal', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
            { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} type="booking" /> },
          ]}
          dataSource={[]}
          rowKey="id"
          locale={{ emptyText: <Empty description="Belum ada riwayat trip" /> }}
        />
      ),
    },
    {
      key: 'reviews',
      label: 'Review',
      children: (
        <Table
          columns={[
            { title: 'Customer', key: 'customer', render: (_: any, r: any) => r.customer?.name || '-' },
            { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (r: number) => <Rate disabled value={r} allowHalf style={{ fontSize: 14 }} /> },
            { title: 'Komentar', dataIndex: 'comment', key: 'comment' },
            { title: 'Tanggal', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
          ]}
          dataSource={[]}
          rowKey="id"
          locale={{ emptyText: <Empty description="Belum ada review" /> }}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={driver.user?.name || 'Detail Driver'}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Driver', path: '/drivers' }, { title: driver.user?.name || 'Detail' }]}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/drivers')}>Kembali</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/drivers/${driver.id}/edit`)}>Edit</Button>
        </Space>
      </PageHeader>
      <Card><Tabs items={tabItems} /></Card>
    </div>
  );
};

export default DriverDetailPage;
