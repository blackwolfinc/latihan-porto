import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Space, Statistic, Spin, message } from 'antd';
import { DollarOutlined, ArrowUpOutlined, BarChartOutlined } from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { reportsService } from '@/services/reports.service';
import { branchesService } from '@/services/branches.service';
import type { Branch } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const mockRevenueData = [
  { date: 'Jan', revenue: 320000000, bookings: 42 },
  { date: 'Feb', revenue: 280000000, bookings: 38 },
  { date: 'Mar', revenue: 350000000, bookings: 45 },
  { date: 'Apr', revenue: 410000000, bookings: 52 },
  { date: 'May', revenue: 380000000, bookings: 48 },
  { date: 'Jun', revenue: 450000000, bookings: 55 },
  { date: 'Jul', revenue: 520000000, bookings: 62 },
  { date: 'Aug', revenue: 480000000, bookings: 58 },
  { date: 'Sep', revenue: 440000000, bookings: 53 },
  { date: 'Okt', revenue: 500000000, bookings: 60 },
  { date: 'Nov', revenue: 460000000, bookings: 56 },
  { date: 'Des', revenue: 530000000, bookings: 65 },
];

const mockBranchRevenue = [
  { branchName: 'Jakarta Pusat', revenue: 1200000000, bookings: 150 },
  { branchName: 'Jakarta Selatan', revenue: 980000000, bookings: 120 },
  { branchName: 'Bandung', revenue: 750000000, bookings: 95 },
  { branchName: 'Surabaya', revenue: 680000000, bookings: 85 },
  { branchName: 'Bali', revenue: 890000000, bookings: 110 },
];

const RevenueReportPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string | undefined>();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await branchesService.getAll({ limit: 100 });
      setBranches(data.data);
    } catch { /* silent */ }
  };

  const totalRevenue = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = mockRevenueData.reduce((sum, d) => sum + d.bookings, 0);
  const avgPerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return (
    <div>
      <PageHeader
        title="Laporan Pendapatan"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Laporan' }, { title: 'Pendapatan' }]}
      />

      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={12}>
        <RangePicker />
        <Select placeholder="Cabang" allowClear style={{ width: 200 }} onChange={setBranchFilter}>
          {branches.map((b) => <Option key={b.id} value={b.id}>{b.name}</Option>)}
        </Select>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Pendapatan" value={totalRevenue} prefix="Rp" formatter={(v) => Number(v).toLocaleString('id-ID')} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Rata-rata per Booking" value={avgPerBooking} prefix="Rp" precision={0} formatter={(v) => Number(v).toLocaleString('id-ID')} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Pertumbuhan" value={12.5} suffix="%" prefix={<ArrowUpOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Tren Pendapatan Bulanan">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} name="Pendapatan" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Pendapatan per Cabang">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mockBranchRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="branchName" width={120} />
                <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} />
                <Bar dataKey="revenue" fill="#1677ff" name="Pendapatan" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueReportPage;
