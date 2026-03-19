import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { bookingsService, type BookingFilters } from '@/services/bookings.service';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';

const { RangePicker } = DatePicker;

const BookingListPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<BookingFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setBookings(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Booking> = [
    {
      title: 'No. Booking',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) =>
        record.car ? `${record.car.brand} ${record.car.model} (${record.car.plateNumber})` : '-',
    },
    {
      title: 'Driver',
      dataIndex: ['driver', 'user', 'name'],
      key: 'driver',
      render: (text) => text || '-',
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
      sorter: true,
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `Rp ${(amount || 0).toLocaleString('id-ID')}`,
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="booking" status={status} />,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/bookings/${record.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Booking"
        subtitle="Kelola semua pesanan rental"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bookings/new')}>
            Buat Booking
          </Button>
        }
      />
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Cari no. booking/customer..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.values(BookingStatus).map((s) => ({ label: s, value: s }))}
          />
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters((prev) => ({
                  ...prev,
                  startDate: dates[0]?.toISOString(),
                  endDate: dates[1]?.toISOString(),
                }));
              } else {
                setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
              }
            }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} booking`,
          }}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default BookingListPage;
