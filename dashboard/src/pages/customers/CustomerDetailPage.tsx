import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Avatar, Typography, Row, Col, Statistic, Rate, message } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { customersService } from '@/services/customers.service';
import type { User, Booking } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

const CustomerDetailPage: React.FC = () => {
  const [customer, setCustomer] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalSpent: number; averageRating: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customerRes, bookingsRes, statsRes] = await Promise.allSettled([
        customersService.getById(id!),
        customersService.getBookingHistory(id!),
        customersService.getStats(id!),
      ]);
      if (customerRes.status === 'fulfilled') setCustomer(customerRes.value.data.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    } catch {
      message.error('Gagal memuat data customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns: ColumnsType<Booking> = [
    { title: 'No. Booking', dataIndex: 'bookingNumber', key: 'bookingNumber' },
    { title: 'Mobil', key: 'car', render: (_, r) => r.car ? `${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Tanggal', dataIndex: 'startDate', key: 'startDate', render: (d) => dayjs(d).format('DD MMM YYYY') },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (a) => `Rp ${(a || 0).toLocaleString('id-ID')}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusTag type="booking" status={s} /> },
  ];

  if (loading || !customer) return <Card loading />;

  return (
    <div>
      <PageHeader title={`Customer: ${customer.name}`} subtitle={customer.email} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar src={customer.avatar} icon={<UserOutlined />} size={80} />
              <Typography.Title level={5} style={{ margin: '12px 0 4px' }}>{customer.name}</Typography.Title>
              <Text type="secondary">{customer.email}</Text>
              <br />
              <Text type="secondary">{customer.phone || '-'}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card><Statistic title="Total Booking" value={stats?.totalBookings || 0} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={24} md={6}>
          <Card><Statistic title="Total Pengeluaran" value={stats?.totalSpent || 0} prefix="Rp" formatter={(v) => `${Number(v).toLocaleString('id-ID')}`} /></Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Rata-rata Rating" value={stats?.averageRating || 0} precision={1} prefix={<StarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="Riwayat Booking">
        <Table
          columns={bookingColumns}
          dataSource={bookings}
          rowKey="id"
          locale={{ emptyText: 'Belum ada riwayat booking' }}
        />
      </Card>
    </div>
  );
};

export default CustomerDetailPage;
