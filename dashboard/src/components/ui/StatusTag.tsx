import React from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  type: 'booking' | 'payment' | 'car' | 'driver' | 'maintenance';
}

const colorMap: Record<string, Record<string, string>> = {
  booking: {
    PENDING: 'orange',
    CONFIRMED: 'blue',
    ONGOING: 'green',
    COMPLETED: 'default',
    CANCELLED: 'red',
    OVERDUE: 'volcano',
  },
  payment: {
    PENDING: 'orange',
    PAID: 'green',
    PARTIAL: 'cyan',
    REFUNDED: 'purple',
    FAILED: 'red',
    EXPIRED: 'default',
  },
  car: {
    AVAILABLE: 'green',
    RENTED: 'blue',
    MAINTENANCE: 'orange',
    INACTIVE: 'default',
  },
  driver: {
    AVAILABLE: 'green',
    ON_TRIP: 'blue',
    OFF_DUTY: 'orange',
    INACTIVE: 'default',
  },
  maintenance: {
    SCHEDULED: 'blue',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red',
  },
};

const labelMap: Record<string, Record<string, string>> = {
  booking: {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    ONGOING: 'Berlangsung',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    OVERDUE: 'Terlambat',
  },
  payment: {
    PENDING: 'Menunggu',
    PAID: 'Lunas',
    PARTIAL: 'Sebagian',
    REFUNDED: 'Dikembalikan',
    FAILED: 'Gagal',
    EXPIRED: 'Kadaluarsa',
  },
  car: {
    AVAILABLE: 'Tersedia',
    RENTED: 'Disewa',
    MAINTENANCE: 'Perawatan',
    INACTIVE: 'Nonaktif',
  },
  driver: {
    AVAILABLE: 'Tersedia',
    ON_TRIP: 'Dalam Perjalanan',
    OFF_DUTY: 'Libur',
    INACTIVE: 'Nonaktif',
  },
  maintenance: {
    SCHEDULED: 'Terjadwal',
    IN_PROGRESS: 'Dalam Proses',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  },
};

const StatusTag: React.FC<StatusTagProps> = ({ status, type }) => {
  const color = colorMap[type]?.[status] || 'default';
  const label = labelMap[type]?.[status] || status;

  return <Tag color={color}>{label}</Tag>;
};

export default StatusTag;
