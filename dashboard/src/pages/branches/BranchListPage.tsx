import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Select, Input, Popconfirm, message, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import PageHeader from '@/components/shared/PageHeader';
import { branchesService, type BranchFilters } from '@/services/branches.service';
import type { Branch } from '@/types';

const BranchListPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<BranchFilters>({});
  const navigate = useNavigate();

  useEffect(() => { loadCities(); }, []);
  useEffect(() => { loadBranches(); }, [pagination.current, filters]);

  const loadCities = async () => {
    try { const { data } = await branchesService.getCities(); setCities(data.data); } catch { /* */ }
  };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const { data } = await branchesService.getAll({ page: pagination.current, limit: pagination.pageSize, ...filters });
      setBranches(data.data);
      setPagination((p) => ({ ...p, total: data.meta.total }));
    } catch { message.error('Gagal memuat data cabang'); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try { await branchesService.delete(id); message.success('Cabang dihapus'); loadBranches(); }
    catch { message.error('Gagal menghapus'); }
  };

  const columns: ColumnsType<Branch> = [
    { title: 'Nama', dataIndex: 'name', key: 'name', render: (t) => <strong>{t}</strong> },
    { title: 'Kota', dataIndex: 'city', key: 'city' },
    { title: 'Provinsi', dataIndex: 'province', key: 'province' },
    { title: 'Telepon', dataIndex: 'phone', key: 'phone' },
    { title: 'Mobil', key: 'cars', render: (_, r) => r._count?.cars || 0 },
    { title: 'Staff', key: 'users', render: (_, r) => r._count?.users || 0 },
    {
      title: 'Status', dataIndex: 'isActive', key: 'isActive',
      render: (active) => active ? <Tag color="green">Aktif</Tag> : <Tag>Nonaktif</Tag>,
    },
    {
      title: 'Aksi', key: 'action', width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/branches/${r.id}/edit`)} />
          <Popconfirm title="Hapus cabang?" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Daftar Cabang" subtitle="Kelola lokasi cabang rental">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/branches/new')}>Tambah Cabang</Button>
      </PageHeader>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Cari cabang..." prefix={<SearchOutlined />} style={{ width: 200 }} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} allowClear />
          <Select placeholder="Kota" allowClear style={{ width: 150 }} onChange={(v) => setFilters((p) => ({ ...p, city: v }))} options={cities.map((c) => ({ label: c, value: c }))} showSearch />
        </Space>
        <Table columns={columns} dataSource={branches} rowKey="id" loading={loading} pagination={{ ...pagination, showTotal: (t) => `Total ${t} cabang` }} onChange={(pag) => setPagination(pag)} scroll={{ x: 800 }} />
      </Card>
    </div>
  );
};

export default BranchListPage;
