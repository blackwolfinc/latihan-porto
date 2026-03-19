import React from 'react';
import { Card, Statistic, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, prefix, suffix, loading }) => {
  return (
    <Card loading={loading} hoverable style={{ height: '100%' }}>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space>
          <span style={{ fontSize: 24, color: '#1677ff' }}>{icon}</span>
          <Text type="secondary">{title}</Text>
        </Space>
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ fontSize: 28, fontWeight: 600 }}
        />
        {trend !== undefined && (
          <Space>
            {trend >= 0 ? (
              <Text style={{ color: '#52c41a', fontSize: 13 }}>
                <ArrowUpOutlined /> {trend}%
              </Text>
            ) : (
              <Text style={{ color: '#ff4d4f', fontSize: 13 }}>
                <ArrowDownOutlined /> {Math.abs(trend)}%
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: 13 }}>dari bulan lalu</Text>
          </Space>
        )}
      </Space>
    </Card>
  );
};

export default StatCard;
