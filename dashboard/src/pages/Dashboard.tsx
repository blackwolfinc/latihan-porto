import React from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Alert } from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area,
} from 'recharts';
import dayjs from 'dayjs';
import StatCard from '@/components/ui/StatCard';
import StatusTag from '@/components/ui/StatusTag';
import type { Booking, MaintenanceRecord } from '@/types';

const { Title, Text } = Typography;

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const revenueData = [
  { month: 'Jan', revenue: 320, bookings: 42, invoices: 38 },
  { month: 'Feb', revenue: 280, bookings: 38, invoices: 35 },
  { month: 'Mar', revenue: 350, bookings: 45, invoices: 42 },
  { month: 'Apr', revenue: 410, bookings: 52, invoices: 48 },
  { month: 'May', revenue: 380, bookings: 48, invoices: 45 },
  { month: 'Jun', revenue: 450, bookings: 55, invoices: 52 },
  { month: 'Jul', revenue: 520, bookings: 62, invoices: 58 },
  { month: 'Aug', revenue: 480, bookings: 58, invoices: 55 },
  { month: 'Sep', revenue: 440, bookings: 53, invoices: 50 },
  { month: 'Okt', revenue: 500, bookings: 60, invoices: 57 },
  { month: 'Nov', revenue: 460, bookings: 56, invoices: 53 },
  { month: 'Des', revenue: 530, bookings: 65, invoices: 61 },
];

const bookingStatusData = [
  { name: 'Berlangsung', value: 23, color: '#66bb6a' },
  { name: 'Dikonfirmasi', value: 15, color: '#42a5f5' },
  { name: 'Menunggu', value: 8, color: '#ffca28' },
  { name: 'Selesai', value: 120, color: '#bdbdbd' },
  { name: 'Dibatalkan', value: 5, color: '#ef5350' },
];

const fleetData = [
  { category: 'Sedan', total: 30, rented: 18 },
  { category: 'SUV', total: 35, rented: 28 },
  { category: 'MPV', total: 40, rented: 32 },
  { category: 'Hatchback', total: 20, rented: 10 },
  { category: 'Pickup', total: 10, rented: 6 },
  { category: 'Luxury', total: 15, rented: 12 },
];

const invoiceTrendData = [
  { month: 'Jan', paid: 280, unpaid: 40 },
  { month: 'Feb', paid: 250, unpaid: 30 },
  { month: 'Mar', paid: 310, unpaid: 40 },
  { month: 'Apr', paid: 370, unpaid: 40 },
  { month: 'May', paid: 340, unpaid: 40 },
  { month: 'Jun', paid: 410, unpaid: 40 },
  { month: 'Jul', paid: 470, unpaid: 50 },
  { month: 'Aug', paid: 430, unpaid: 50 },
  { month: 'Sep', paid: 400, unpaid: 40 },
  { month: 'Okt', paid: 460, unpaid: 40 },
  { month: 'Nov', paid: 420, unpaid: 40 },
  { month: 'Des', paid: 490, unpaid: 40 },
];

const recentBookings: Partial<Booking>[] = [
  { id: '1', bookingNumber: 'BK-2026001', customer: { name: 'Budi Santoso' } as any, car: { brand: 'Toyota', model: 'Avanza' } as any, startDate: '2026-03-15', status: 'ONGOING' as any, totalAmount: 1500000 },
  { id: '2', bookingNumber: 'BK-2026002', customer: { name: 'Siti Rahayu' } as any, car: { brand: 'Honda', model: 'CR-V' } as any, startDate: '2026-03-14', status: 'CONFIRMED' as any, totalAmount: 2500000 },
  { id: '3', bookingNumber: 'BK-2026003', customer: { name: 'Ahmad Hidayat' } as any, car: { brand: 'Mitsubishi', model: 'Pajero' } as any, startDate: '2026-03-13', status: 'PENDING' as any, totalAmount: 3000000 },
  { id: '4', bookingNumber: 'BK-2026004', customer: { name: 'Dewi Lestari' } as any, car: { brand: 'Toyota', model: 'Innova' } as any, startDate: '2026-03-12', status: 'COMPLETED' as any, totalAmount: 1800000 },
  { id: '5', bookingNumber: 'BK-2026005', customer: { name: 'Rudi Hartono' } as any, car: { brand: 'Suzuki', model: 'Ertiga' } as any, startDate: '2026-03-11', status: 'ONGOING' as any, totalAmount: 1200000 },
  { id: '6', bookingNumber: 'BK-2026006', customer: { name: 'Rina Wati' } as any, car: { brand: 'Daihatsu', model: 'Xenia' } as any, startDate: '2026-03-10', status: 'COMPLETED' as any, totalAmount: 1000000 },
  { id: '7', bookingNumber: 'BK-2026007', customer: { name: 'Joko Prasetyo' } as any, car: { brand: 'BMW', model: 'X3' } as any, startDate: '2026-03-09', status: 'COMPLETED' as any, totalAmount: 5000000 },
  { id: '8', bookingNumber: 'BK-2026008', customer: { name: 'Maya Sari' } as any, car: { brand: 'Mercedes-Benz', model: 'C200' } as any, startDate: '2026-03-08', status: 'COMPLETED' as any, totalAmount: 4000000 },
];

const upcomingMaintenance: Partial<MaintenanceRecord>[] = [
  { id: '1', car: { plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza' } as any, type: 'ROUTINE' as any, scheduledDate: '2026-03-22', description: 'Service berkala 10.000km' },
  { id: '2', car: { plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V' } as any, type: 'INSPECTION' as any, scheduledDate: '2026-03-25', description: 'Perpanjangan KIR' },
  { id: '3', car: { plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero' } as any, type: 'TIRE' as any, scheduledDate: '2026-03-20', description: 'Ganti ban depan' },
];

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '1px solid #e0e0e0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#263238', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 12, color: p.color, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `Rp ${p.value}jt` : p.value}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Dashboard: React.FC = () => {
  const bookingColumns = [
    { title: 'No. Booking', dataIndex: 'bookingNumber', key: 'bookingNumber', width: 130, render: (v: string) => <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text> },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => <Text style={{ fontSize: 13 }}>{record.customer?.name}</Text>,
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_: any, record: any) => <Text style={{ fontSize: 13 }}>{record.car?.brand} {record.car?.model}</Text>,
    },
    {
      title: 'Tanggal',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => <Text style={{ fontSize: 13 }}>{dayjs(date).format('DD MMM YYYY')}</Text>,
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
      align: 'right' as const,
      render: (amount: number) => <Text style={{ fontSize: 13, fontWeight: 600 }}>Rp {amount.toLocaleString('id-ID')}</Text>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>Laporan & Analisa</Title>
        <Text type="secondary">Overview performa bisnis Caritahub Rental</Text>
      </div>

      {/* KPI Cards - 5 cards including invoice */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<CarOutlined />} title="Total Armada" value={150} trend={5} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<CalendarOutlined />} title="Booking Aktif" value={23} trend={12} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<DollarOutlined />} title="Pendapatan Bulan Ini" value="530jt" prefix="Rp" trend={8.5} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<FileTextOutlined />} title="Invoice Belum Dibayar" value={15} trend={-10} />
        </Col>
      </Row>

      {/* Invoice alert */}
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message={<Text strong>3 invoice melewati jatuh tempo</Text>}
        description="Terdapat invoice yang belum dibayar dan melewati tanggal jatuh tempo. Segera tindak lanjuti untuk menjaga arus kas."
        style={{ marginBottom: 24, borderRadius: 8 }}
        closable
      />

      {/* Charts row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<Text style={{ fontWeight: 600 }}>Pendapatan & Booking Bulanan</Text>}
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#1565c0" strokeWidth={2.5} dot={{ r: 3 }} name="Pendapatan (jt)" />
                <Line type="monotone" dataKey="bookings" stroke="#66bb6a" strokeWidth={2} dot={{ r: 3 }} name="Jumlah Booking" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Text style={{ fontWeight: 600 }}>Status Booking</Text>}
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#bdbdbd' }}
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ fontWeight: 600 }}>Utilisasi Armada per Kategori</Text>}
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="#42a5f5" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rented" fill="#66bb6a" name="Disewa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ fontWeight: 600 }}>Tren Invoice (juta Rp)</Text>}
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={invoiceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78909c' }} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="paid" stackId="1" stroke="#66bb6a" fill="#e8f5e9" name="Dibayar (jt)" />
                <Area type="monotone" dataKey="unpaid" stackId="1" stroke="#ef5350" fill="#fce4ec" name="Belum Dibayar (jt)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Maintenance + Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<Text style={{ fontWeight: 600 }}>Booking Terbaru</Text>}
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 0 } }}
          >
            <Table
              columns={bookingColumns}
              dataSource={recentBookings}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#e65100' }} />
                <Text style={{ fontWeight: 600 }}>Maintenance Mendatang</Text>
              </Space>
            }
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            {upcomingMaintenance.map((item) => (
              <Alert
                key={item.id}
                type="warning"
                showIcon
                style={{ marginBottom: 8, borderRadius: 6 }}
                message={
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>
                    {item.car?.plateNumber} - {item.car?.brand} {item.car?.model}
                  </Text>
                }
                description={
                  <Text style={{ fontSize: 12 }}>
                    {item.description} &middot; {dayjs(item.scheduledDate).format('DD MMM YYYY')}
                  </Text>
                }
              />
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
