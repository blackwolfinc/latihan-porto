import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Spin, Empty, message, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { contractsService } from '@/services/contracts.service';
import type { Contract } from '@/types';

const { Paragraph } = Typography;

const ContractDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchContract(id); }, [id]);

  const fetchContract = async (contractId: string) => {
    try {
      const { data } = await contractsService.getById(contractId);
      setContract(data.data);
    } catch {
      message.error('Gagal memuat data kontrak');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!id) return;
    try {
      const response = await contractsService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contract?.contractNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Gagal mengunduh PDF');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!contract) return <Empty description="Kontrak tidak ditemukan" />;

  return (
    <div>
      <PageHeader
        title={`Kontrak ${contract.contractNumber}`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Kontrak', path: '/contracts' }, { title: contract.contractNumber }]}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/contracts')}>Kembali</Button>
          {contract.fileUrl && (
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>Download PDF</Button>
          )}
        </Space>
      </PageHeader>

      <Card title="Detail Kontrak" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="No. Kontrak">{contract.contractNumber}</Descriptions.Item>
          <Descriptions.Item label="Booking">{contract.booking?.bookingNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Customer">{contract.booking?.customer?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Mobil">{contract.booking?.car ? `${contract.booking.car.brand} ${contract.booking.car.model}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Dibuat">{dayjs(contract.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Status Tanda Tangan">
            {contract.signedAt ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Ditandatangani pada {dayjs(contract.signedAt).format('DD/MM/YYYY')}
              </Tag>
            ) : (
              <Tag color="warning">Belum ditandatangani</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Syarat & Ketentuan">
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {contract.terms || 'Tidak ada syarat dan ketentuan.'}
        </Paragraph>
      </Card>
    </div>
  );
};

export default ContractDetailPage;
