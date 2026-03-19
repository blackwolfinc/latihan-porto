import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Space, Button, Tabs, Modal, Descriptions, Image, Progress,
  message, Input, Typography, Avatar, Card, Row, Col,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  SearchOutlined, UserOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { verificationService, CustomerVerification } from '@/services/verification.service';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'orange' },
  IN_REVIEW: { label: 'Sedang Direview', color: 'blue' },
  VERIFIED: { label: 'Terverifikasi', color: 'green' },
  REJECTED: { label: 'Ditolak', color: 'red' },
};

const getRiskColor = (score: number) => {
  if (score <= 20) return '#52c41a';
  if (score <= 50) return '#faad14';
  return '#f5222d';
};

const getRiskLabel = (score: number) => {
  if (score <= 20) return 'Rendah';
  if (score <= 50) return 'Sedang';
  return 'Tinggi';
};

const VerificationListPage: React.FC = () => {
  const [data, setData] = useState<CustomerVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CustomerVerification | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const statusForTab: Record<string, string | undefined> = {
    PENDING: 'PENDING',
    IN_REVIEW: 'IN_REVIEW',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusForTab[activeTab];
      const { data: res } = await verificationService.getVerifications({
        page,
        limit: 10,
        status,
      });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error('Gagal memuat data verifikasi');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const openDetail = (record: CustomerVerification) => {
    setSelectedRecord(record);
    setDetailModal(true);
  };

  const openReview = (record: CustomerVerification) => {
    setSelectedRecord(record);
    setRejectionReason('');
    setReviewModal(true);
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedRecord) return;
    if (!approved && !rejectionReason.trim()) {
      message.warning('Masukkan alasan penolakan');
      return;
    }
    setReviewLoading(true);
    try {
      await verificationService.reviewVerification(selectedRecord.id, {
        approved,
        rejectionReason: approved ? undefined : rejectionReason,
      });
      message.success(approved ? 'Verifikasi disetujui' : 'Verifikasi ditolak');
      setReviewModal(false);
      setDetailModal(false);
      fetchData();
    } catch {
      message.error('Gagal memproses review');
    } finally {
      setReviewLoading(false);
    }
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: CustomerVerification) => (
        <Space>
          <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.user?.name || '-'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'No. KTP',
      dataIndex: 'ktpNumber',
      key: 'ktpNumber',
      render: (val: string) => val || '-',
    },
    {
      title: 'No. SIM',
      dataIndex: 'simNumber',
      key: 'simNumber',
      render: (val: string) => val || '-',
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 160,
      render: (score: number) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Progress
            percent={score}
            size="small"
            strokeColor={getRiskColor(score)}
            format={() => `${score}`}
          />
          <Text style={{ fontSize: 11, color: getRiskColor(score) }}>
            {getRiskLabel(score)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status: string) => {
        const cfg = statusConfig[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Tanggal',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 200,
      render: (_: any, record: CustomerVerification) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
            Detail
          </Button>
          {(record.verificationStatus === 'PENDING' || record.verificationStatus === 'IN_REVIEW') && (
            <Button type="link" onClick={() => openReview(record)}>
              Review
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'PENDING', label: 'Menunggu Review' },
    { key: 'VERIFIED', label: 'Diverifikasi' },
    { key: 'REJECTED', label: 'Ditolak' },
  ];

  return (
    <div>
      <PageHeader
        title="Verifikasi Identitas"
        subtitle="Kelola verifikasi KTP/SIM customer"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Verifikasi' },
        ]}
      />

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Total ${t} data`,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Detail Verifikasi"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        width={800}
        footer={
          selectedRecord &&
          (selectedRecord.verificationStatus === 'PENDING' || selectedRecord.verificationStatus === 'IN_REVIEW')
            ? [
                <Button
                  key="reject"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailModal(false);
                    openReview(selectedRecord);
                  }}
                >
                  Tolak
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => {
                    setSelectedRecord(selectedRecord);
                    handleReview(true);
                  }}
                >
                  Setujui
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => setDetailModal(false)}>
                  Tutup
                </Button>,
              ]
        }
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Nama Customer">{selectedRecord.user?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.user?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Telepon">{selectedRecord.user?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusConfig[selectedRecord.verificationStatus]?.color}>
                  {statusConfig[selectedRecord.verificationStatus]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="No. KTP">{selectedRecord.ktpNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nama KTP">{selectedRecord.ktpName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Alamat KTP" span={2}>{selectedRecord.ktpAddress || '-'}</Descriptions.Item>
              <Descriptions.Item label="No. SIM">{selectedRecord.simNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tipe SIM">{selectedRecord.simType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Expired SIM">
                {selectedRecord.simExpiryDate
                  ? dayjs(selectedRecord.simExpiryDate).format('DD/MM/YYYY')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score">
                <Space>
                  <Progress
                    type="circle"
                    percent={selectedRecord.riskScore}
                    width={48}
                    strokeColor={getRiskColor(selectedRecord.riskScore)}
                    format={() => `${selectedRecord.riskScore}`}
                  />
                  <Text style={{ color: getRiskColor(selectedRecord.riskScore) }}>
                    {getRiskLabel(selectedRecord.riskScore)}
                  </Text>
                </Space>
              </Descriptions.Item>
              {selectedRecord.verificationStatus === 'REJECTED' && (
                <Descriptions.Item label="Alasan Penolakan" span={2}>
                  <Text type="danger">{selectedRecord.rejectionReason || '-'}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tanggal Submit" span={2}>
                {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16}>
              {selectedRecord.ktpPhotoUrl && (
                <Col span={8}>
                  <Card size="small" title="Foto KTP">
                    <Image
                      src={selectedRecord.ktpPhotoUrl}
                      alt="KTP"
                      style={{ width: '100%', borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJpAN4kMbcJQAAAABJRU5ErkJggg=="
                    />
                  </Card>
                </Col>
              )}
              {selectedRecord.simPhotoUrl && (
                <Col span={8}>
                  <Card size="small" title="Foto SIM">
                    <Image
                      src={selectedRecord.simPhotoUrl}
                      alt="SIM"
                      style={{ width: '100%', borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJpAN4kMbcJQAAAABJRU5ErkJggg=="
                    />
                  </Card>
                </Col>
              )}
              {selectedRecord.selfiePhotoUrl && (
                <Col span={8}>
                  <Card size="small" title="Selfie dengan KTP">
                    <Image
                      src={selectedRecord.selfiePhotoUrl}
                      alt="Selfie"
                      style={{ width: '100%', borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJpAN4kMbcJQAAAABJRU5ErkJggg=="
                    />
                  </Card>
                </Col>
              )}
            </Row>
          </>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Review Verifikasi"
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewModal(false)}>
            Batal
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            loading={reviewLoading}
            onClick={() => handleReview(false)}
          >
            Tolak
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={reviewLoading}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleReview(true)}
          >
            Setujui
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Customer">{selectedRecord.user?.name}</Descriptions.Item>
              <Descriptions.Item label="No. KTP">{selectedRecord.ktpNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="No. SIM">{selectedRecord.simNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Risk Score">
                <Text style={{ color: getRiskColor(selectedRecord.riskScore), fontWeight: 'bold' }}>
                  {selectedRecord.riskScore} - {getRiskLabel(selectedRecord.riskScore)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginBottom: 8 }}>
              <Text>Alasan Penolakan (wajib jika menolak):</Text>
            </div>
            <TextArea
              rows={3}
              placeholder="Masukkan alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VerificationListPage;
