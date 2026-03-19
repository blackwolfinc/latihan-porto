import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Avatar, Rate, Modal, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { driversService } from '@/services/drivers.service';
import type { Driver, DriverStatus } from '@/types';

const { Option } = Select;

const DriverListPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | undefined>();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await driversService.getAll({ page, limit: 10, search: search || undefined, status: statusFilter });
      setDrivers(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data driver');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, [page, search, statusFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Driver',
      content: 'Apakah Anda yakin ingin menghapus driver ini?',
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await driversService.delete(id);
          message.success('Driver berhasil dihapus');
          fetchDrivers();
        } catch {
          message.error('Gagal menghapus driver');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Foto',
      key: 'avatar',
      width: 60,
      render: (_: any, record: Driver) => (
        <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: 'Nama',
      key: 'name',
      render: (_: any, record: Driver) => record.user?.name || '-',
    },
    { title: 'No. SIM', dataIndex: 'licenseNumber', key: 'licenseNumber' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="driver" />,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => rating ? <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 14 }} /> : '-',
    },
    { title: 'Total Trip', dataIndex: 'totalTrips', key: 'totalTrips' },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_: any, record: Driver) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/drivers/${record.id}`)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/drivers/${record.id}/edit`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Driver"
        subtitle={`Total ${total} driver`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Driver' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/drivers/create')}>
          Tambah Driver
        </Button>
      </PageHeader>

      <Space style={{ marginBottom: 16 }} size={12}>
        <Input
          placeholder="Cari driver..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <Option value="AVAILABLE">Tersedia</Option>
          <Option value="ON_TRIP">Dalam Perjalanan</Option>
          <Option value="OFF_DUTY">Libur</Option>
          <Option value="INACTIVE">Nonaktif</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={drivers}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }}
      />
    </div>
  );
};

export default DriverListPage;
