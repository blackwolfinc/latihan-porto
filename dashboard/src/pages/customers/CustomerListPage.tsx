import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { customersService } from '@/services/customers.service';
import type { User } from '@/types';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customersService.getAll({ page, limit: 10, search: search || undefined });
      setCustomers(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const columns = [
    { title: 'Nama', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Telepon', dataIndex: 'phone', key: 'phone', render: (phone: string) => phone || '-' },
    {
      title: 'Bergabung',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_: any, record: User) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${record.id}`)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Customer"
        subtitle={`Total ${total} customer`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Customer' }]}
      />

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Cari customer..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }}
      />
    </div>
  );
};

export default CustomerListPage;
