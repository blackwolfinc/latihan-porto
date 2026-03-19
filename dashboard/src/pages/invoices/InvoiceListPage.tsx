import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, Tag, Row, Col, Card } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/ui/StatCard';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  carInfo: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

const statusColorMap: Record<string, string> = {
  DRAFT: 'default',
  SENT: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
  CANCELLED: 'gray',
};

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Terkirim',
  PAID: 'Lunas',
  OVERDUE: 'Jatuh Tempo',
  CANCELLED: 'Dibatalkan',
};

const mockInvoices: InvoiceRow[] = [
  { id: '1', invoiceNumber: 'INV-2026-0001', customerName: 'Budi Santoso', carInfo: 'Toyota Avanza 2024', issueDate: '2026-03-01', dueDate: '2026-03-08', totalAmount: 2775000, status: 'PAID' },
  { id: '2', invoiceNumber: 'INV-2026-0002', customerName: 'Siti Aminah', carInfo: 'Honda CR-V 2025', issueDate: '2026-03-03', dueDate: '2026-03-10', totalAmount: 4462000, status: 'SENT' },
  { id: '3', invoiceNumber: 'INV-2026-0003', customerName: 'Ahmad Fauzi', carInfo: 'Daihatsu Xenia 2024', issueDate: '2026-02-25', dueDate: '2026-03-04', totalAmount: 1998000, status: 'OVERDUE' },
  { id: '4', invoiceNumber: 'INV-2026-0004', customerName: 'Dewi Lestari', carInfo: 'Mitsubishi Pajero 2025', issueDate: '2026-03-10', dueDate: '2026-03-17', totalAmount: 3535000, status: 'DRAFT' },
  { id: '5', invoiceNumber: 'INV-2026-0005', customerName: 'Eko Prasetyo', carInfo: 'Toyota Innova 2025', issueDate: '2026-03-05', dueDate: '2026-03-12', totalAmount: 3885000, status: 'PAID' },
  { id: '6', invoiceNumber: 'INV-2026-0006', customerName: 'Fitri Handayani', carInfo: 'Suzuki Ertiga 2024', issueDate: '2026-03-08', dueDate: '2026-03-15', totalAmount: 1665000, status: 'SENT' },
  { id: '7', invoiceNumber: 'INV-2026-0007', customerName: 'Gunawan Wijaya', carInfo: 'Honda Brio 2024', issueDate: '2026-03-12', dueDate: '2026-03-19', totalAmount: 999000, status: 'PAID' },
  { id: '8', invoiceNumber: 'INV-2026-0008', customerName: 'Hana Pertiwi', carInfo: 'Toyota Fortuner 2025', issueDate: '2026-02-20', dueDate: '2026-02-27', totalAmount: 5550000, status: 'OVERDUE' },
  { id: '9', invoiceNumber: 'INV-2026-0009', customerName: 'Irfan Hakim', carInfo: 'Nissan Livina 2024', issueDate: '2026-03-14', dueDate: '2026-03-21', totalAmount: 2220000, status: 'CANCELLED' },
  { id: '10', invoiceNumber: 'INV-2026-0010', customerName: 'Joko Susanto', carInfo: 'Daihatsu Terios 2025', issueDate: '2026-03-18', dueDate: '2026-03-25', totalAmount: 2997000, status: 'DRAFT' },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();
  const [page, setPage] = useState(1);

  const filteredData = mockInvoices.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (
        !inv.invoiceNumber.toLowerCase().includes(q) &&
        !inv.customerName.toLowerCase().includes(q) &&
        !inv.carInfo.toLowerCase().includes(q)
      )
        return false;
    }
    if (dateRange) {
      const issueDate = dayjs(inv.issueDate);
      if (issueDate.isBefore(dayjs(dateRange[0])) || issueDate.isAfter(dayjs(dateRange[1]))) return false;
    }
    return true;
  });

  const totalInvoice = mockInvoices.length;
  const belumDibayar = mockInvoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE' || i.status === 'DRAFT')
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const dibayarBulanIni = mockInvoices
    .filter((i) => i.status === 'PAID' && dayjs(i.issueDate).month() === dayjs().month())
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const jatuhTempo = mockInvoices.filter((i) => i.status === 'OVERDUE').length;

  const columns = [
    {
      title: 'No. Invoice',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Mobil', dataIndex: 'carInfo', key: 'carInfo' },
    {
      title: 'Tanggal',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Jatuh Tempo',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (a: number) => formatRupiah(a),
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={statusColorMap[s]}>{statusLabelMap[s] || s}</Tag>,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_: unknown, r: InvoiceRow) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/invoices/${r.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manajemen Invoice"
        subtitle={`Total ${totalInvoice} invoice`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Invoice' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/create')}>
          Buat Invoice
        </Button>
      </PageHeader>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<FileTextOutlined />} title="Total Invoice" value={totalInvoice} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<ClockCircleOutlined />} title="Belum Dibayar" value={formatRupiah(belumDibayar)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<CheckCircleOutlined />} title="Dibayar Bulan Ini" value={formatRupiah(dibayarBulanIni)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ height: '100%' }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <span style={{ fontSize: 24, color: '#ff4d4f' }}><ExclamationCircleOutlined /></span>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>Jatuh Tempo</span>
              </Space>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#ff4d4f' }}>{jatuhTempo}</div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={12}>
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 160 }}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <Option value="DRAFT">Draft</Option>
          <Option value="SENT">Terkirim</Option>
          <Option value="PAID">Lunas</Option>
          <Option value="OVERDUE">Jatuh Tempo</Option>
          <Option value="CANCELLED">Dibatalkan</Option>
        </Select>
        <RangePicker
          onChange={(_, ds) => {
            setDateRange(ds[0] && ds[1] ? (ds as [string, string]) : undefined);
            setPage(1);
          }}
        />
        <Input
          placeholder="Cari invoice, customer, mobil..."
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          total: filteredData.length,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Total ${t} data`,
        }}
      />
    </div>
  );
};

export default InvoiceListPage;
