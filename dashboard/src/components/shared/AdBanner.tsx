import React from 'react';
import { Alert, Button, Space } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface AdBannerProps {
  plan?: string;
  placement?: 'top' | 'sidebar' | 'inline';
}

const AdBanner: React.FC<AdBannerProps> = ({ plan = 'FREE', placement = 'top' }) => {
  const navigate = useNavigate();

  if (plan !== 'FREE') return null;

  if (placement === 'sidebar') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <CrownOutlined style={{ fontSize: 24, marginBottom: 8 }} />
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Upgrade ke Standard</div>
        <div style={{ fontSize: 12, marginBottom: 12, opacity: 0.9 }}>
          Hilangkan iklan & watermark
        </div>
        <Button
          size="small"
          style={{ background: '#fff', color: '#764ba2', border: 'none', fontWeight: 500 }}
          onClick={() => navigate('/settings', { state: { tab: 'subscription' } })}
        >
          Lihat Paket
        </Button>
      </div>
    );
  }

  if (placement === 'inline') {
    return (
      <div
        style={{
          background: '#f6f8ff',
          border: '1px dashed #adb5e3',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          textAlign: 'center',
          color: '#4a5568',
          fontSize: 13,
        }}
      >
        <Space>
          <span>Powered by <strong>Caritahub Rental</strong></span>
          <span style={{ color: '#8c8c8c' }}>|</span>
          <a onClick={() => navigate('/settings', { state: { tab: 'subscription' } })} style={{ color: '#1677ff', cursor: 'pointer' }}>
            Upgrade untuk menghilangkan iklan
          </a>
        </Space>
      </div>
    );
  }

  // Default: top banner
  return (
    <Alert
      type="info"
      showIcon
      icon={<CrownOutlined />}
      style={{ marginBottom: 16 }}
      message={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>
            Anda menggunakan paket <strong>Free</strong>. Upgrade ke <strong>Standard</strong> untuk menghilangkan iklan dan watermark.
          </span>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate('/settings', { state: { tab: 'subscription' } })}
          >
            Upgrade Sekarang
          </Button>
        </Space>
      }
    />
  );
};

export default AdBanner;
