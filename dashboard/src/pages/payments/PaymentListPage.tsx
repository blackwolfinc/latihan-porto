import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { paymentsService } from '@/services/payments.service';
import type { Payment, PaymentStatus } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsService.getAll({ page, limit: 10, status: statusFilter, startDate: dateRange?.[0], endDate: dateRange?.[1] });
      setPayments(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter, dateRange]);

  const columns = [
    { title: 'Order ID', dataIndex: 'midtransOrderId', key: 'midtransOrderId', render: (v: string) => v || '-' },
    { title: 'Customer', key: 'customer', render: (_: any, r: Payment) => r.booking?.customer?.name || '-' },
    { title: 'Booking', key: 'booking', render: (_: any, r: Payment) => r.booking?.bookingNumber || '-' },
    { title: 'Metode', dataIndex: 'method', key: 'method' },
    { title: 'Jumlah', dataIndex: 'amount', key: 'amount', render: (a: number) => `Rp ${a?.toLocaleString('id-ID')}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} type="payment" /> },
    { title: 'Tanggal', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Aksi', key: 'action', width: 80,
      render: (_: any, r: Payment) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/payments/${r.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Pembayaran"
        subtitle={`Total ${total} pembayaran`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Pembayaran' }]}
      />
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={12}>
        <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <Option value="PENDING">Menunggu</Option>
          <Option value="PAID">Lunas</Option>
          <Option value="PARTIAL">Sebagian</Option>
          <Option value="REFUNDED">Dikembalikan</Option>
          <Option value="FAILED">Gagal</Option>
          <Option value="EXPIRED">Kadaluarsa</Option>
        </Select>
        <RangePicker onChange={(_, ds) => { setDateRange(ds[0] && ds[1] ? ds as [string, string] : undefined); setPage(1); }} />
      </Space>
      <Table columns={columns} dataSource={payments} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default PaymentListPage;
