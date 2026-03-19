import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, message, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { bookingsService } from '@/services/bookings.service';
import type { Booking, BookingStatus } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      });
      setBookings(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search, statusFilter, dateRange]);

  const columns = [
    { title: 'ID', dataIndex: 'bookingNumber', key: 'bookingNumber', width: 130 },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: Booking) => record.customer?.name || '-',
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_: any, record: Booking) => record.car ? `${record.car.brand} ${record.car.model}` : '-',
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (_: any, record: Booking) => record.driver?.user?.name || 'Tanpa Driver',
    },
    {
      title: 'Mulai',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Selesai',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="booking" />,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `Rp ${amount?.toLocaleString('id-ID')}`,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_: any, record: Booking) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/bookings/${record.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Booking"
        subtitle={`Total ${total} booking`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Booking' }]}
      >
        <Space>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/bookings/calendar')}>
            Kalender
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bookings/create')}>
            Tambah Booking
          </Button>
        </Space>
      </PageHeader>

      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={12}>
        <Input
          placeholder="Cari booking..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 160 }}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
        >
          <Option value="PENDING">Menunggu</Option>
          <Option value="CONFIRMED">Dikonfirmasi</Option>
          <Option value="ONGOING">Berlangsung</Option>
          <Option value="COMPLETED">Selesai</Option>
          <Option value="CANCELLED">Dibatalkan</Option>
          <Option value="OVERDUE">Terlambat</Option>
        </Select>
        <RangePicker
          onChange={(_, dateStrings) => {
            if (dateStrings[0] && dateStrings[1]) {
              setDateRange(dateStrings as [string, string]);
            } else {
              setDateRange(undefined);
            }
            setPage(1);
          }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (total) => `Total ${total} data`,
        }}
      />
    </div>
  );
};

export default BookingListPage;
