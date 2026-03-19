import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Alert, Spin } from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import StatCard from '@/components/ui/StatCard';
import StatusTag from '@/components/ui/StatusTag';
import type { Booking, MaintenanceRecord } from '@/types';

const { Title, Text } = Typography;

const revenueData = [
  { month: 'Jan', revenue: 320, bookings: 42 },
  { month: 'Feb', revenue: 280, bookings: 38 },
  { month: 'Mar', revenue: 350, bookings: 45 },
  { month: 'Apr', revenue: 410, bookings: 52 },
  { month: 'May', revenue: 380, bookings: 48 },
  { month: 'Jun', revenue: 450, bookings: 55 },
  { month: 'Jul', revenue: 520, bookings: 62 },
  { month: 'Aug', revenue: 480, bookings: 58 },
  { month: 'Sep', revenue: 440, bookings: 53 },
  { month: 'Okt', revenue: 500, bookings: 60 },
  { month: 'Nov', revenue: 460, bookings: 56 },
  { month: 'Des', revenue: 530, bookings: 65 },
];

const bookingStatusData = [
  { name: 'Berlangsung', value: 23, color: '#52c41a' },
  { name: 'Dikonfirmasi', value: 15, color: '#1677ff' },
  { name: 'Menunggu', value: 8, color: '#faad14' },
  { name: 'Selesai', value: 120, color: '#d9d9d9' },
  { name: 'Dibatalkan', value: 5, color: '#ff4d4f' },
];

const fleetData = [
  { category: 'Sedan', total: 30, rented: 18 },
  { category: 'SUV', total: 35, rented: 28 },
  { category: 'MPV', total: 40, rented: 32 },
  { category: 'Hatchback', total: 20, rented: 10 },
  { category: 'Pickup', total: 10, rented: 6 },
  { category: 'Luxury', total: 15, rented: 12 },
];

const recentBookings: Partial<Booking>[] = [
  { id: '1', bookingNumber: 'BK-2024001', customer: { name: 'Budi Santoso' } as any, car: { brand: 'Toyota', model: 'Avanza' } as any, startDate: '2024-01-15', status: 'ONGOING' as any, totalAmount: 1500000 },
  { id: '2', bookingNumber: 'BK-2024002', customer: { name: 'Siti Rahayu' } as any, car: { brand: 'Honda', model: 'CR-V' } as any, startDate: '2024-01-14', status: 'CONFIRMED' as any, totalAmount: 2500000 },
  { id: '3', bookingNumber: 'BK-2024003', customer: { name: 'Ahmad Hidayat' } as any, car: { brand: 'Mitsubishi', model: 'Pajero' } as any, startDate: '2024-01-13', status: 'PENDING' as any, totalAmount: 3000000 },
  { id: '4', bookingNumber: 'BK-2024004', customer: { name: 'Dewi Lestari' } as any, car: { brand: 'Toyota', model: 'Innova' } as any, startDate: '2024-01-12', status: 'COMPLETED' as any, totalAmount: 1800000 },
  { id: '5', bookingNumber: 'BK-2024005', customer: { name: 'Rudi Hartono' } as any, car: { brand: 'Suzuki', model: 'Ertiga' } as any, startDate: '2024-01-11', status: 'ONGOING' as any, totalAmount: 1200000 },
  { id: '6', bookingNumber: 'BK-2024006', customer: { name: 'Rina Wati' } as any, car: { brand: 'Daihatsu', model: 'Xenia' } as any, startDate: '2024-01-10', status: 'COMPLETED' as any, totalAmount: 1000000 },
  { id: '7', bookingNumber: 'BK-2024007', customer: { name: 'Joko Widodo' } as any, car: { brand: 'BMW', model: 'X5' } as any, startDate: '2024-01-09', status: 'CANCELLED' as any, totalAmount: 5000000 },
  { id: '8', bookingNumber: 'BK-2024008', customer: { name: 'Maya Sari' } as any, car: { brand: 'Mercedes', model: 'C200' } as any, startDate: '2024-01-08', status: 'COMPLETED' as any, totalAmount: 4000000 },
  { id: '9', bookingNumber: 'BK-2024009', customer: { name: 'Agus Pratama' } as any, car: { brand: 'Honda', model: 'Brio' } as any, startDate: '2024-01-07', status: 'COMPLETED' as any, totalAmount: 800000 },
  { id: '10', bookingNumber: 'BK-2024010', customer: { name: 'Linda Susanti' } as any, car: { brand: 'Toyota', model: 'Fortuner' } as any, startDate: '2024-01-06', status: 'COMPLETED' as any, totalAmount: 3500000 },
];

const upcomingMaintenance: Partial<MaintenanceRecord>[] = [
  { id: '1', car: { plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza' } as any, type: 'ROUTINE' as any, scheduledDate: '2024-01-20', description: 'Service berkala 10.000km' },
  { id: '2', car: { plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V' } as any, type: 'INSPECTION' as any, scheduledDate: '2024-01-22', description: 'Perpanjangan KIR' },
  { id: '3', car: { plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero' } as any, type: 'TIRE' as any, scheduledDate: '2024-01-18', description: 'Ganti ban depan' },
];

const Dashboard: React.FC = () => {
  const bookingColumns = [
    { title: 'ID', dataIndex: 'bookingNumber', key: 'bookingNumber', width: 130 },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => record.customer?.name,
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_: any, record: any) => `${record.car?.brand} ${record.car?.model}`,
    },
    {
      title: 'Tanggal',
      dataIndex: 'startDate',
      key: 'startDate',
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
      render: (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CarOutlined />}
            title="Total Mobil"
            value={150}
            trend={5}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            title="Booking Aktif"
            value={23}
            trend={12}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DollarOutlined />}
            title="Pendapatan Bulan Ini"
            value="450jt"
            prefix="Rp"
            trend={8.5}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<TeamOutlined />}
            title="Driver Tersedia"
            value={12}
            trend={-3}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Pendapatan Bulanan (dalam juta Rp)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Rp ${value}jt`, 'Pendapatan']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} name="Pendapatan (jt)" />
                <Line type="monotone" dataKey="bookings" stroke="#52c41a" strokeWidth={2} name="Jumlah Booking" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Status Booking">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Utilisasi Armada per Kategori">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1677ff" name="Total" />
                <Bar dataKey="rented" fill="#52c41a" name="Disewa" />
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
          >
            {upcomingMaintenance.map((item) => (
              <Alert
                key={item.id}
                type="warning"
                showIcon
                style={{ marginBottom: 8 }}
                message={`${item.car?.plateNumber} - ${item.car?.brand} ${item.car?.model}`}
                description={`${item.description} | Jadwal: ${dayjs(item.scheduledDate).format('DD/MM/YYYY')}`}
              />
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="Booking Terbaru">
        <Table
          columns={bookingColumns}
          dataSource={recentBookings}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
