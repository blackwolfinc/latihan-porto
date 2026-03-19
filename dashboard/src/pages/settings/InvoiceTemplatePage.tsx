import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Form, Input, Button, Upload, Tabs, Space,
  ColorPicker, Divider, Select, message, Image, Tag,
} from 'antd';
import {
  UploadOutlined, BankOutlined, PlusOutlined, DeleteOutlined,
  FileTextOutlined, SaveOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const BANK_OPTIONS = [
  'Bank BCA', 'Bank BNI', 'Bank BRI', 'Bank Mandiri',
  'Bank CIMB Niaga', 'Bank Permata', 'Bank Danamon',
  'Bank Syariah Indonesia (BSI)', 'Bank BTPN', 'Bank Mega',
];

const InvoiceTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [template, setTemplate] = useState({
    logoUrl: '',
    companyName: 'Caritahub Rental',
    companyTagline: 'Solusi Rental Mobil Terpercaya',
    headerAddress: 'Jl. Sudirman No. 123',
    headerCity: 'Jakarta Pusat, DKI Jakarta 10220',
    headerPhone: '(021) 555-1234',
    headerEmail: 'info@caritahub.com',
    headerWebsite: 'www.caritahub.com',
    headerNpwp: '01.234.567.8-901.000',
    primaryColor: '#1a56db',
    secondaryColor: '#6b7280',
    invoicePrefix: 'INV',
    signatureName: 'Ahmad Wijaya',
    signatureTitle: 'Direktur Utama',
    signatureImageUrl: '',
    stampImageUrl: '',
    bankName: 'Bank BCA',
    bankAccountNumber: '123-456-7890',
    bankAccountName: 'PT Caritahub Rental Indonesia',
    bankBranch: 'KCP Jakarta Pusat',
    additionalBanks: [] as BankAccount[],
    termsAndConditions: '1. Pembayaran dilakukan sebelum masa sewa dimulai.\n2. Keterlambatan pengembalian dikenakan denda 25% per hari.\n3. Kerusakan di luar asuransi menjadi tanggung jawab penyewa.\n4. Pembatalan H-1 dikenakan biaya 50% dari total sewa.',
    paymentTerms: 'Pembayaran dilakukan dalam 7 hari kerja setelah invoice diterbitkan.',
    footerText: 'Terima kasih atas kepercayaan Anda menggunakan layanan Caritahub Rental.',
    footerNote: 'Invoice ini sah tanpa tanda tangan basah.',
  });

  const updateTemplate = (key: string, value: any) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleSave = () => {
    message.success('Template invoice berhasil disimpan');
  };

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  // === LIVE PREVIEW ===
  const InvoicePreview = () => (
    <div style={{
      background: '#fff', padding: 32, borderRadius: 8, fontSize: 11,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)', minHeight: 600,
      border: '1px solid #e8e8e8',
    }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${template.primaryColor}`, paddingBottom: 16, marginBottom: 16 }}>
        <Row justify="space-between" align="top">
          <Col>
            {template.logoUrl ? (
              <Image src={template.logoUrl} height={40} preview={false} />
            ) : (
              <div style={{
                width: 40, height: 40, background: template.primaryColor,
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16,
              }}>
                {template.companyName.charAt(0)}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: template.primaryColor }}>
                {template.companyName}
              </div>
              {template.companyTagline && (
                <div style={{ color: template.secondaryColor, fontSize: 9, fontStyle: 'italic' }}>
                  {template.companyTagline}
                </div>
              )}
            </div>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: template.primaryColor, letterSpacing: 2 }}>
              INVOICE
            </div>
            <div style={{ color: template.secondaryColor, marginTop: 4 }}>
              <div>{template.invoicePrefix}-20260319-001</div>
              <div>Tanggal: 19 Maret 2026</div>
              <div>Jatuh Tempo: 26 Maret 2026</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Company Info + Customer */}
      <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div style={{ color: template.secondaryColor, fontSize: 9, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            Dari
          </div>
          <div style={{ fontWeight: 600 }}>{template.companyName}</div>
          <div>{template.headerAddress}</div>
          <div>{template.headerCity}</div>
          <div>{template.headerPhone}</div>
          <div>{template.headerEmail}</div>
          {template.headerNpwp && <div>NPWP: {template.headerNpwp}</div>}
        </Col>
        <Col span={12}>
          <div style={{ color: template.secondaryColor, fontSize: 9, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            Kepada
          </div>
          <div style={{ fontWeight: 600 }}>Budi Santoso</div>
          <div>Jl. Merdeka No. 45</div>
          <div>Jakarta Selatan</div>
          <div>0812-3456-7890</div>
          <div>budi@email.com</div>
        </Col>
      </Row>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: template.primaryColor, color: '#fff' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10 }}>No</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10 }}>Deskripsi</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 10 }}>Qty</th>
            <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10 }}>Harga Satuan</th>
            <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10 }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px' }}>1</td>
            <td style={{ padding: '6px 8px' }}>Sewa Toyota Avanza (B 1234 ABC) - 3 hari</td>
            <td style={{ padding: '6px 8px', textAlign: 'center' }}>3</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatRp(350000)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatRp(1050000)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px' }}>2</td>
            <td style={{ padding: '6px 8px' }}>Biaya Driver - 3 hari</td>
            <td style={{ padding: '6px 8px', textAlign: 'center' }}>3</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatRp(200000)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatRp(600000)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col span={10}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Subtotal</span><span>{formatRp(1650000)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Diskon</span><span>-{formatRp(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>PPN (11%)</span><span>{formatRp(181500)}</span>
          </div>
          <Divider style={{ margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 700, fontSize: 13, color: template.primaryColor }}>
            <span>TOTAL</span><span>{formatRp(1831500)}</span>
          </div>
        </Col>
      </Row>

      {/* Bank Info */}
      <div style={{ background: '#f9fafb', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 600, fontSize: 10, marginBottom: 6, color: template.primaryColor }}>
          Informasi Pembayaran
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{template.bankName}</span> - {template.bankAccountNumber}
        </div>
        <div>a.n. {template.bankAccountName}</div>
        {template.bankBranch && <div style={{ color: template.secondaryColor }}>{template.bankBranch}</div>}
        {template.paymentTerms && (
          <div style={{ marginTop: 6, fontSize: 9, color: template.secondaryColor }}>
            {template.paymentTerms}
          </div>
        )}
      </div>

      {/* Signature */}
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col span={8} style={{ textAlign: 'center' }}>
          <div style={{ color: template.secondaryColor, fontSize: 9, marginBottom: 40 }}>
            Jakarta, 19 Maret 2026
          </div>
          {template.signatureImageUrl ? (
            <Image src={template.signatureImageUrl} height={40} preview={false} />
          ) : (
            <div style={{ borderBottom: '1px solid #ccc', marginBottom: 4, height: 40 }} />
          )}
          <div style={{ fontWeight: 600 }}>{template.signatureName || '________________'}</div>
          <div style={{ color: template.secondaryColor, fontSize: 9 }}>{template.signatureTitle}</div>
        </Col>
      </Row>

      {/* Footer */}
      {template.footerText && (
        <div style={{ textAlign: 'center', color: template.secondaryColor, fontSize: 9, borderTop: `1px solid ${template.primaryColor}20`, paddingTop: 8 }}>
          <div>{template.footerText}</div>
          {template.footerNote && <div style={{ fontStyle: 'italic', marginTop: 2 }}>{template.footerNote}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Template Invoice</Title>
          <Text type="secondary">Kustomisasi tampilan invoice sesuai branding perusahaan Anda</Text>
        </div>
        <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave}>
          Simpan Template
        </Button>
      </div>

      <Row gutter={24}>
        {/* LEFT: Settings Form */}
        <Col xs={24} lg={14}>
          <Card>
            <Tabs defaultActiveKey="identity" items={[
              {
                key: 'identity',
                label: 'Identitas Perusahaan',
                children: (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Logo Perusahaan</Text>
                      <Upload listType="picture-card" maxCount={1} showUploadList={false}>
                        <div><UploadOutlined /><div style={{ marginTop: 4 }}>Upload Logo</div></div>
                      </Upload>
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Perusahaan</Text>
                      <Input value={template.companyName} onChange={(e) => updateTemplate('companyName', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Tagline</Text>
                      <Input value={template.companyTagline} onChange={(e) => updateTemplate('companyTagline', e.target.value)} placeholder="Solusi Rental Mobil Terpercaya" />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Alamat</Text>
                      <Input value={template.headerAddress} onChange={(e) => updateTemplate('headerAddress', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Kota</Text>
                      <Input value={template.headerCity} onChange={(e) => updateTemplate('headerCity', e.target.value)} />
                    </div>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>Telepon</Text>
                        <Input value={template.headerPhone} onChange={(e) => updateTemplate('headerPhone', e.target.value)} />
                      </Col>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>Email</Text>
                        <Input value={template.headerEmail} onChange={(e) => updateTemplate('headerEmail', e.target.value)} />
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>Website</Text>
                        <Input value={template.headerWebsite} onChange={(e) => updateTemplate('headerWebsite', e.target.value)} />
                      </Col>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>NPWP</Text>
                        <Input value={template.headerNpwp} onChange={(e) => updateTemplate('headerNpwp', e.target.value)} />
                      </Col>
                    </Row>
                  </Space>
                ),
              },
              {
                key: 'style',
                label: 'Gaya Invoice',
                children: (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Warna Utama</Text>
                        <Input type="color" value={template.primaryColor} onChange={(e) => updateTemplate('primaryColor', e.target.value)} style={{ width: 80, height: 36 }} />
                        <Text style={{ marginLeft: 8 }}>{template.primaryColor}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Warna Sekunder</Text>
                        <Input type="color" value={template.secondaryColor} onChange={(e) => updateTemplate('secondaryColor', e.target.value)} style={{ width: 80, height: 36 }} />
                        <Text style={{ marginLeft: 8 }}>{template.secondaryColor}</Text>
                      </Col>
                    </Row>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Prefix Nomor Invoice</Text>
                      <Input value={template.invoicePrefix} onChange={(e) => updateTemplate('invoicePrefix', e.target.value)} style={{ width: 120 }} />
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        Contoh: {template.invoicePrefix}-20260319-001
                      </Text>
                    </div>
                  </Space>
                ),
              },
              {
                key: 'signature',
                label: 'Tanda Tangan',
                children: (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Penandatangan</Text>
                      <Input value={template.signatureName} onChange={(e) => updateTemplate('signatureName', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Jabatan</Text>
                      <Input value={template.signatureTitle} onChange={(e) => updateTemplate('signatureTitle', e.target.value)} placeholder="Direktur Utama" />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Upload Tanda Tangan Digital</Text>
                      <Upload listType="picture-card" maxCount={1} showUploadList={false}>
                        <div><UploadOutlined /><div style={{ marginTop: 4 }}>Upload TTD</div></div>
                      </Upload>
                      <Text type="secondary">Format: PNG transparan, ukuran maks 200x100px</Text>
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Upload Stempel Perusahaan</Text>
                      <Upload listType="picture-card" maxCount={1} showUploadList={false}>
                        <div><UploadOutlined /><div style={{ marginTop: 4 }}>Upload Stempel</div></div>
                      </Upload>
                    </div>
                  </Space>
                ),
              },
              {
                key: 'bank',
                label: 'Informasi Bank',
                children: (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Card size="small" title="Rekening Utama" type="inner">
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Bank</Text>
                          <Select value={template.bankName} onChange={(v) => updateTemplate('bankName', v)} style={{ width: '100%' }} options={BANK_OPTIONS.map((b) => ({ label: b, value: b }))} />
                        </div>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>Nomor Rekening</Text>
                          <Input value={template.bankAccountNumber} onChange={(e) => updateTemplate('bankAccountNumber', e.target.value)} />
                        </div>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>Nama Pemilik Rekening</Text>
                          <Input value={template.bankAccountName} onChange={(e) => updateTemplate('bankAccountName', e.target.value)} />
                        </div>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>Cabang</Text>
                          <Input value={template.bankBranch} onChange={(e) => updateTemplate('bankBranch', e.target.value)} />
                        </div>
                      </Space>
                    </Card>

                    {template.additionalBanks.map((bank, idx) => (
                      <Card
                        key={idx} size="small" type="inner"
                        title={`Rekening Tambahan ${idx + 1}`}
                        extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeBank(idx)} />}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Select
                            placeholder="Pilih Bank" style={{ width: '100%' }}
                            value={bank.bankName || undefined}
                            onChange={(v) => {
                              const banks = [...template.additionalBanks];
                              banks[idx] = { ...banks[idx], bankName: v };
                              updateTemplate('additionalBanks', banks);
                            }}
                            options={BANK_OPTIONS.map((b) => ({ label: b, value: b }))}
                          />
                          <Input
                            placeholder="Nomor Rekening" value={bank.accountNumber}
                            onChange={(e) => {
                              const banks = [...template.additionalBanks];
                              banks[idx] = { ...banks[idx], accountNumber: e.target.value };
                              updateTemplate('additionalBanks', banks);
                            }}
                          />
                          <Input
                            placeholder="Nama Pemilik" value={bank.accountName}
                            onChange={(e) => {
                              const banks = [...template.additionalBanks];
                              banks[idx] = { ...banks[idx], accountName: e.target.value };
                              updateTemplate('additionalBanks', banks);
                            }}
                          />
                        </Space>
                      </Card>
                    ))}
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={addBank}>
                      Tambah Rekening Lain
                    </Button>
                  </Space>
                ),
              },
              {
                key: 'terms',
                label: 'Syarat & Ketentuan',
                children: (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Ketentuan Pembayaran</Text>
                      <TextArea rows={2} value={template.paymentTerms} onChange={(e) => updateTemplate('paymentTerms', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Syarat & Ketentuan</Text>
                      <TextArea rows={6} value={template.termsAndConditions} onChange={(e) => updateTemplate('termsAndConditions', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Teks Footer</Text>
                      <Input value={template.footerText} onChange={(e) => updateTemplate('footerText', e.target.value)} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Catatan Tambahan</Text>
                      <Input value={template.footerNote} onChange={(e) => updateTemplate('footerNote', e.target.value)} />
                    </div>
                  </Space>
                ),
              },
            ]} />
          </Card>
        </Col>

        {/* RIGHT: Live Preview */}
        <Col xs={24} lg={10}>
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong><EyeOutlined /> Preview Invoice</Text>
              <Tag color="blue">Live Preview</Tag>
            </div>
            <InvoicePreview />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceTemplatePage;
