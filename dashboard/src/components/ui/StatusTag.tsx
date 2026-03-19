import React from 'react';
import { Tag } from 'antd';
import {
  BookingStatus,
  PaymentStatus,
  CarStatus,
  DriverStatus,
  MaintenanceStatus,
} from '@/types';

const bookingStatusConfig: Record<BookingStatus, { color: string; label: string }> = {
  [BookingStatus.PENDING]: { color: 'orange', label: 'Menunggu' },
  [BookingStatus.CONFIRMED]: { color: 'blue', label: 'Dikonfirmasi' },
  [BookingStatus.ONGOING]: { color: 'green', label: 'Berlangsung' },
  [BookingStatus.COMPLETED]: { color: 'default', label: 'Selesai' },
  [BookingStatus.CANCELLED]: { color: 'red', label: 'Dibatalkan' },
  [BookingStatus.OVERDUE]: { color: 'volcano', label: 'Terlambat' },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string; label: string }> = {
  [PaymentStatus.PENDING]: { color: 'orange', label: 'Menunggu' },
  [PaymentStatus.PAID]: { color: 'green', label: 'Lunas' },
  [PaymentStatus.PARTIAL]: { color: 'blue', label: 'Sebagian' },
  [PaymentStatus.REFUNDED]: { color: 'purple', label: 'Dikembalikan' },
  [PaymentStatus.FAILED]: { color: 'red', label: 'Gagal' },
  [PaymentStatus.EXPIRED]: { color: 'default', label: 'Kadaluarsa' },
};

const carStatusConfig: Record<CarStatus, { color: string; label: string }> = {
  [CarStatus.AVAILABLE]: { color: 'green', label: 'Tersedia' },
  [CarStatus.RENTED]: { color: 'blue', label: 'Disewa' },
  [CarStatus.MAINTENANCE]: { color: 'orange', label: 'Perawatan' },
  [CarStatus.INACTIVE]: { color: 'default', label: 'Nonaktif' },
};

const driverStatusConfig: Record<DriverStatus, { color: string; label: string }> = {
  [DriverStatus.AVAILABLE]: { color: 'green', label: 'Tersedia' },
  [DriverStatus.ON_TRIP]: { color: 'blue', label: 'Dalam Perjalanan' },
  [DriverStatus.OFF_DUTY]: { color: 'orange', label: 'Libur' },
  [DriverStatus.INACTIVE]: { color: 'default', label: 'Nonaktif' },
};

const maintenanceStatusConfig: Record<MaintenanceStatus, { color: string; label: string }> = {
  [MaintenanceStatus.SCHEDULED]: { color: 'blue', label: 'Terjadwal' },
  [MaintenanceStatus.IN_PROGRESS]: { color: 'orange', label: 'Berlangsung' },
  [MaintenanceStatus.COMPLETED]: { color: 'green', label: 'Selesai' },
  [MaintenanceStatus.CANCELLED]: { color: 'red', label: 'Dibatalkan' },
};

interface StatusTagProps {
  type: 'booking' | 'payment' | 'car' | 'driver' | 'maintenance';
  status: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type, status }) => {
  let config: { color: string; label: string } | undefined;

  switch (type) {
    case 'booking':
      config = bookingStatusConfig[status as BookingStatus];
      break;
    case 'payment':
      config = paymentStatusConfig[status as PaymentStatus];
      break;
    case 'car':
      config = carStatusConfig[status as CarStatus];
      break;
    case 'driver':
      config = driverStatusConfig[status as DriverStatus];
      break;
    case 'maintenance':
      config = maintenanceStatusConfig[status as MaintenanceStatus];
      break;
  }

  if (!config) {
    return <Tag>{status}</Tag>;
  }

  return <Tag color={config.color}>{config.label}</Tag>;
};

export default StatusTag;
