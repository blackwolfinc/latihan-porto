import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Input, Space, message, Avatar, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { customersService } from '@/services/customers.service';
import type { User } from '@/types';

const { Text } = Typography;

const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, [pagination.current, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customersService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
      });
      setCustomers(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data customer');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Customer',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Telepon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Bergabung',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Text type={active ? 'success' : 'danger'}>{active ? 'Aktif' : 'Nonaktif'}</Text>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${record.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Daftar Customer" subtitle="Kelola pelanggan rental" />
      <Card>
        <Input
          placeholder="Cari nama/email/telepon..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} customer`,
          }}
          onChange={(pag) => setPagination(pag)}
        />
      </Card>
    </div>
  );
};

export default CustomerListPage;
