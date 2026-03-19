import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Input, Select, Avatar, Rate, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { driversService, type DriverFilters } from '@/services/drivers.service';
import type { Driver } from '@/types';
import { DriverStatus } from '@/types';

const DriverListPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<DriverFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadDrivers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await driversService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setDrivers(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data driver');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Driver> = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 60,
      render: (_, record) => (
        <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: 'Nama',
      key: 'name',
      render: (_, record) => <strong>{record.user?.name || '-'}</strong>,
    },
    {
      title: 'No. SIM',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
    },
    {
      title: 'Tipe SIM',
      dataIndex: 'licenseType',
      key: 'licenseType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="driver" status={status} />,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating || 0} allowHalf style={{ fontSize: 14 }} />,
    },
    {
      title: 'Total Trip',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      sorter: true,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/drivers/${record.id}`)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/drivers/${record.id}/edit`)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Manajemen Driver" subtitle="Kelola semua driver rental">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/drivers/create')}>
          Tambah Driver
        </Button>
      </PageHeader>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Cari nama/SIM..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.values(DriverStatus).map((s) => ({ label: s, value: s }))}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={drivers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} driver`,
          }}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default DriverListPage;
