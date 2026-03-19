import React from 'react';
import { Button, Card, Space, Tag, Table, Divider, Typography, Row, Col, message } from 'antd';
import {
  SendOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';

const { Title, Text } = Typography;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: 'Draft' },
  SENT: { color: 'blue', label: 'Terkirim' },
  PAID: { color: 'green', label: 'Dibayar' },
  OVERDUE: { color: 'red', label: 'Jatuh Tempo' },
  CANCELLED: { color: 'default', label: 'Dibatalkan' },
};

const fmtRp = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

/* ------------------------------------------------------------------ */
/*  Mock invoice                                                       */
/* ------------------------------------------------------------------ */

const invoice = {
  id: '1',
  invoiceNumber: 'INV-20260319-001',
  issueDate: '2026-03-10',
  dueDate: '2026-03-24',
  status: 'SENT' as string,
  customer: {
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    email: 'budi.santoso@email.com',
    address: 'Jl. Merdeka No. 45, Menteng, Jakarta Pusat',
  },
  items: [
    { key: '1', no: 1, description: 'Sewa Toyota Avanza (B 1234 ABC) - 3 hari', qty: 3, unitPrice: 350000, amount: 1050000 },
    { key: '2', no: 2, description: 'Biaya Driver - 3 hari', qty: 3, unitPrice: 200000, amount: 600000 },
    { key: '3', no: 3, description: 'Asuransi perjalanan', qty: 1, unitPrice: 75000, amount: 75000 },
    { key: '4', no: 4, description: 'Biaya antar-jemput bandara', qty: 1, unitPrice: 150000, amount: 150000 },
  ],
  subtotal: 1875000,
  discount: 100000,
  taxRate: 11,
  taxAmount: 195250,
  total: 1970250,
  notes: 'Pembayaran paling lambat pada tanggal jatuh tempo. Keterlambatan pembayaran akan dikenakan denda 1% per hari.',
  bankInfo: {
    bank: 'BCA',
    account: '123-456-7890',
    holder: 'PT Caritahub Rental Indonesia',
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const statusCfg = STATUS_MAP[invoice.status] || STATUS_MAP.DRAFT;

  const itemCols = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 50, align: 'center' as const },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description' },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 70, align: 'center' as const },
    {
      title: 'Harga Satuan',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 160,
      align: 'right' as const,
      render: (v: number) => fmtRp(v),
    },
    {
      title: 'Jumlah',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      align: 'right' as const,
      render: (v: number) => <Text style={{ fontWeight: 600 }}>{fmtRp(v)}</Text>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Detail Invoice"
        subtitle={invoice.invoiceNumber}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Invoice', path: '/invoices' },
          { title: invoice.invoiceNumber },
        ]}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
            Kembali
          </Button>
        </Space>
      </PageHeader>

      {/* Action bar */}
      <Card
        size="small"
        style={{ marginBottom: 20, borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: '10px 18px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Tag
            color={statusCfg.color}
            style={{ fontSize: 13, padding: '2px 14px', borderRadius: 4, fontWeight: 600 }}
          >
            {statusCfg.label}
          </Tag>
          <Space>
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <Button icon={<SendOutlined />} onClick={() => message.success('Invoice berhasil dikirim ke customer')}>
                Kirim ke Customer
              </Button>
            )}
            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: '#2e7d32', borderColor: '#2e7d32' }}
                onClick={() => message.success('Invoice ditandai lunas')}
              >
                Tandai Lunas
              </Button>
            )}
            <Button icon={<DownloadOutlined />} onClick={() => message.info('Mengunduh PDF...')}>
              Download PDF
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Cetak
            </Button>
          </Space>
        </div>
      </Card>

      {/* ============ INVOICE PREVIEW ============ */}
      <Card
        style={{
          maxWidth: 820,
          margin: '0 auto',
          borderRadius: 10,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0',
        }}
        styles={{ body: { padding: '48px 48px 36px' } }}
      >
        {/* Header */}
        <Row justify="space-between" align="top" style={{ marginBottom: 32 }}>
          <Col>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1565c0', letterSpacing: -0.5 }}>
                Caritahub Rental
              </span>
            </div>
            <Text style={{ fontSize: 12, color: '#78909c', display: 'block', lineHeight: 1.6 }}>
              PT Caritahub Rental Indonesia<br />
              Jl. Jend. Sudirman Kav. 52-53<br />
              Jakarta Selatan 12190<br />
              Telp: (021) 555-1234
            </Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1565c0', letterSpacing: 3, marginBottom: 8 }}>
              INVOICE
            </div>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#263238', display: 'block' }}>
              {invoice.invoiceNumber}
            </Text>
          </Col>
        </Row>

        {/* From / To + Date info */}
        <Row gutter={32} style={{ marginBottom: 32 }}>
          <Col span={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Dari
            </div>
            <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', color: '#263238' }}>Caritahub Rental</Text>
            <Text style={{ fontSize: 12, color: '#78909c', display: 'block', lineHeight: 1.6 }}>
              Jl. Jend. Sudirman Kav. 52-53<br />
              Jakarta Selatan 12190<br />
              NPWP: 01.234.567.8-901.000
            </Text>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Kepada
            </div>
            <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', color: '#263238' }}>
              {invoice.customer.name}
            </Text>
            <Text style={{ fontSize: 12, color: '#78909c', display: 'block', lineHeight: 1.6 }}>
              {invoice.customer.address}<br />
              {invoice.customer.phone}<br />
              {invoice.customer.email}
            </Text>
          </Col>
          <Col span={8}>
            <div style={{
              background: '#f5f7fa',
              borderRadius: 8,
              padding: '14px 16px',
            }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 600, marginBottom: 2 }}>Tanggal Invoice</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#263238' }}>{dayjs(invoice.issueDate).format('DD MMMM YYYY')}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 600, marginBottom: 2 }}>Jatuh Tempo</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#263238' }}>{dayjs(invoice.dueDate).format('DD MMMM YYYY')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 600, marginBottom: 2 }}>Status</div>
                <Tag color={statusCfg.color} style={{ fontWeight: 600 }}>{statusCfg.label}</Tag>
              </div>
            </div>
          </Col>
        </Row>

        {/* Items table */}
        <Table
          columns={itemCols}
          dataSource={invoice.items}
          pagination={false}
          size="small"
          bordered
          style={{ marginBottom: 24 }}
          rowClassName={(_, idx) => (idx % 2 === 0 ? '' : '')}
        />

        {/* Totals */}
        <Row justify="end" style={{ marginBottom: 28 }}>
          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>Subtotal</Text>
                <Text style={{ fontWeight: 500 }}>{fmtRp(invoice.subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>Diskon</Text>
                <Text style={{ color: '#2e7d32', fontWeight: 500 }}>- {fmtRp(invoice.discount)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>PPN ({invoice.taxRate}%)</Text>
                <Text style={{ fontWeight: 500 }}>{fmtRp(invoice.taxAmount)}</Text>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 15, fontWeight: 700, color: '#263238' }}>Total</Text>
                <Text style={{ fontSize: 22, fontWeight: 800, color: '#1565c0' }}>{fmtRp(invoice.total)}</Text>
              </div>
            </div>
          </Col>
        </Row>

        {/* Bank info */}
        <div
          style={{
            background: '#e3f2fd',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            borderLeft: '3px solid #1565c0',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 700, color: '#1565c0', display: 'block', marginBottom: 4 }}>
            Informasi Pembayaran
          </Text>
          <Text style={{ fontSize: 13, color: '#37474f', display: 'block', lineHeight: 1.7 }}>
            Bank {invoice.bankInfo.bank} &middot; No. Rekening: {invoice.bankInfo.account}<br />
            a.n. {invoice.bankInfo.holder}
          </Text>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              background: '#f5f5f5',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
              borderLeft: '3px solid #bdbdbd',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 600, color: '#78909c', display: 'block', marginBottom: 4 }}>
              Catatan
            </Text>
            <Text style={{ fontSize: 12, color: '#546e7a' }}>{invoice.notes}</Text>
          </div>
        )}

        {/* Footer */}
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, color: '#78909c', fontStyle: 'italic' }}>
            Terima kasih atas kepercayaan Anda menggunakan layanan Caritahub Rental.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
