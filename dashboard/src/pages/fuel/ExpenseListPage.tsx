import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { expensesService } from '@/services/fuel.service';
import type { Expense, ExpenseCategory } from '@/types';

const { Option } = Select;

const ExpenseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | undefined>();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await expensesService.getAll({ page, limit: 10, category: categoryFilter });
      setExpenses(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data biaya');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [page, categoryFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Biaya', content: 'Hapus record biaya ini?', okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await expensesService.delete(id); message.success('Berhasil dihapus'); fetchExpenses(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const columns = [
    { title: 'Cabang', key: 'branch', render: (_: any, r: Expense) => r.branch?.name || '-' },
    { title: 'Mobil', key: 'car', render: (_: any, r: Expense) => r.car ? `${r.car.plateNumber}` : '-' },
    { title: 'Kategori', dataIndex: 'category', key: 'category' },
    { title: 'Jumlah', dataIndex: 'amount', key: 'amount', render: (a: number) => `Rp ${a?.toLocaleString('id-ID')}` },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Aksi', key: 'action', width: 80,
      render: (_: any, r: Expense) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Biaya Operasional"
        subtitle={`Total ${total} record`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'BBM & Biaya', path: '/fuel' }, { title: 'Biaya' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fuel')}>Kembali ke BBM</Button>
      </PageHeader>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Kategori" allowClear style={{ width: 180 }} onChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <Option value="FUEL">BBM</Option>
          <Option value="MAINTENANCE">Maintenance</Option>
          <Option value="INSURANCE">Asuransi</Option>
          <Option value="TAX">Pajak</Option>
          <Option value="PARKING">Parkir</Option>
          <Option value="TOLL">Tol</Option>
          <Option value="OTHER">Lainnya</Option>
        </Select>
      </Space>
      <Table columns={columns} dataSource={expenses} rowKey="id" loading={loading} scroll={{ x: 800 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default ExpenseListPage;
