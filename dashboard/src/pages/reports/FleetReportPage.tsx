import React from 'react';
import { Card, Row, Col, Table } from 'antd';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';

const statusData = [
  { name: 'Tersedia', value: 85, color: '#52c41a' },
  { name: 'Disewa', value: 45, color: '#1677ff' },
  { name: 'Perawatan', value: 12, color: '#faad14' },
  { name: 'Nonaktif', value: 8, color: '#d9d9d9' },
];

const categoryData = [
  { category: 'Sedan', count: 30 },
  { category: 'SUV', count: 35 },
  { category: 'MPV', count: 40 },
  { category: 'Hatchback', count: 20 },
  { category: 'Pickup', count: 10 },
  { category: 'Luxury', count: 15 },
];

const utilizationData = [
  { plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza', utilizationRate: 92, totalDaysRented: 280, revenue: 420000000 },
  { plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V', utilizationRate: 87, totalDaysRented: 260, revenue: 650000000 },
  { plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero', utilizationRate: 83, totalDaysRented: 250, revenue: 750000000 },
  { plateNumber: 'B 3456 JKL', brand: 'Toyota', model: 'Innova', utilizationRate: 78, totalDaysRented: 235, revenue: 470000000 },
  { plateNumber: 'B 7890 MNO', brand: 'Suzuki', model: 'Ertiga', utilizationRate: 75, totalDaysRented: 225, revenue: 337000000 },
  { plateNumber: 'B 2345 PQR', brand: 'Daihatsu', model: 'Xenia', utilizationRate: 70, totalDaysRented: 210, revenue: 315000000 },
  { plateNumber: 'B 6789 STU', brand: 'BMW', model: 'X5', utilizationRate: 65, totalDaysRented: 195, revenue: 975000000 },
  { plateNumber: 'B 0123 VWX', brand: 'Mercedes', model: 'C200', utilizationRate: 60, totalDaysRented: 180, revenue: 720000000 },
];

const FleetReportPage: React.FC = () => {
  const columns = [
    { title: 'Plat Nomor', dataIndex: 'plateNumber', key: 'plateNumber' },
    { title: 'Mobil', key: 'car', render: (_: any, r: any) => `${r.brand} ${r.model}` },
    {
      title: 'Utilisasi',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 100, height: 8, background: '#f0f0f0', borderRadius: 4 }}>
            <div style={{ width: `${v}%`, height: '100%', background: v > 80 ? '#52c41a' : v > 50 ? '#faad14' : '#ff4d4f', borderRadius: 4 }} />
          </div>
          <span>{v}%</span>
        </div>
      ),
    },
    { title: 'Hari Disewa', dataIndex: 'totalDaysRented', key: 'totalDaysRented' },
    { title: 'Pendapatan', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
  ];

  return (
    <div>
      <PageHeader
        title="Laporan Armada"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Laporan' }, { title: 'Armada' }]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Status Armada">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Mobil per Kategori">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1677ff" name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Utilisasi per Kendaraan">
        <Table columns={columns} dataSource={utilizationData} rowKey="plateNumber" pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default FleetReportPage;
