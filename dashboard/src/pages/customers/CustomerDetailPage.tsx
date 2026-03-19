import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Row, Col, Statistic, Button, Space, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { customersService } from '@/services/customers.service';
import type { User, Booking } from '@/types';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalSpent: number; averageRating: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
      fetchBookings(id);
      fetchStats(id);
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    try {
      const { data } = await customersService.getById(customerId);
      setCustomer(data.data);
    } catch {
      message.error('Gagal memuat data customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (customerId: string) => {
    try {
      const { data } = await customersService.getBookingHistory(customerId);
      setBookings(data.data);
    } catch { /* silent */ }
  };

  const fetchStats = async (customerId: string) => {
    try {
      const { data } = await customersService.getStats(customerId);
      setStats(data.data);
    } catch { /* silent */ }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!customer) return <Empty description="Customer tidak ditemukan" />;

  const bookingColumns = [
    { title: 'ID', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    { title: 'Mobil', key: 'car', render: (_: any, r: Booking) => r.car ? `${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Mulai', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Selesai', dataIndex: 'endDate', key: 'endDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} type="booking" /> },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (a: number) => `Rp ${a?.toLocaleString('id-ID')}` },
  ];

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Customer', path: '/customers' }, { title: customer.name }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>Kembali</Button>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Informasi Customer">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nama">{customer.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
              <Descriptions.Item label="Telepon">{customer.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Bergabung">{dayjs(customer.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
            </Descriptions>
          </Card>
          {stats && (
            <Card style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}><Statistic title="Total Booking" value={stats.totalBookings} /></Col>
                <Col span={8}><Statistic title="Total Spent" value={stats.totalSpent} prefix="Rp" formatter={(val) => Number(val).toLocaleString('id-ID')} /></Col>
                <Col span={8}><Statistic title="Avg Rating" value={stats.averageRating} precision={1} /></Col>
              </Row>
            </Card>
          )}
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Riwayat Booking">
            <Table
              columns={bookingColumns}
              dataSource={bookings}
              rowKey="id"
              size="small"
              locale={{ emptyText: <Empty description="Belum ada riwayat booking" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDetailPage;
