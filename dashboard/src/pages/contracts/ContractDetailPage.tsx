import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  message,
  Spin,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { contractsService } from '@/services/contracts.service';
import type { Contract } from '@/types';

const { Text, Title, Paragraph } = Typography;

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

const ContractDetailPage: React.FC = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const { data } = await contractsService.getById(id!);
      setContract(data.data);
    } catch {
      message.error('Gagal memuat detail kontrak');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await contractsService.downloadPdf(id!);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kontrak-${contract?.contractNumber || id!.slice(0, 8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Gagal mengunduh PDF');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contract) {
    return <Empty description="Data kontrak tidak ditemukan" />;
  }

  return (
    <div>
      <PageHeader
        title={`Kontrak #${contract.contractNumber}`}
        subtitle="Detail kontrak rental"
        breadcrumbs={[
          { title: 'Kontrak', path: '/contracts' },
          { title: 'Detail' },
        ]}
      >
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Syarat & Ketentuan" style={{ marginBottom: 16 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
              {contract.terms || 'Tidak ada syarat & ketentuan tercatat.'}
            </Paragraph>
          </Card>

          {contract.booking && (
            <Card title="Ringkasan Booking" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="No. Booking">
                  <Text strong>{contract.booking.bookingNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status Booking">
                  <StatusTag type="booking" status={contract.booking.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {contract.booking.customer?.name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Mobil">
                  {contract.booking.car
                    ? `${contract.booking.car.brand} ${contract.booking.car.model} (${contract.booking.car.plateNumber})`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Tanggal Mulai">
                  {dayjs(contract.booking.startDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tanggal Selesai">
                  {dayjs(contract.booking.endDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <Text strong>{formatRupiah(contract.booking.totalAmount)}</Text>
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Button
                type="link"
                icon={<LinkOutlined />}
                onClick={() => navigate(`/bookings/${contract.bookingId}`)}
              >
                Lihat Detail Booking
              </Button>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Status Tanda Tangan" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                {contract.signedAt ? (
                  <>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <Title level={5} style={{ marginTop: 12, color: '#52c41a' }}>
                      Sudah Ditandatangani
                    </Title>
                    <Text type="secondary">
                      {dayjs(contract.signedAt).format('DD MMMM YYYY HH:mm')}
                    </Text>
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
                    <Title level={5} style={{ marginTop: 12, color: '#faad14' }}>
                      Menunggu Tanda Tangan
                    </Title>
                    <Text type="secondary">Kontrak belum ditandatangani</Text>
                  </>
                )}
              </div>
              {contract.signatureUrl && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={contract.signatureUrl}
                      alt="Tanda tangan"
                      style={{ maxWidth: '100%', maxHeight: 100, border: '1px solid #f0f0f0', borderRadius: 4, padding: 8 }}
                    />
                  </div>
                </>
              )}
            </Space>
          </Card>

          <Card title="Informasi Kontrak">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="No. Kontrak">
                <Text strong>{contract.contractNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat">
                {dayjs(contract.createdAt).format('DD MMMM YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Diperbarui">
                {dayjs(contract.updatedAt).format('DD MMMM YYYY HH:mm')}
              </Descriptions.Item>
              {contract.fileUrl && (
                <Descriptions.Item label="File">
                  <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer">
                    Lihat File
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContractDetailPage;
