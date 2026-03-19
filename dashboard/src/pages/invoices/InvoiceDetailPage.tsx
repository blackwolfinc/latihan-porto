import React from 'react';
import { Button, Card, Space, Tag, Table, Divider, Typography, Row, Col, message } from 'antd';
import {
  SendOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const mockInvoice = {
  id: '1',
  invoiceNumber: 'INV-2026-0001',
  issueDate: '2026-03-10',
  dueDate: '2026-03-17',
  status: 'SENT',
  customerName: 'Budi Santoso',
  customerPhone: '081234567890',
  customerEmail: 'budi@email.com',
  items: [
    { key: '1', no: 1, description: 'Sewa Toyota Avanza (5 hari)', qty: 5, unitPrice: 500000, amount: 2500000 },
    { key: '2', no: 2, description: 'Biaya sopir (5 hari)', qty: 5, unitPrice: 150000, amount: 750000 },
    { key: '3', no: 3, description: 'Asuransi perjalanan', qty: 1, unitPrice: 100000, amount: 100000 },
  ],
  subtotal: 3350000,
  discount: 200000,
  taxRate: 11,
  taxAmount: 346500,
  totalAmount: 3496500,
  notes: 'Pembayaran dapat dilakukan melalui transfer bank ke rekening BCA 1234567890 a.n. PT Caritahub Rental Indonesia.',
};

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const invoice = mockInvoice;

  const handleSend = () => {
    message.success('Invoice berhasil dikirim ke customer');
  };

  const handleMarkPaid = () => {
    message.success('Invoice berhasil ditandai lunas');
  };

  const handleDownload = () => {
    message.info('Mengunduh PDF invoice...');
  };

  const itemColumns = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 50 },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description' },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60, align: 'center' as const },
    {
      title: 'Harga Satuan',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 160,
      align: 'right' as const,
      render: (v: number) => formatRupiah(v),
    },
    {
      title: 'Jumlah',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      align: 'right' as const,
      render: (v: number) => formatRupiah(v),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
          Kembali
        </Button>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Detail Invoice</Title>
        <Space>
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button icon={<SendOutlined />} onClick={handleSend}>
              Kirim
            </Button>
          )}
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }} onClick={handleMarkPaid}>
              Tandai Lunas
            </Button>
          )}
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Download PDF
          </Button>
        </Space>
      </div>

      <Card
        style={{
          maxWidth: 800,
          margin: '0 auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          borderRadius: 8,
        }}
        bodyStyle={{ padding: 40 }}
      >
        {/* Header */}
        <Row justify="space-between" align="top">
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1677ff' }}>Caritahub Rental</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>PT Caritahub Rental Indonesia</Text>
          </Col>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1677ff', letterSpacing: 4 }}>INVOICE</Title>
          </Col>
        </Row>

        <Divider />

        {/* Invoice Info */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text strong>No. Invoice</Text>
              <Text>{invoice.invoiceNumber}</Text>
              <div style={{ marginTop: 8 }} />
              <Text strong>Tanggal</Text>
              <Text>{dayjs(invoice.issueDate).format('DD MMMM YYYY')}</Text>
              <div style={{ marginTop: 8 }} />
              <Text strong>Jatuh Tempo</Text>
              <Text>{dayjs(invoice.dueDate).format('DD MMMM YYYY')}</Text>
              <div style={{ marginTop: 8 }} />
              <Text strong>Status</Text>
              <div>
                <Tag color={statusColorMap[invoice.status]}>{statusLabelMap[invoice.status]}</Tag>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Dari:</Text>
                <Text>Caritahub Rental</Text><br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Jl. Sudirman No. 123<br />
                  Jakarta Pusat 10220<br />
                  Telp: (021) 555-1234<br />
                  NPWP: 01.234.567.8-901.000
                </Text>
              </Col>
              <Col span={12}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Kepada:</Text>
                <Text>{invoice.customerName}</Text><br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {invoice.customerPhone}<br />
                  {invoice.customerEmail}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Items Table */}
        <Table
          columns={itemColumns}
          dataSource={invoice.items}
          pagination={false}
          bordered
          size="small"
          style={{ marginBottom: 24 }}
        />

        {/* Totals */}
        <Row justify="end">
          <Col span={10}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>Subtotal</Text>
                <Text>{formatRupiah(invoice.subtotal)}</Text>
              </Row>
              <Row justify="space-between">
                <Text>Diskon</Text>
                <Text style={{ color: '#52c41a' }}>- {formatRupiah(invoice.discount)}</Text>
              </Row>
              <Row justify="space-between">
                <Text>PPN ({invoice.taxRate}%)</Text>
                <Text>{formatRupiah(invoice.taxAmount)}</Text>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between">
                <Text strong style={{ fontSize: 16 }}>Total</Text>
                <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{formatRupiah(invoice.totalAmount)}</Text>
              </Row>
            </Space>
          </Col>
        </Row>

        {/* Notes */}
        {invoice.notes && (
          <>
            <Divider />
            <div>
              <Text strong>Catatan:</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>{invoice.notes}</Text>
            </div>
          </>
        )}

        {/* Footer */}
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
            Terima kasih atas kepercayaan Anda menggunakan layanan Caritahub Rental.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
