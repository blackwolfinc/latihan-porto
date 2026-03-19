import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Input, Select, DatePicker, Button, message, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { paymentsService, type PaymentFilters } from '@/services/payments.service';
import type { Payment } from '@/types';
import { PaymentStatus } from '@/types';

const { RangePicker } = DatePicker;

const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<PaymentFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
  }, [pagination.current, filters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsService.getAll({ page: pagination.current, limit: pagination.pageSize, ...filters });
      setPayments(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Payment> = [
    { title: 'ID Transaksi', dataIndex: 'transactionId', key: 'transactionId', render: (t) => t || '-' },
    { title: 'No. Booking', dataIndex: ['booking', 'bookingNumber'], key: 'booking' },
    { title: 'Metode', dataIndex: 'method', key: 'method' },
    { title: 'Jumlah', dataIndex: 'amount', key: 'amount', render: (a) => `Rp ${(a || 0).toLocaleString('id-ID')}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusTag type="payment" status={s} /> },
    { title: 'Tanggal Bayar', dataIndex: 'paidAt', key: 'paidAt', render: (d) => d ? dayjs(d).format('DD MMM YYYY HH:mm') : '-' },
    { title: 'Dibuat', dataIndex: 'createdAt', key: 'createdAt', render: (d) => dayjs(d).format('DD MMM YYYY') },
    {
      title: 'Aksi', key: 'action', width: 80,
      render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/payments/${record.id}`)} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Daftar Pembayaran" subtitle="Kelola semua transaksi pembayaran" />
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Cari ID transaksi/booking..." prefix={<SearchOutlined />} style={{ width: 250 }} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} allowClear />
          <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} options={Object.values(PaymentStatus).map((s) => ({ label: s, value: s }))} />
          <RangePicker onChange={(dates) => { if (dates) { setFilters((p) => ({ ...p, startDate: dates[0]?.toISOString(), endDate: dates[1]?.toISOString() })); } else { setFilters((p) => ({ ...p, startDate: undefined, endDate: undefined })); } }} />
        </Space>
        <Table columns={columns} dataSource={payments} rowKey="id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total ${t} pembayaran` }} onChange={(pag) => setPagination(pag)} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default PaymentListPage;
