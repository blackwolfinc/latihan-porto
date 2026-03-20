import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Typography, Form, Input, Button, Upload, Tabs, Space,
  Divider, Select, message, Tag, Image,
} from 'antd';
import {
  UploadOutlined, BankOutlined, PlusOutlined, DeleteOutlined,
  FileTextOutlined, SaveOutlined, EyeOutlined, ArrowLeftOutlined,
  IdcardOutlined, HighlightOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { invoiceTemplatesService } from '@/services/invoice-templates.service';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface TemplateState {
  logoUrl: string;
  companyName: string;
  companyTagline: string;
  headerAddress: string;
  headerCity: string;
  headerPhone: string;
  headerEmail: string;
  headerWebsite: string;
  headerNpwp: string;
  primaryColor: string;
  secondaryColor: string;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  signatureName: string;
  signatureTitle: string;
  signatureImageUrl: string;
  stampImageUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankBranch: string;
  additionalBanks: BankAccount[];
  termsAndConditions: string;
  paymentTerms: string;
  footerText: string;
  footerNote: string;
}

const BANK_OPTIONS = [
  'Bank BCA', 'Bank BNI', 'Bank BRI', 'Bank Mandiri',
  'Bank CIMB Niaga', 'Bank Permata', 'Bank Danamon',
  'Bank OCBC NISP', 'Bank Mega',
  'Bank Syariah Indonesia (BSI)', 'Bank BTPN', 'Bank Jago',
  'Lainnya',
];

const PRIMARY_PRESETS = ['#1a56db', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#4f46e5', '#be185d'];
const SECONDARY_PRESETS = ['#6b7280', '#78909c', '#64748b', '#9ca3af', '#475569', '#374151'];

const DEFAULT_TEMPLATE: TemplateState = {
  logoUrl: '',
  companyName: 'CaritaHub Rental',
  companyTagline: 'Solusi Rental Mobil Terpercaya',
  headerAddress: 'Jl. Jend. Sudirman Kav. 52-53',
  headerCity: 'Jakarta Selatan 12190',
  headerPhone: '(021) 555-1234',
  headerEmail: 'info@caritahub.com',
  headerWebsite: 'www.caritahub.com',
  headerNpwp: '01.234.567.8-901.000',
  primaryColor: '#1a56db',
  secondaryColor: '#6b7280',
  invoicePrefix: 'INV',
  invoiceNumberFormat: '{PREFIX}-{YYYYMMDD}-{SEQ}',
  signatureName: 'Ahmad Wijaya',
  signatureTitle: 'Direktur Utama',
  signatureImageUrl: '',
  stampImageUrl: '',
  bankName: 'Bank BCA',
  bankAccountNumber: '123-456-7890',
  bankAccountName: 'PT CaritaHub Rental Indonesia',
  bankBranch: 'KCP Jakarta Pusat',
  additionalBanks: [],
  termsAndConditions:
    '1. Pembayaran dilakukan sebelum masa sewa dimulai.\n2. Keterlambatan pengembalian dikenakan denda 25% per hari.\n3. Kerusakan di luar asuransi menjadi tanggung jawab penyewa.\n4. Pembatalan H-1 dikenakan biaya 50% dari total sewa.',
  paymentTerms: 'Pembayaran dilakukan dalam 7 hari kerja setelah invoice diterbitkan.',
  footerText: 'Terima kasih atas kepercayaan Anda menggunakan layanan CaritaHub Rental.',
  footerNote: 'Invoice ini sah tanpa tanda tangan basah.',
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

/* ------------------------------------------------------------------ */
/*  Live Invoice Preview                                               */
/* ------------------------------------------------------------------ */

const InvoicePreview: React.FC<{ t: TemplateState }> = ({ t }) => {
  const todayStr = dayjs().format('DD MMMM YYYY');
  const dueStr = dayjs().add(7, 'day').format('DD MMMM YYYY');
  const sampleNum = `${t.invoicePrefix || 'INV'}-${dayjs().format('YYYYMMDD')}-001`;

  const items = [
    { no: 1, desc: 'Sewa Toyota Avanza (B 1234 ABC) - 3 hari', qty: 3, price: 350000, amount: 1050000 },
    { no: 2, desc: 'Biaya Driver - 3 hari', qty: 3, price: 200000, amount: 600000 },
    { no: 3, desc: 'Asuransi perjalanan', qty: 1, price: 75000, amount: 75000 },
  ];
  const subtotal = 1725000;
  const tax = 189750;
  const total = 1914750;

  return (
    <div
      style={{
        background: '#fff',
        padding: 28,
        borderRadius: 8,
        fontSize: 11,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e8e8e8',
        minHeight: 580,
      }}
    >
      {/* === Header === */}
      <div style={{ borderBottom: `3px solid ${t.primaryColor}`, paddingBottom: 14, marginBottom: 14 }}>
        <Row justify="space-between" align="top">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {t.logoUrl ? (
                <Image src={t.logoUrl} height={38} preview={false} style={{ borderRadius: 4 }} />
              ) : (
                <div
                  style={{
                    width: 38, height: 38, background: t.primaryColor,
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 16,
                  }}
                >
                  {(t.companyName || 'C').charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: t.primaryColor }}>
                  {t.companyName || 'Nama Perusahaan'}
                </div>
                {t.companyTagline && (
                  <div style={{ color: t.secondaryColor, fontSize: 9, fontStyle: 'italic' }}>{t.companyTagline}</div>
                )}
              </div>
            </div>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.primaryColor, letterSpacing: 2 }}>INVOICE</div>
            <div style={{ color: t.secondaryColor, fontSize: 10, marginTop: 2 }}>
              <div style={{ fontWeight: 600 }}>{sampleNum}</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* === From / To / Date === */}
      <Row gutter={16} style={{ marginBottom: 14, fontSize: 10 }}>
        <Col span={8}>
          <div style={{ color: t.secondaryColor, fontSize: 8, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 }}>
            Dari
          </div>
          <div style={{ fontWeight: 600 }}>{t.companyName}</div>
          <div style={{ color: '#6b7280', lineHeight: 1.6, fontSize: 9 }}>
            {t.headerAddress && <>{t.headerAddress}<br /></>}
            {t.headerCity && <>{t.headerCity}<br /></>}
            {t.headerPhone && <>Telp: {t.headerPhone}<br /></>}
            {t.headerEmail && <>{t.headerEmail}<br /></>}
            {t.headerNpwp && <>NPWP: {t.headerNpwp}</>}
          </div>
        </Col>
        <Col span={8}>
          <div style={{ color: t.secondaryColor, fontSize: 8, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 }}>
            Kepada
          </div>
          <div style={{ fontWeight: 600 }}>Budi Santoso</div>
          <div style={{ color: '#6b7280', lineHeight: 1.6, fontSize: 9 }}>
            Jl. Merdeka No. 45<br />
            Jakarta Selatan<br />
            0812-3456-7890<br />
            budi@email.com
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#f9fafb', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 8, color: t.secondaryColor, fontWeight: 600, marginBottom: 1 }}>Tanggal Invoice</div>
            <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 6 }}>{todayStr}</div>
            <div style={{ fontSize: 8, color: t.secondaryColor, fontWeight: 600, marginBottom: 1 }}>Jatuh Tempo</div>
            <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 6 }}>{dueStr}</div>
            <div style={{ fontSize: 8, color: t.secondaryColor, fontWeight: 600, marginBottom: 1 }}>Status</div>
            <Tag color="blue" style={{ fontSize: 9 }}>Terkirim</Tag>
          </div>
        </Col>
      </Row>

      {/* === Items Table === */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr style={{ background: t.primaryColor, color: '#fff' }}>
            {['No', 'Deskripsi', 'Qty', 'Harga Satuan', 'Jumlah'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '5px 6px',
                  textAlign: i === 0 ? 'center' : i >= 3 ? 'right' : 'left',
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: 9 }}>{item.no}</td>
              <td style={{ padding: '4px 6px', fontSize: 9 }}>{item.desc}</td>
              <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: 9 }}>{item.qty}</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: 9 }}>{formatRp(item.price)}</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: 9, fontWeight: 600 }}>{formatRp(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === Totals === */}
      <Row justify="end" style={{ marginBottom: 12 }}>
        <Col span={10}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 10 }}>
            <span style={{ color: t.secondaryColor }}>Subtotal</span><span>{formatRp(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 10 }}>
            <span style={{ color: t.secondaryColor }}>PPN (11%)</span><span>{formatRp(tax)}</span>
          </div>
          <Divider style={{ margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>TOTAL</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: t.primaryColor }}>{formatRp(total)}</span>
          </div>
        </Col>
      </Row>

      {/* === Bank Info === */}
      {(t.bankName || t.bankAccountNumber) && (
        <div
          style={{
            background: `${t.primaryColor}08`,
            padding: '8px 12px',
            borderRadius: 6,
            marginBottom: 10,
            borderLeft: `3px solid ${t.primaryColor}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 9, marginBottom: 3, color: t.primaryColor }}>
            Informasi Pembayaran
          </div>
          <div style={{ fontSize: 9, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600 }}>{t.bankName}</span> &middot; No. Rek: {t.bankAccountNumber || '-'}<br />
            a.n. {t.bankAccountName || '-'}
            {t.bankBranch && <> &middot; {t.bankBranch}</>}
          </div>
          {t.additionalBanks.length > 0 && (
            <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed #d1d5db' }}>
              {t.additionalBanks.map((bank, idx) => (
                <div key={idx} style={{ fontSize: 9 }}>
                  {bank.bankName} &middot; {bank.accountNumber} &middot; a.n. {bank.accountName}
                </div>
              ))}
            </div>
          )}
          {t.paymentTerms && (
            <div style={{ marginTop: 4, fontSize: 8, color: t.secondaryColor, fontStyle: 'italic' }}>
              {t.paymentTerms}
            </div>
          )}
        </div>
      )}

      {/* === Terms === */}
      {t.termsAndConditions && (
        <div style={{ background: '#f9fafb', borderRadius: 4, padding: '6px 10px', marginBottom: 10, borderLeft: '2px solid #d1d5db' }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: t.secondaryColor, marginBottom: 2 }}>Syarat & Ketentuan</div>
          <div style={{ fontSize: 8, color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{t.termsAndConditions}</div>
        </div>
      )}

      {/* === Signature === */}
      {(t.signatureName || t.signatureTitle) && (
        <Row justify="end" style={{ marginBottom: 10 }}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <div style={{ color: t.secondaryColor, fontSize: 8, marginBottom: 4 }}>Hormat kami,</div>
            {t.signatureImageUrl ? (
              <Image src={t.signatureImageUrl} height={36} preview={false} style={{ marginBottom: 2 }} />
            ) : (
              <div style={{ height: 36, marginBottom: 2 }} />
            )}
            {t.stampImageUrl && (
              <Image src={t.stampImageUrl} height={28} preview={false} style={{ opacity: 0.6, marginBottom: 2 }} />
            )}
            <div style={{ borderTop: '1px solid #374151', paddingTop: 3 }}>
              <div style={{ fontWeight: 700, fontSize: 10 }}>{t.signatureName || '(Nama)'}</div>
              <div style={{ color: t.secondaryColor, fontSize: 8 }}>{t.signatureTitle || '(Jabatan)'}</div>
            </div>
          </Col>
        </Row>
      )}

      {/* === Footer === */}
      {(t.footerText || t.footerNote) && (
        <div
          style={{
            textAlign: 'center',
            color: t.secondaryColor,
            fontSize: 9,
            borderTop: `1px solid ${t.primaryColor}20`,
            paddingTop: 8,
          }}
        >
          {t.footerText && <div style={{ fontStyle: 'italic' }}>{t.footerText}</div>}
          {t.footerNote && <div style={{ fontSize: 8, marginTop: 2 }}>{t.footerNote}</div>}
          {t.headerWebsite && <div style={{ fontSize: 8, color: t.primaryColor, marginTop: 2 }}>{t.headerWebsite}</div>}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

const InvoiceTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<TemplateState>(DEFAULT_TEMPLATE);

  // Load from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await invoiceTemplatesService.get();
        if (res.data) {
          setTemplate((prev) => ({ ...prev, ...res.data, additionalBanks: res.data.additionalBanks || [] }));
        }
      } catch {
        // defaults are fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = useCallback((key: string, value: any) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addBank = () => {
    setTemplate((prev) => ({
      ...prev,
      additionalBanks: [...prev.additionalBanks, { bankName: '', accountNumber: '', accountName: '' }],
    }));
  };

  const removeBank = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      additionalBanks: prev.additionalBanks.filter((_, i) => i !== index),
    }));
  };

  const updateAdditionalBank = (index: number, field: keyof BankAccount, value: string) => {
    setTemplate((prev) => {
      const banks = [...prev.additionalBanks];
      banks[index] = { ...banks[index], [field]: value };
      return { ...prev, additionalBanks: banks };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoiceTemplatesService.update(template);
      message.success('Template invoice berhasil disimpan');
    } catch {
      message.error('Gagal menyimpan template');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    message.info('Template direset ke default');
  };

  /* -------------------------------------------------------------- */
  /*  Color Preset Row                                               */
  /* -------------------------------------------------------------- */
  const ColorPresets: React.FC<{ colors: string[]; selected: string; onSelect: (c: string) => void }> = ({
    colors, selected, onSelect,
  }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
      {colors.map((c) => (
        <div
          key={c}
          onClick={() => onSelect(c)}
          style={{
            width: 26, height: 26, borderRadius: 4, background: c,
            cursor: 'pointer',
            border: selected === c ? '2.5px solid #000' : '2px solid transparent',
            transition: 'border 0.15s',
          }}
        />
      ))}
    </div>
  );

  /* -------------------------------------------------------------- */
  /*  Tab contents                                                    */
  /* -------------------------------------------------------------- */

  const identitasTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Logo Perusahaan</Text>
        <Row gutter={16} align="middle">
          <Col>
            <Upload listType="picture-card" maxCount={1} showUploadList={false} beforeUpload={() => false}>
              <div><UploadOutlined /><div style={{ marginTop: 4, fontSize: 11 }}>Upload Logo</div></div>
            </Upload>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="Atau masukkan URL logo"
              value={template.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Perusahaan *</Text>
        <Input value={template.companyName} onChange={(e) => update('companyName', e.target.value)} />
      </div>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Tagline</Text>
        <Input value={template.companyTagline} onChange={(e) => update('companyTagline', e.target.value)} placeholder="Solusi Rental Mobil Terpercaya" />
      </div>

      <Divider orientation="left" style={{ fontSize: 12, margin: '8px 0' }}>Kop Surat / Alamat</Divider>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Alamat</Text>
        <Input value={template.headerAddress} onChange={(e) => update('headerAddress', e.target.value)} />
      </div>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Kota / Kode Pos</Text>
        <Input value={template.headerCity} onChange={(e) => update('headerCity', e.target.value)} />
      </div>
      <Row gutter={12}>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Telepon</Text>
          <Input value={template.headerPhone} onChange={(e) => update('headerPhone', e.target.value)} />
        </Col>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Email</Text>
          <Input value={template.headerEmail} onChange={(e) => update('headerEmail', e.target.value)} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Website</Text>
          <Input value={template.headerWebsite} onChange={(e) => update('headerWebsite', e.target.value)} />
        </Col>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>NPWP</Text>
          <Input value={template.headerNpwp} onChange={(e) => update('headerNpwp', e.target.value)} />
        </Col>
      </Row>
    </Space>
  );

  const gayaTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={24}>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Warna Utama</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              type="color"
              value={template.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              style={{ width: 48, height: 36, padding: 2, cursor: 'pointer' }}
            />
            <Input
              value={template.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              style={{ width: 110 }}
              placeholder="#1a56db"
            />
          </div>
          <ColorPresets colors={PRIMARY_PRESETS} selected={template.primaryColor} onSelect={(c) => update('primaryColor', c)} />
        </Col>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Warna Sekunder</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              type="color"
              value={template.secondaryColor}
              onChange={(e) => update('secondaryColor', e.target.value)}
              style={{ width: 48, height: 36, padding: 2, cursor: 'pointer' }}
            />
            <Input
              value={template.secondaryColor}
              onChange={(e) => update('secondaryColor', e.target.value)}
              style={{ width: 110 }}
              placeholder="#6b7280"
            />
          </div>
          <ColorPresets colors={SECONDARY_PRESETS} selected={template.secondaryColor} onSelect={(c) => update('secondaryColor', c)} />
        </Col>
      </Row>

      <Divider orientation="left" style={{ fontSize: 12, margin: '8px 0' }}>Format Nomor Invoice</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Prefix Invoice</Text>
          <Input value={template.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value.toUpperCase())} placeholder="INV" />
        </Col>
        <Col span={16}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Format Nomor</Text>
          <Input value={template.invoiceNumberFormat} disabled />
        </Col>
      </Row>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Contoh hasil: <strong>{template.invoicePrefix || 'INV'}-{dayjs().format('YYYYMMDD')}-001</strong>
      </Text>
    </Space>
  );

  const tandaTanganTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={12}>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Penandatangan</Text>
          <Input value={template.signatureName} onChange={(e) => update('signatureName', e.target.value)} placeholder="Ahmad Direktur" />
        </Col>
        <Col span={12}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Jabatan</Text>
          <Input value={template.signatureTitle} onChange={(e) => update('signatureTitle', e.target.value)} placeholder="Direktur Utama" />
        </Col>
      </Row>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Upload Tanda Tangan Digital</Text>
        <Row gutter={12} align="middle">
          <Col>
            <Upload listType="picture-card" maxCount={1} showUploadList={false} beforeUpload={() => false}>
              <div><UploadOutlined /><div style={{ marginTop: 4, fontSize: 11 }}>Upload TTD</div></div>
            </Upload>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="Atau masukkan URL gambar tanda tangan"
              value={template.signatureImageUrl}
              onChange={(e) => update('signatureImageUrl', e.target.value)}
            />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
              Format: PNG transparan, ukuran maks 200x100px
            </Text>
          </Col>
        </Row>
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Upload Stempel Perusahaan</Text>
        <Row gutter={12} align="middle">
          <Col>
            <Upload listType="picture-card" maxCount={1} showUploadList={false} beforeUpload={() => false}>
              <div><UploadOutlined /><div style={{ marginTop: 4, fontSize: 11 }}>Stempel</div></div>
            </Upload>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="Atau masukkan URL gambar stempel"
              value={template.stampImageUrl}
              onChange={(e) => update('stampImageUrl', e.target.value)}
            />
          </Col>
        </Row>
      </div>

      <Divider orientation="left" style={{ fontSize: 12, margin: '8px 0' }}>Preview Tanda Tangan</Divider>

      <Card size="small" style={{ maxWidth: 240, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>Hormat kami,</div>
        {template.signatureImageUrl ? (
          <Image src={template.signatureImageUrl} height={44} preview={false} style={{ marginBottom: 4 }} />
        ) : (
          <div style={{ height: 44, borderBottom: '1px dashed #d1d5db', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>(Tanda tangan)</Text>
          </div>
        )}
        {template.stampImageUrl && (
          <Image src={template.stampImageUrl} height={36} preview={false} style={{ opacity: 0.6, marginBottom: 4 }} />
        )}
        <div style={{ borderTop: '1px solid #374151', paddingTop: 4, marginTop: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{template.signatureName || '(Nama)'}</div>
          <div style={{ color: '#6b7280', fontSize: 11 }}>{template.signatureTitle || '(Jabatan)'}</div>
        </div>
      </Card>
    </Space>
  );

  const bankTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card size="small" title="Rekening Utama" type="inner">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Bank</Text>
            <Select
              value={template.bankName || undefined}
              onChange={(v) => update('bankName', v)}
              style={{ width: '100%' }}
              placeholder="Pilih bank"
              allowClear
              showSearch
              options={BANK_OPTIONS.map((b) => ({ label: b, value: b }))}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Nomor Rekening</Text>
            <Input value={template.bankAccountNumber} onChange={(e) => update('bankAccountNumber', e.target.value)} placeholder="123-456-7890" />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Pemilik Rekening</Text>
            <Input value={template.bankAccountName} onChange={(e) => update('bankAccountName', e.target.value)} placeholder="PT CaritaHub Rental Indonesia" />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Cabang</Text>
            <Input value={template.bankBranch} onChange={(e) => update('bankBranch', e.target.value)} placeholder="KCP Jakarta Pusat" />
          </div>
        </Space>
      </Card>

      {template.additionalBanks.map((bank, idx) => (
        <Card
          key={idx}
          size="small"
          type="inner"
          title={`Rekening Tambahan ${idx + 1}`}
          extra={<Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeBank(idx)} />}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Select
              placeholder="Pilih Bank"
              style={{ width: '100%' }}
              value={bank.bankName || undefined}
              onChange={(v) => updateAdditionalBank(idx, 'bankName', v)}
              allowClear
              showSearch
              options={BANK_OPTIONS.map((b) => ({ label: b, value: b }))}
            />
            <Input
              placeholder="Nomor Rekening"
              value={bank.accountNumber}
              onChange={(e) => updateAdditionalBank(idx, 'accountNumber', e.target.value)}
            />
            <Input
              placeholder="Nama Pemilik"
              value={bank.accountName}
              onChange={(e) => updateAdditionalBank(idx, 'accountName', e.target.value)}
            />
          </Space>
        </Card>
      ))}

      <Button type="dashed" block icon={<PlusOutlined />} onClick={addBank}>
        Tambah Rekening Lain
      </Button>
    </Space>
  );

  const syaratTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Ketentuan Pembayaran</Text>
        <TextArea rows={2} value={template.paymentTerms} onChange={(e) => update('paymentTerms', e.target.value)} placeholder="Pembayaran dilakukan dalam 7 hari kerja..." />
      </div>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Syarat & Ketentuan</Text>
        <TextArea rows={6} value={template.termsAndConditions} onChange={(e) => update('termsAndConditions', e.target.value)} placeholder="Masukkan syarat dan ketentuan..." />
      </div>

      <Divider orientation="left" style={{ fontSize: 12, margin: '8px 0' }}>Footer Invoice</Divider>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Teks Footer</Text>
        <Input value={template.footerText} onChange={(e) => update('footerText', e.target.value)} placeholder="Terima kasih atas kepercayaan Anda..." />
      </div>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Catatan Tambahan</Text>
        <TextArea rows={2} value={template.footerNote} onChange={(e) => update('footerNote', e.target.value)} placeholder="Catatan tambahan di bagian bawah invoice" />
      </div>
    </Space>
  );

  const tabItems = [
    { key: 'identitas', label: <span><IdcardOutlined /> Identitas Perusahaan</span>, children: identitasTab },
    { key: 'gaya', label: <span><HighlightOutlined /> Gaya Invoice</span>, children: gayaTab },
    { key: 'tandatangan', label: <span><EditOutlined /> Tanda Tangan</span>, children: tandaTanganTab },
    { key: 'bank', label: <span><BankOutlined /> Informasi Bank</span>, children: bankTab },
    { key: 'syarat', label: <span><FileTextOutlined /> Syarat & Ketentuan</span>, children: syaratTab },
  ];

  return (
    <div>
      <PageHeader
        title="Template Invoice"
        subtitle="Kustomisasi tampilan invoice sesuai branding perusahaan Anda"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Pengaturan', path: '/settings' },
          { title: 'Template Invoice' },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings')}>
          Kembali
        </Button>
      </PageHeader>

      <Row gutter={20}>
        {/* LEFT: Settings */}
        <Col xs={24} lg={14}>
          <Card loading={loading}>
            <Tabs items={tabItems} />

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={handleReset}>Reset ke Default</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving} size="large">
                Simpan Template
              </Button>
            </div>
          </Card>
        </Col>

        {/* RIGHT: Live Preview */}
        <Col xs={24} lg={10}>
          <div style={{ position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Space>
                <EyeOutlined />
                <Text strong>Preview Invoice</Text>
              </Space>
              <Tag color="blue">Live Preview</Tag>
            </div>
            <InvoicePreview t={template} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceTemplatePage;
