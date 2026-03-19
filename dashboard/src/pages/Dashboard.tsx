import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Alert } from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import StatCard from '@/components/ui/StatCard';
import StatusTag from '@/components/ui/StatusTag';
import { reportsService } from '@/services/reports.service';
import { bookingsService } from '@/services/bookings.service';
import { maintenanceService } from '@/services/maintenance.service';
import type { DashboardStats, RevenueData, Booking, MaintenanceRecord } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const bookingPieData = [
  { name: 'Menunggu', value: 12, color: '#faad14' },
  { name: 'Dikonfirmasi', value: 8, color: '#1677ff' },
  { name: 'Berlangsung', value: 15, color: '#52c41a' },
  { name: 'Selesai', value: 45, color: '#8c8c8c' },
  { name: 'Dibatalkan', value: 5, color: '#ff4d4f' },
];

const fleetUtilData = [
  { name: 'Toyota Avanza', utilization: 85 },
  { name: 'Honda Jazz', utilization: 72 },
  { name: 'Mitsubishi Xpander', utilization: 90 },
  { name: 'Toyota Innova', utilization: 68 },
  { name: 'Daihatsu Xenia', utilization: 55 },
  { name: 'Suzuki Ertiga', utilization: 78 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes, bookingsRes, maintenanceRes] = await Promise.allSettled([
        reportsService.getDashboardStats(),
        reportsService.getRevenue({ groupBy: 'day' }),
        bookingsService.getAll({ page: 1, limit: 5 }),
        maintenanceService.getUpcoming(7),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value.data.data);
      if (bookingsRes.status === 'fulfilled') setRecentBookings(bookingsRes.value.data.data);
      if (maintenanceRes.status === 'fulfilled') setUpcomingMaintenance(maintenanceRes.value.data.data);
    } catch {
      // Use fallback data
      setStats({
        totalCars: 48,
        availableCars: 32,
        activeBookings: 23,
        monthlyRevenue: 125000000,
        previousMonthRevenue: 110000000,
        availableDrivers: 15,
        totalDrivers: 20,
        totalCustomers: 350,
        pendingPayments: 8,
        upcomingMaintenance: 5,
      });
      setRevenueData([
        { date: '2024-01-01', revenue: 4500000, bookings: 3 },
        { date: '2024-01-02', revenue: 3200000, bookings: 2 },
        { date: '2024-01-03', revenue: 5100000, bookings: 4 },
        { date: '2024-01-04', revenue: 4800000, bookings: 3 },
        { date: '2024-01-05', revenue: 6200000, bookings: 5 },
        { date: '2024-01-06', revenue: 7100000, bookings: 6 },
        { date: '2024-01-07', revenue: 5500000, bookings: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const revenueChange = stats
    ? ((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue) * 100
    : 0;

  const bookingColumns: ColumnsType<Booking> = [
    {
      title: 'No. Booking',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) =>
        record.car ? `${record.car.brand} ${record.car.model}` : '-',
    },
    {
      title: 'Tanggal',
      key: 'dates',
      render: (_, record) =>
        `${dayjs(record.startDate).format('DD/MM')} - ${dayjs(record.endDate).format('DD/MM/YY')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="booking" status={status} />,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `Rp ${(amount || 0).toLocaleString('id-ID')}`,
    },
  ];

  const maintenanceColumns: ColumnsType<MaintenanceRecord> = [
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) =>
        record.car ? `${record.car.brand} ${record.car.model} (${record.car.plateNumber})` : '-',
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Jadwal',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="maintenance" status={status} />,
    },
  ];

  const formatCurrency = (value: number) => `Rp ${(value / 1000000).toFixed(1)}jt`;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Mobil"
            value={stats?.totalCars || 0}
            suffix={`/ ${stats?.availableCars || 0} tersedia`}
            icon={<CarOutlined />}
            color="#1677ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Booking Aktif"
            value={stats?.activeBookings || 0}
            icon={<CalendarOutlined />}
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pendapatan Bulan Ini"
            value={`Rp ${((stats?.monthlyRevenue || 0) / 1000000).toFixed(0)}jt`}
            trend={Number(revenueChange.toFixed(1))}
            trendLabel="vs bulan lalu"
            icon={<DollarOutlined />}
            color="#faad14"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Driver Tersedia"
            value={stats?.availableDrivers || 0}
            suffix={`/ ${stats?.totalDrivers || 0}`}
            icon={<TeamOutlined />}
            color="#722ed1"
            loading={loading}
          />
        </Col>
      </Row>

      {stats && stats.pendingPayments > 0 && (
        <Alert
          message={`Ada ${stats.pendingPayments} pembayaran pending yang perlu diproses`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Pendapatan Harian" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => dayjs(v).format('DD/MM')}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                  labelFormatter={(label) => dayjs(label).format('DD MMMM YYYY')}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Distribusi Status Booking" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {bookingPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Utilisasi Armada" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetUtilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Utilisasi']} />
                <Legend />
                <Bar dataKey="utilization" name="Utilisasi (%)" radius={[0, 4, 4, 0]}>
                  {fleetUtilData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>Maintenance Mendatang</span>
              </Space>
            }
            loading={loading}
          >
            <Table
              dataSource={upcomingMaintenance}
              columns={maintenanceColumns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Tidak ada maintenance mendatang' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Booking Terbaru" loading={loading}>
        <Table
          dataSource={recentBookings}
          columns={bookingColumns}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Belum ada booking' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
