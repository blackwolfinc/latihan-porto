import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Dropdown,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';

const { Text } = Typography;
const { RangePicker } = DatePicker;

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  plateNumber: string;
  carModel: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: InvoiceStatus;
}

const STATUS_MAP: Record<InvoiceStatus, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: 'Draft' },
  SENT: { color: 'blue', label: 'Terkirim' },
  PAID: { color: 'green', label: 'Dibayar' },
  OVERDUE: { color: 'red', label: 'Jatuh Tempo' },
  CANCELLED: { color: 'default', label: 'Dibatalkan' },
};

const fmtRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const customers = [
  { name: 'Budi Santoso', phone: '0812-3456-7890' },
  { name: 'Siti Rahayu', phone: '0812-9876-5432' },
  { name: 'Ahmad Hidayat', phone: '0856-1234-5678' },
  { name: 'Dewi Lestari', phone: '0878-1234-5678' },
  { name: 'Rudi Hartono', phone: '0813-4567-8901' },
  { name: 'Rina Wati', phone: '0899-1234-5678' },
  { name: 'Joko Prasetyo', phone: '0815-6789-0123' },
  { name: 'Maya Sari', phone: '0823-4567-8901' },
  { name: 'Agus Pratama', phone: '0816-7890-1234' },
  { name: 'Linda Susanti', phone: '0856-7890-1234' },
];

const cars = [
  { plate: 'B 1234 ABC', model: 'Toyota Avanza' },
  { plate: 'B 5678 DEF', model: 'Honda CR-V' },
  { plate: 'B 9012 GHI', model: 'Mitsubishi Pajero Sport' },
  { plate: 'B 3456 JKL', model: 'Toyota Innova Zenix' },
  { plate: 'B 7890 MNO', model: 'Suzuki Ertiga' },
  { plate: 'B 2345 PQR', model: 'Daihatsu Xenia' },
  { plate: 'B 6789 STU', model: 'Honda Brio' },
  { plate: 'B 1357 VWX', model: 'Toyota Fortuner' },
];

const invoiceData: InvoiceRow[] = Array.from({ length: 25 }, (_, i) => {
  const cust = customers[i % customers.length];
  const car = cars[i % cars.length];
  const issueDate = dayjs().subtract(i * 3, 'day');
  const dueDate = issueDate.add(14, 'day');
  let status: InvoiceStatus;
  if (i < 3) status = 'DRAFT';
  else if (i < 7) status = 'SENT';
  else if (i < 10) status = 'OVERDUE';
  else if (i < 22) status = 'PAID';
  else status = 'CANCELLED';

  return {
    id: `inv-${i + 1}`,
    invoiceNumber: `INV-${dayjs().format('YYYYMMDD')}-${String(i + 1).padStart(3, '0')}`,
    customerName: cust.name,
    customerPhone: cust.phone,
    plateNumber: car.plate,
    carModel: car.model,
    issueDate: issueDate.format('YYYY-MM-DD'),
    dueDate: dueDate.format('YYYY-MM-DD'),
    total: (Math.floor(Math.random() * 50) + 5) * 100000,
    status,
  };
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = invoiceData.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.plateNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* summary -------------------------------------------------------- */
  const totalInv = invoiceData.length;
  const unpaid = invoiceData.filter((i) => i.status === 'SENT' || i.status === 'DRAFT');
  const unpaidAmt = unpaid.reduce((s, i) => s + i.total, 0);
  const paidMonth = invoiceData
    .filter((i) => i.status === 'PAID' && dayjs(i.issueDate).isSame(dayjs(), 'month'))
    .reduce((s, i) => s + i.total, 0);
  const overdueCount = invoiceData.filter((i) => i.status === 'OVERDUE').length;

  const summary = [
    { label: 'Total Invoice', value: String(totalInv), icon: <FileTextOutlined />, color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Belum Dibayar', value: `${unpaid.length}`, sub: fmtRp(unpaidAmt), icon: <ClockCircleOutlined />, color: '#e65100', bg: '#fff3e0' },
    { label: 'Dibayar Bulan Ini', value: fmtRp(paidMonth), icon: <DollarOutlined />, color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Jatuh Tempo', value: String(overdueCount), icon: <ExclamationCircleOutlined />, color: '#c62828', bg: '#fce4ec', urgent: true },
  ];

  /* columns -------------------------------------------------------- */
  const columns = [
    {
      title: 'No. Invoice',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 210,
      render: (text: string, record: InvoiceRow) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600, fontSize: 13 }}
          onClick={() => navigate(`/invoices/${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 160,
      render: (n: string) => <Text style={{ fontSize: 13 }}>{n}</Text>,
    },
    {
      title: 'Mobil',
      key: 'car',
      width: 190,
      render: (_: any, r: InvoiceRow) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#263238' }}>{r.plateNumber}</div>
          <div style={{ fontSize: 11, color: '#78909c' }}>{r.carModel}</div>
        </div>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 115,
      render: (d: string) => <Text style={{ fontSize: 13 }}>{dayjs(d).format('DD MMM YYYY')}</Text>,
    },
    {
      title: 'Jatuh Tempo',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (d: string, r: InvoiceRow) => {
        const overdue = r.status !== 'PAID' && r.status !== 'CANCELLED' && dayjs(d).isBefore(dayjs(), 'day');
        return (
          <Text style={{ fontSize: 13, color: overdue ? '#c62828' : undefined, fontWeight: overdue ? 600 : 400 }}>
            {dayjs(d).format('DD MMM YYYY')}
            {overdue && <ExclamationCircleOutlined style={{ marginLeft: 4, fontSize: 12 }} />}
          </Text>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ fontSize: 13, fontWeight: 600, color: '#263238' }}>{fmtRp(v)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: InvoiceStatus) => {
        const c = STATUS_MAP[s];
        return <Tag color={c.color}>{c.label}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 70,
      render: (_: any, r: InvoiceRow) => {
        const items = [
          { key: 'view', icon: <EyeOutlined />, label: 'Lihat Detail', onClick: () => navigate(`/invoices/${r.id}`) },
          ...(r.status === 'DRAFT'
            ? [{ key: 'send', icon: <SendOutlined />, label: 'Kirim Invoice', onClick: () => message.success('Invoice terkirim') }]
            : []),
          ...(r.status === 'SENT' || r.status === 'OVERDUE'
            ? [{ key: 'paid', icon: <CheckCircleOutlined />, label: 'Tandai Lunas', onClick: () => message.success('Invoice ditandai lunas') }]
            : []),
          { key: 'pdf', icon: <DownloadOutlined />, label: 'Download PDF', onClick: () => message.info('Mengunduh PDF...') },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manajemen Invoice"
        subtitle="Kelola invoice dan tagihan pelanggan"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Invoice' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/create')}>
          Buat Invoice
        </Button>
      </PageHeader>

      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summary.map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <Card
              size="small"
              style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '14px 18px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: s.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: s.color,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#78909c', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.urgent ? '#c62828' : '#263238', lineHeight: 1.2 }}>
                    {s.value}
                  </div>
                  {s.sub && <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: '12px 18px' } }}
      >
        <Space size={12} wrap>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SENT', label: 'Terkirim' },
              { value: 'PAID', label: 'Dibayar' },
              { value: 'OVERDUE', label: 'Jatuh Tempo' },
              { value: 'CANCELLED', label: 'Dibatalkan' },
            ]}
          />
          <RangePicker format="DD MMM YYYY" style={{ width: 260 }} placeholder={['Dari tanggal', 'Sampai tanggal']} />
          <Input
            placeholder="Cari invoice, customer, plat..."
            prefix={<SearchOutlined style={{ color: '#bdbdbd' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
        </Space>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} invoice`,
          }}
          scroll={{ x: 1150 }}
        />
      </Card>
    </div>
  );
};

export default InvoiceListPage;
