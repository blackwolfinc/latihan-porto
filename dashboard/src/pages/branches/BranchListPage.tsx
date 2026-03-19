import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { branchesService } from '@/services/branches.service';
import type { Branch } from '@/types';

const BranchListPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await branchesService.getAll({ page, limit: 10, search: search || undefined });
      setBranches(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data cabang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, [page, search]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Cabang', content: 'Hapus cabang ini?', okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await branchesService.delete(id); message.success('Berhasil dihapus'); fetchBranches(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const columns = [
    { title: 'Nama', dataIndex: 'name', key: 'name' },
    { title: 'Alamat', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Kota', dataIndex: 'city', key: 'city' },
    { title: 'Telepon', dataIndex: 'phone', key: 'phone' },
    { title: 'Total Mobil', key: 'cars', render: (_: any, r: Branch) => r._count?.cars ?? 0 },
    { title: 'Total Driver', key: 'drivers', render: (_: any, r: Branch) => r._count?.users ?? 0 },
    {
      title: 'Aksi', key: 'action', width: 120,
      render: (_: any, r: Branch) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/branches/${r.id}/edit`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Cabang"
        subtitle={`Total ${total} cabang`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Cabang' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/branches/create')}>Tambah Cabang</Button>
      </PageHeader>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Cari cabang..." prefix={<SearchOutlined />} allowClear style={{ width: 300 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </Space>
      <Table columns={columns} dataSource={branches} rowKey="id" loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default BranchListPage;
