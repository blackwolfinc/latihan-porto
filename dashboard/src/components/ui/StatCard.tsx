import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  trend,
  trendLabel,
  icon,
  color = '#1677ff',
  loading = false,
}) => {
  return (
    <Card loading={loading} hoverable style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Statistic
            title={title}
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
          />
          {trend !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Typography.Text
                type={trend >= 0 ? 'success' : 'danger'}
                style={{ fontSize: 13 }}
              >
                {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {' '}
                {Math.abs(trend)}%
                {trendLabel && (
                  <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                    {trendLabel}
                  </Typography.Text>
                )}
              </Typography.Text>
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
