import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, DatePicker, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { fuelService } from '@/services/fuel.service';
import type { FuelLog } from '@/types';

const { RangePicker } = DatePicker;

const FuelListPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await fuelService.getAll({ page, limit: 10, startDate: dateRange?.[0], endDate: dateRange?.[1] });
      setLogs(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data BBM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, dateRange]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Record', content: 'Hapus record BBM ini?', okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await fuelService.delete(id); message.success('Berhasil dihapus'); fetchLogs(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const columns = [
    { title: 'Mobil', key: 'car', render: (_: any, r: FuelLog) => r.car ? `${r.car.plateNumber} - ${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Driver', key: 'driver', render: (_: any, r: FuelLog) => r.driver?.user?.name || '-' },
    { title: 'Liter', dataIndex: 'liters', key: 'liters', render: (v: number) => `${v} L` },
    { title: 'Biaya', dataIndex: 'totalCost', key: 'totalCost', render: (c: number) => `Rp ${c?.toLocaleString('id-ID')}` },
    { title: 'Odometer', dataIndex: 'mileage', key: 'mileage', render: (m: number) => `${m?.toLocaleString('id-ID')} km` },
    { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Jenis BBM', dataIndex: 'fuelType', key: 'fuelType' },
    {
      title: 'Aksi', key: 'action', width: 100,
      render: (_: any, r: FuelLog) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/fuel/${r.id}/edit`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="BBM & Bahan Bakar"
        subtitle={`Total ${total} record`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'BBM & Biaya' }]}
      >
        <Space>
          <Button onClick={() => navigate('/fuel/expenses')}>Biaya Lainnya</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/fuel/create')}>Tambah BBM</Button>
        </Space>
      </PageHeader>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker onChange={(_, ds) => { setDateRange(ds[0] && ds[1] ? ds as [string, string] : undefined); setPage(1); }} />
      </Space>
      <Table columns={columns} dataSource={logs} rowKey="id" loading={loading} scroll={{ x: 900 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default FuelListPage;
