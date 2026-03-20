import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Tag, Table, Divider, Typography, Row, Col, message, Spin, Image } from 'antd';
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
import { invoiceTemplatesService } from '@/services/invoice-templates.service';

const { Text } = Typography;

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
/*  Template type                                                      */
/* ------------------------------------------------------------------ */

interface InvoiceTemplateData {
  logoUrl?: string;
  companyName?: string;
  companyTagline?: string;
  headerAddress?: string;
  headerCity?: string;
  headerPhone?: string;
  headerEmail?: string;
  headerWebsite?: string;
  headerNpwp?: string;
  primaryColor?: string;
  secondaryColor?: string;
  signatureName?: string;
  signatureTitle?: string;
  signatureImageUrl?: string;
  stampImageUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;
  additionalBanks?: { bankName: string; accountNumber: string; accountName: string }[];
  termsAndConditions?: string;
  paymentTerms?: string;
  footerText?: string;
  footerNote?: string;
  invoicePrefix?: string;
}

const DEFAULT_TEMPLATE: InvoiceTemplateData = {
  companyName: 'CaritaHub Rental',
  headerAddress: 'Jl. Jend. Sudirman Kav. 52-53',
  headerCity: 'Jakarta Selatan 12190',
  headerPhone: '(021) 555-1234',
  headerNpwp: '01.234.567.8-901.000',
  primaryColor: '#1565c0',
  secondaryColor: '#78909c',
  bankName: 'BCA',
  bankAccountNumber: '123-456-7890',
  bankAccountName: 'PT CaritaHub Rental Indonesia',
  footerText: 'Terima kasih atas kepercayaan Anda menggunakan layanan CaritaHub Rental.',
};

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
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const statusCfg = STATUS_MAP[invoice.status] || STATUS_MAP.DRAFT;

  const [tmpl, setTmpl] = useState<InvoiceTemplateData>(DEFAULT_TEMPLATE);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  // Load org template
  useEffect(() => {
    const load = async () => {
      try {
        const res = await invoiceTemplatesService.get();
        if (res.data) {
          setTmpl({ ...DEFAULT_TEMPLATE, ...res.data });
        }
      } catch {
        // use defaults
      } finally {
        setLoadingTemplate(false);
      }
    };
    load();
  }, []);

  const primary = tmpl.primaryColor || '#1565c0';
  const secondary = tmpl.secondaryColor || '#78909c';

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
          position: 'relative',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '48px 48px 36px' } }}
      >
        {/* FREE plan watermark */}
        {(() => {
          const plan = 'FREE'; // TODO: get from auth store
          if (plan !== 'FREE') return null;
          return (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                fontSize: 60,
                fontWeight: 900,
                color: 'rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 1,
                letterSpacing: 8,
                userSelect: 'none',
              }}
            >
              CARITAHUB RENTAL
            </div>
          );
        })()}

        {loadingTemplate ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <>
            {/* Header with template branding */}
            <Row justify="space-between" align="top" style={{ marginBottom: 32 }}>
              <Col>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  {tmpl.logoUrl ? (
                    <Image src={tmpl.logoUrl} height={44} preview={false} style={{ borderRadius: 6 }} />
                  ) : (
                    <div
                      style={{
                        width: 44, height: 44, background: primary, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 20,
                      }}
                    >
                      {(tmpl.companyName || 'C').charAt(0)}
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: primary, letterSpacing: -0.5 }}>
                      {tmpl.companyName || 'CaritaHub Rental'}
                    </span>
                    {tmpl.companyTagline && (
                      <div style={{ fontSize: 11, color: secondary, fontStyle: 'italic' }}>{tmpl.companyTagline}</div>
                    )}
                  </div>
                </div>
                <Text style={{ fontSize: 12, color: secondary, display: 'block', lineHeight: 1.6, marginTop: 4 }}>
                  {tmpl.headerAddress && <>{tmpl.headerAddress}<br /></>}
                  {tmpl.headerCity && <>{tmpl.headerCity}<br /></>}
                  {tmpl.headerPhone && <>Telp: {tmpl.headerPhone}<br /></>}
                  {tmpl.headerEmail && <>{tmpl.headerEmail}</>}
                </Text>
              </Col>
              <Col style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: primary, letterSpacing: 3, marginBottom: 8 }}>
                  INVOICE
                </div>
                <Text style={{ fontSize: 14, fontWeight: 600, color: '#263238', display: 'block' }}>
                  {invoice.invoiceNumber}
                </Text>
              </Col>
            </Row>

            {/* Colored separator */}
            <div style={{ height: 3, background: primary, borderRadius: 2, marginBottom: 28 }} />

            {/* From / To + Date info */}
            <Row gutter={32} style={{ marginBottom: 32 }}>
              <Col span={8}>
                <div style={{ fontSize: 11, fontWeight: 700, color: secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Dari
                </div>
                <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', color: '#263238' }}>
                  {tmpl.companyName || 'CaritaHub Rental'}
                </Text>
                <Text style={{ fontSize: 12, color: secondary, display: 'block', lineHeight: 1.6 }}>
                  {tmpl.headerAddress && <>{tmpl.headerAddress}<br /></>}
                  {tmpl.headerCity && <>{tmpl.headerCity}<br /></>}
                  {tmpl.headerNpwp && <>NPWP: {tmpl.headerNpwp}</>}
                </Text>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 11, fontWeight: 700, color: secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Kepada
                </div>
                <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', color: '#263238' }}>
                  {invoice.customer.name}
                </Text>
                <Text style={{ fontSize: 12, color: secondary, display: 'block', lineHeight: 1.6 }}>
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
                    <div style={{ fontSize: 11, color: secondary, fontWeight: 600, marginBottom: 2 }}>Tanggal Invoice</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#263238' }}>{dayjs(invoice.issueDate).format('DD MMMM YYYY')}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: secondary, fontWeight: 600, marginBottom: 2 }}>Jatuh Tempo</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#263238' }}>{dayjs(invoice.dueDate).format('DD MMMM YYYY')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: secondary, fontWeight: 600, marginBottom: 2 }}>Status</div>
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
              components={{
                header: {
                  cell: (props: any) => (
                    <th {...props} style={{ ...props.style, background: primary, color: '#fff', fontWeight: 600 }} />
                  ),
                },
              }}
            />

            {/* Totals */}
            <Row justify="end" style={{ marginBottom: 28 }}>
              <Col span={10}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: secondary }}>Subtotal</Text>
                    <Text style={{ fontWeight: 500 }}>{fmtRp(invoice.subtotal)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: secondary }}>Diskon</Text>
                    <Text style={{ color: '#2e7d32', fontWeight: 500 }}>- {fmtRp(invoice.discount)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: secondary }}>PPN ({invoice.taxRate}%)</Text>
                    <Text style={{ fontWeight: 500 }}>{fmtRp(invoice.taxAmount)}</Text>
                  </div>
                  <Divider style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text style={{ fontSize: 15, fontWeight: 700, color: '#263238' }}>Total</Text>
                    <Text style={{ fontSize: 22, fontWeight: 800, color: primary }}>{fmtRp(invoice.total)}</Text>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Bank info from template */}
            {(tmpl.bankName || tmpl.bankAccountNumber) && (
              <div
                style={{
                  background: `${primary}0D`,
                  borderRadius: 8,
                  padding: '14px 18px',
                  marginBottom: 20,
                  borderLeft: `3px solid ${primary}`,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 700, color: primary, display: 'block', marginBottom: 4 }}>
                  Informasi Pembayaran
                </Text>
                <Text style={{ fontSize: 13, color: '#37474f', display: 'block', lineHeight: 1.7 }}>
                  Bank {tmpl.bankName} &middot; No. Rekening: {tmpl.bankAccountNumber}<br />
                  a.n. {tmpl.bankAccountName}
                  {tmpl.bankBranch && <> &middot; {tmpl.bankBranch}</>}
                </Text>
                {tmpl.additionalBanks && tmpl.additionalBanks.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #ccc' }}>
                    {tmpl.additionalBanks.map((bank, idx) => (
                      <Text key={idx} style={{ fontSize: 12, color: '#37474f', display: 'block', lineHeight: 1.6 }}>
                        Bank {bank.bankName} &middot; No. Rekening: {bank.accountNumber} &middot; a.n. {bank.accountName}
                      </Text>
                    ))}
                  </div>
                )}
                {tmpl.paymentTerms && (
                  <Text style={{ fontSize: 11, color: secondary, display: 'block', marginTop: 6, fontStyle: 'italic' }}>
                    {tmpl.paymentTerms}
                  </Text>
                )}
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div
                style={{
                  background: '#f5f5f5',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  borderLeft: '3px solid #bdbdbd',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 600, color: secondary, display: 'block', marginBottom: 4 }}>
                  Catatan
                </Text>
                <Text style={{ fontSize: 12, color: '#546e7a' }}>{invoice.notes}</Text>
              </div>
            )}

            {/* Terms & Conditions from template */}
            {tmpl.termsAndConditions && (
              <div
                style={{
                  background: '#fafafa',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 24,
                  borderLeft: '3px solid #e0e0e0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 600, color: secondary, display: 'block', marginBottom: 4 }}>
                  Syarat & Ketentuan
                </Text>
                <Text style={{ fontSize: 11, color: '#546e7a', whiteSpace: 'pre-line' }}>{tmpl.termsAndConditions}</Text>
              </div>
            )}

            {/* Signature block from template */}
            {(tmpl.signatureName || tmpl.signatureTitle) && (
              <Row justify="end" style={{ marginBottom: 20 }}>
                <Col style={{ textAlign: 'center', minWidth: 180 }}>
                  <Text style={{ fontSize: 12, color: secondary, display: 'block', marginBottom: 8 }}>
                    Hormat kami,
                  </Text>
                  {tmpl.signatureImageUrl ? (
                    <Image src={tmpl.signatureImageUrl} height={48} preview={false} style={{ marginBottom: 4 }} />
                  ) : (
                    <div style={{ height: 48, marginBottom: 4 }} />
                  )}
                  {tmpl.stampImageUrl && (
                    <div style={{ marginBottom: 4 }}>
                      <Image src={tmpl.stampImageUrl} height={40} preview={false} style={{ opacity: 0.6 }} />
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #374151', paddingTop: 6, marginTop: 4 }}>
                    <Text style={{ fontWeight: 700, fontSize: 13, display: 'block' }}>{tmpl.signatureName}</Text>
                    <Text style={{ fontSize: 11, color: secondary, display: 'block' }}>{tmpl.signatureTitle}</Text>
                  </div>
                </Col>
              </Row>
            )}

            {/* Footer from template */}
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'center', paddingBottom: 8 }}>
              <Text style={{ fontSize: 13, color: secondary, fontStyle: 'italic' }}>
                {tmpl.footerText || 'Terima kasih atas kepercayaan Anda menggunakan layanan CaritaHub Rental.'}
              </Text>
              {tmpl.footerNote && (
                <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 4 }}>{tmpl.footerNote}</Text>
              )}
              {tmpl.headerWebsite && (
                <Text style={{ fontSize: 11, color: primary, display: 'block', marginTop: 4 }}>{tmpl.headerWebsite}</Text>
              )}
            </div>

            {/* FREE plan branding watermark footer */}
            {(() => {
              const plan = 'FREE'; // TODO: get from auth store
              if (plan !== 'FREE') return null;
              return (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 0 4px',
                    borderTop: '1px dashed #d9d9d9',
                    marginTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#bfbfbf' }}>
                    Powered by <strong style={{ color: '#8c8c8c' }}>CaritaHub Rental</strong> &mdash; Upgrade ke Standard untuk menghilangkan watermark
                  </Text>
                </div>
              );
            })()}
          </>
        )}
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
