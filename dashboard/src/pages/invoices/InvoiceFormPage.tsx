import React, { useState, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';

const { Text } = Typography;
const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InvoiceItem {
  key: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

/* ------------------------------------------------------------------ */
/*  Mock bookings                                                      */
/* ------------------------------------------------------------------ */

const bookingOptions = [
  { value: 'BK-2026001', label: 'BK-2026001 - Budi Santoso (Toyota Avanza)', customer: 'Budi Santoso', car: 'Toyota Avanza (B 1234 ABC)', days: 3, rate: 350000, driverRate: 200000, withDriver: true },
  { value: 'BK-2026002', label: 'BK-2026002 - Siti Rahayu (Honda CR-V)', customer: 'Siti Rahayu', car: 'Honda CR-V (B 5678 DEF)', days: 5, rate: 600000, driverRate: 0, withDriver: false },
  { value: 'BK-2026003', label: 'BK-2026003 - Ahmad Hidayat (Toyota Innova Zenix)', customer: 'Ahmad Hidayat', car: 'Toyota Innova Zenix (B 3456 JKL)', days: 4, rate: 450000, driverRate: 200000, withDriver: true },
  { value: 'BK-2026004', label: 'BK-2026004 - Rudi Hartono (Honda Brio)', customer: 'Rudi Hartono', car: 'Honda Brio (B 6789 STU)', days: 3, rate: 300000, driverRate: 0, withDriver: false },
  { value: 'BK-2026005', label: 'BK-2026005 - Rina Wati (Toyota Fortuner)', customer: 'Rina Wati', car: 'Toyota Fortuner (B 1357 VWX)', days: 7, rate: 600000, driverRate: 200000, withDriver: true },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

let keySeq = 0;
const newKey = () => `item-${++keySeq}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const InvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [items, setItems] = useState<InvoiceItem[]>([
    { key: newKey(), description: '', qty: 1, unitPrice: 0, amount: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(11);
  const [saving, setSaving] = useState(false);

  /* computed ------------------------------------------------------ */
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);
  const taxAmount = useMemo(() => Math.round((subtotal - discount) * (taxRate / 100)), [subtotal, discount, taxRate]);
  const total = useMemo(() => subtotal - discount + taxAmount, [subtotal, discount, taxAmount]);

  /* item handlers ------------------------------------------------- */
  const updateItem = (key: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'unitPrice') {
          updated.amount = (updated.qty || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { key: newKey(), description: '', qty: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (key: string) => {
    if (items.length <= 1) {
      message.warning('Minimal harus ada 1 item');
      return;
    }
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  /* booking selection -> auto-populate */
  const handleBookingSelect = (bookingId: string) => {
    const bk = bookingOptions.find((b) => b.value === bookingId);
    if (!bk) return;

    const newItems: InvoiceItem[] = [
      {
        key: newKey(),
        description: `Sewa ${bk.car} - ${bk.days} hari`,
        qty: bk.days,
        unitPrice: bk.rate,
        amount: bk.days * bk.rate,
      },
    ];

    if (bk.withDriver && bk.driverRate > 0) {
      newItems.push({
        key: newKey(),
        description: `Biaya Driver - ${bk.days} hari`,
        qty: bk.days,
        unitPrice: bk.driverRate,
        amount: bk.days * bk.driverRate,
      });
    }

    setItems(newItems);
    form.setFieldValue('customer', bk.customer);
  };

  /* save */
  const handleSave = async (sendNow: boolean) => {
    try {
      await form.validateFields();
      if (items.some((i) => !i.description || i.unitPrice <= 0)) {
        message.error('Lengkapi semua item invoice');
        return;
      }
      setSaving(true);
      await new Promise((r) => setTimeout(r, 600));
      message.success(sendNow ? 'Invoice berhasil dibuat dan dikirim' : 'Invoice disimpan sebagai draft');
      navigate('/invoices');
    } catch {
      message.error('Periksa kembali data yang dimasukkan');
    } finally {
      setSaving(false);
    }
  };

  /* columns */
  const columns = [
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      render: (_: any, record: InvoiceItem) => (
        <Input
          value={record.description}
          onChange={(e) => updateItem(record.key, 'description', e.target.value)}
          placeholder="Deskripsi item"
          variant="borderless"
          style={{ fontSize: 13 }}
        />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 90,
      render: (_: any, record: InvoiceItem) => (
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(v) => updateItem(record.key, 'qty', v || 1)}
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: 'Harga Satuan',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 170,
      render: (_: any, record: InvoiceItem) => (
        <InputNumber
          min={0}
          step={10000}
          value={record.unitPrice}
          onChange={(v) => updateItem(record.key, 'unitPrice', v || 0)}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          parser={(v) => Number((v || '').replace(/\./g, ''))}
          prefix="Rp"
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      align: 'right' as const,
      render: (v: number) => <Text style={{ fontWeight: 600, fontSize: 13 }}>{fmtRp(v)}</Text>,
    },
    {
      title: '',
      key: 'del',
      width: 50,
      render: (_: any, record: InvoiceItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          disabled={items.length <= 1}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Buat Invoice Baru"
        subtitle="Caritahub Rental"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Invoice', path: '/invoices' },
          { title: 'Buat Invoice' },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
          Kembali
        </Button>
      </PageHeader>

      <Row gutter={24}>
        {/* Left: form */}
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20 }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Pilih Booking (opsional)" name="booking">
                <Select
                  showSearch
                  placeholder="Cari dan pilih booking..."
                  optionFilterProp="label"
                  options={bookingOptions}
                  onChange={handleBookingSelect}
                  allowClear
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Customer" name="customer" rules={[{ required: true, message: 'Masukkan nama customer' }]}>
                    <Input placeholder="Nama customer" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Jatuh Tempo" name="dueDate" initialValue={dayjs().add(14, 'day')} rules={[{ required: true, message: 'Pilih tanggal jatuh tempo' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider style={{ margin: '8px 0 20px' }} />

            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#263238' }}>Item Invoice</Text>
            </div>

            <Table
              dataSource={items}
              columns={columns}
              pagination={false}
              size="small"
              bordered
              rowKey="key"
              style={{ marginBottom: 12 }}
            />

            <Button type="dashed" icon={<PlusOutlined />} onClick={addItem} block style={{ marginBottom: 20 }}>
              Tambah Item
            </Button>

            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: '#78909c' }}>Diskon</Text>
                </div>
                <InputNumber
                  min={0}
                  step={10000}
                  value={discount}
                  onChange={(v) => setDiscount(v || 0)}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number((v || '').replace(/\./g, ''))}
                  prefix="Rp"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: '#78909c' }}>Pajak (%)</Text>
                </div>
                <InputNumber
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(v) => setTaxRate(v || 0)}
                  suffix="%"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#78909c' }}>Catatan</Text>
              </div>
              <TextArea
                rows={3}
                placeholder="Catatan tambahan untuk invoice (opsional)"
                defaultValue="Pembayaran dapat dilakukan melalui transfer bank ke rekening BCA 1234567890 a.n. PT Caritahub Rental Indonesia."
              />
            </div>
          </Card>
        </Col>

        {/* Right: summary */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: 88,
            }}
            styles={{ body: { padding: '24px 28px' } }}
          >
            <Text style={{ fontSize: 15, fontWeight: 700, color: '#263238', display: 'block', marginBottom: 20 }}>
              Ringkasan
            </Text>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>Subtotal</Text>
                <Text style={{ fontWeight: 500 }}>{fmtRp(subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>Diskon</Text>
                <Text style={{ color: '#2e7d32', fontWeight: 500 }}>- {fmtRp(discount)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#78909c' }}>PPN ({taxRate}%)</Text>
                <Text style={{ fontWeight: 500 }}>{fmtRp(taxAmount)}</Text>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 15, fontWeight: 700, color: '#263238' }}>Total</Text>
                <Text style={{ fontSize: 22, fontWeight: 800, color: '#1565c0' }}>{fmtRp(total)}</Text>
              </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <Button
                block
                size="large"
                icon={<SaveOutlined />}
                onClick={() => handleSave(false)}
                loading={saving}
              >
                Simpan sebagai Draft
              </Button>
              <Button
                block
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={() => handleSave(true)}
                loading={saving}
              >
                Simpan & Kirim
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceFormPage;
