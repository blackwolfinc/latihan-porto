import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Space, Table, Statistic, message, Typography } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { reportsService, type ReportFilters } from '@/services/reports.service';
import { branchesService } from '@/services/branches.service';
import type { RevenueData, Branch } from '@/types';

const { RangePicker } = DatePicker;

const RevenueReportPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueByBranch, setRevenueByBranch] = useState<{ branchName: string; revenue: number; bookings: number }[]>([]);
  const [revenueByCar, setRevenueByCar] = useState<{ plateNumber: string; brand: string; model: string; revenue: number }[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({ groupBy: 'day' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBranches(); }, []);
  useEffect(() => { loadData(); }, [filters]);

  const loadBranches = async () => {
    try { const { data } = await branchesService.getAll({ limit: 100 }); setBranches(data.data); } catch { /* */ }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [revenueRes, byBranchRes, byCarRes] = await Promise.allSettled([
        reportsService.getRevenue(filters),
        reportsService.getRevenueByBranch(filters),
        reportsService.getRevenueByCar(filters),
      ]);
      if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value.data.data);
      if (byBranchRes.status === 'fulfilled') setRevenueByBranch(byBranchRes.value.data.data);
      if (byCarRes.status === 'fulfilled') setRevenueByCar(byCarRes.value.data.data);
    } catch { message.error('Gagal memuat data laporan'); } finally { setLoading(false); }
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = revenueData.reduce((sum, d) => sum + d.bookings, 0);

  return (
    <div>
      <PageHeader title="Laporan Pendapatan" subtitle="Analisis pendapatan rental" />

      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker onChange={(dates) => {
          if (dates) setFilters((p) => ({ ...p, startDate: dates[0]?.toISOString(), endDate: dates[1]?.toISOString() }));
          else setFilters((p) => ({ ...p, startDate: undefined, endDate: undefined }));
        }} />
        <Select value={filters.groupBy} onChange={(v) => setFilters((p) => ({ ...p, groupBy: v }))} style={{ width: 120 }} options={[{ label: 'Harian', value: 'day' }, { label: 'Mingguan', value: 'week' }, { label: 'Bulanan', value: 'month' }]} />
        <Select placeholder="Cabang" allowClear style={{ width: 200 }} onChange={(v) => setFilters((p) => ({ ...p, branchId: v }))} options={branches.map((b) => ({ label: b.name, value: b.id }))} />
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title="Total Pendapatan" value={totalRevenue} prefix="Rp" formatter={(v) => Number(v).toLocaleString('id-ID')} loading={loading} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Total Booking" value={totalBookings} loading={loading} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Rata-rata/Hari" value={revenueData.length ? Math.round(totalRevenue / revenueData.length) : 0} prefix="Rp" formatter={(v) => Number(v).toLocaleString('id-ID')} loading={loading} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Rata-rata/Booking" value={totalBookings ? Math.round(totalRevenue / totalBookings) : 0} prefix="Rp" formatter={(v) => Number(v).toLocaleString('id-ID')} loading={loading} /></Card>
        </Col>
      </Row>

      <Card title="Tren Pendapatan" loading={loading} style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(v) => dayjs(v).format('DD/MM')} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} labelFormatter={(l) => dayjs(l).format('DD MMMM YYYY')} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} name="Pendapatan" />
            <Line type="monotone" dataKey="bookings" stroke="#52c41a" strokeWidth={2} name="Booking" yAxisId={0} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Pendapatan per Cabang" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} />
                <Bar dataKey="revenue" fill="#1677ff" name="Pendapatan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 10 Mobil" loading={loading}>
            <Table
              dataSource={revenueByCar.slice(0, 10)}
              rowKey="plateNumber"
              pagination={false}
              size="small"
              columns={[
                { title: 'Mobil', key: 'car', render: (_, r) => `${r.brand} ${r.model} (${r.plateNumber})` },
                { title: 'Pendapatan', dataIndex: 'revenue', key: 'revenue', render: (v) => `Rp ${(v || 0).toLocaleString('id-ID')}` },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueReportPage;
