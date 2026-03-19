import React, { useEffect, useState } from 'react';
import { Card, Select, DatePicker, Row, Col, Space, Spin, Table } from 'antd';
import { DollarOutlined, BankOutlined } from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { reportsService, type ReportFilters } from '@/services/reports.service';
import { branchesService } from '@/services/branches.service';
import type { Branch, ExpenseSummary } from '@/types';

const { RangePicker } = DatePicker;

const CATEGORY_COLORS: Record<string, string> = {
  FUEL: '#1677ff',
  MAINTENANCE: '#faad14',
  INSURANCE: '#52c41a',
  TAX: '#722ed1',
  SALARY: '#13c2c2',
  RENT: '#eb2f96',
  UTILITIES: '#fa8c16',
  OTHER: '#8c8c8c',
};

const CATEGORY_LABELS: Record<string, string> = {
  FUEL: 'BBM',
  MAINTENANCE: 'Perawatan',
  INSURANCE: 'Asuransi',
  TAX: 'Pajak',
  SALARY: 'Gaji',
  RENT: 'Sewa',
  UTILITIES: 'Utilitas',
  OTHER: 'Lainnya',
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const mockExpenseByCategory: ExpenseSummary[] = [
  { category: 'FUEL', total: 28000000, count: 45, percentage: 22 },
  { category: 'MAINTENANCE', total: 35000000, count: 18, percentage: 27 },
  { category: 'INSURANCE', total: 18000000, count: 6, percentage: 14 },
  { category: 'TAX', total: 12000000, count: 8, percentage: 9 },
  { category: 'SALARY', total: 25000000, count: 10, percentage: 19 },
  { category: 'RENT', total: 8000000, count: 2, percentage: 6 },
  { category: 'UTILITIES', total: 3000000, count: 5, percentage: 2 },
  { category: 'OTHER', total: 1500000, count: 3, percentage: 1 },
];

const mockExpenseByBranch = [
  { branchName: 'Jakarta Pusat', total: 42000000, fuel: 12000000, maintenance: 15000000, other: 15000000 },
  { branchName: 'Jakarta Selatan', total: 35000000, fuel: 9000000, maintenance: 12000000, other: 14000000 },
  { branchName: 'Bandung', total: 25000000, fuel: 7000000, maintenance: 8000000, other: 10000000 },
  { branchName: 'Surabaya', total: 18000000, fuel: 5000000, maintenance: 6000000, other: 7000000 },
  { branchName: 'Yogyakarta', total: 10500000, fuel: 3000000, maintenance: 4000000, other: 3500000 },
];

const ExpenseReportPage: React.FC = () => {
  const [expenseByCategory, setExpenseByCategory] = useState<ExpenseSummary[]>(mockExpenseByCategory);
  const [expenseByBranch, setExpenseByBranch] = useState(mockExpenseByBranch);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadBranches = async () => {
    try {
      const { data } = await branchesService.getAll({ limit: 100 });
      setBranches(data.data);
    } catch {
      // silent
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryRes, branchRes] = await Promise.allSettled([
        reportsService.getExpenseSummary(filters),
        reportsService.getExpenseByBranch(filters),
      ]);
      if (categoryRes.status === 'fulfilled' && categoryRes.value.data.data.length > 0) {
        setExpenseByCategory(categoryRes.value.data.data);
      }
      if (branchRes.status === 'fulfilled' && branchRes.value.data.data.length > 0) {
        setExpenseByBranch(branchRes.value.data.data);
      }
    } catch {
      // use mock data
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenseByCategory.reduce((sum, d) => sum + d.total, 0);
  const totalTransactions = expenseByCategory.reduce((sum, d) => sum + d.count, 0);
  const largestCategory = [...expenseByCategory].sort((a, b) => b.total - a.total)[0];

  const pieData = expenseByCategory.map((d) => ({
    name: CATEGORY_LABELS[d.category] || d.category,
    value: d.total,
    color: CATEGORY_COLORS[d.category] || '#8c8c8c',
  }));

  const categoryColumns = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => (
        <Space>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: CATEGORY_COLORS[c] || '#8c8c8c' }} />
          {CATEGORY_LABELS[c] || c}
        </Space>
      ),
    },
    { title: 'Jumlah Transaksi', dataIndex: 'count', key: 'count' },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => formatRupiah(v),
      sorter: (a: ExpenseSummary, b: ExpenseSummary) => a.total - b.total,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Persentase',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 8, maxWidth: 120 }}>
            <div style={{ width: `${v}%`, background: '#1677ff', height: '100%', borderRadius: 4 }} />
          </div>
          <span>{v}%</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Laporan Pengeluaran" subtitle="Analisis pengeluaran operasional">
        <Space wrap>
          <RangePicker
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters((p) => ({
                  ...p,
                  startDate: dates[0]!.toISOString(),
                  endDate: dates[1]!.toISOString(),
                }));
              } else {
                setFilters((p) => ({ ...p, startDate: undefined, endDate: undefined }));
              }
            }}
          />
          <Select
            placeholder="Semua Cabang"
            allowClear
            style={{ width: 200 }}
            onChange={(v) => setFilters((p) => ({ ...p, branchId: v }))}
            options={branches.map((b) => ({ label: b.name, value: b.id }))}
            showSearch
            optionFilterProp="label"
          />
        </Space>
      </PageHeader>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <StatCard icon={<DollarOutlined />} title="Total Pengeluaran" value={formatRupiah(totalExpense)} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard icon={<DollarOutlined />} title="Total Transaksi" value={totalTransactions} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard
              icon={<BankOutlined />}
              title="Kategori Terbesar"
              value={largestCategory ? `${CATEGORY_LABELS[largestCategory.category] || largestCategory.category}` : '-'}
              suffix={largestCategory ? formatRupiah(largestCategory.total) : ''}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={10}>
            <Card title="Pengeluaran per Kategori">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title="Pengeluaran per Cabang">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={expenseByBranch} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                  <YAxis type="category" dataKey="branchName" width={120} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Legend />
                  <Bar dataKey="fuel" name="BBM" fill="#1677ff" stackId="stack" />
                  <Bar dataKey="maintenance" name="Perawatan" fill="#faad14" stackId="stack" />
                  <Bar dataKey="other" name="Lainnya" fill="#8c8c8c" stackId="stack" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card title="Detail per Kategori">
          <Table
            columns={categoryColumns}
            dataSource={expenseByCategory}
            rowKey="category"
            pagination={false}
            locale={{ emptyText: 'Belum ada data pengeluaran' }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default ExpenseReportPage;
