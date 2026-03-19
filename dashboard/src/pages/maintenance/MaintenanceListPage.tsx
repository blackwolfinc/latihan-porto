import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, message, Modal, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { maintenanceService } from '@/services/maintenance.service';
import type { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '@/types';

const { Option } = Select;

const MaintenanceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | undefined>();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await maintenanceService.getAll({ page, limit: 10, status: statusFilter, type: typeFilter });
      setRecords(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data maintenance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [page, statusFilter, typeFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Record',
      content: 'Apakah Anda yakin ingin menghapus record ini?',
      okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await maintenanceService.delete(id); message.success('Berhasil dihapus'); fetchRecords(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const isOverdue = (record: MaintenanceRecord) => {
    return record.status === 'SCHEDULED' && dayjs(record.scheduledDate).isBefore(dayjs(), 'day');
  };

  const columns = [
    {
      title: 'Mobil', key: 'car',
      render: (_: any, r: MaintenanceRecord) => r.car ? `${r.car.plateNumber} - ${r.car.brand} ${r.car.model}` : '-',
    },
    { title: 'Tipe', dataIndex: 'type', key: 'type' },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Biaya', dataIndex: 'cost', key: 'cost', render: (c: number) => `Rp ${c?.toLocaleString('id-ID')}` },
    { title: 'Tanggal', dataIndex: 'scheduledDate', key: 'scheduledDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <StatusTag status={s} type="maintenance" />,
    },
    {
      title: 'Aksi', key: 'action', width: 120,
      render: (_: any, r: MaintenanceRecord) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/maintenance/${r.id}/edit`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle={`Total ${total} record`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Maintenance' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/maintenance/create')}>
          Tambah Maintenance
        </Button>
      </PageHeader>

      <Space style={{ marginBottom: 16 }} size={12}>
        <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <Option value="SCHEDULED">Terjadwal</Option>
          <Option value="IN_PROGRESS">Dalam Proses</Option>
          <Option value="COMPLETED">Selesai</Option>
          <Option value="CANCELLED">Dibatalkan</Option>
        </Select>
        <Select placeholder="Tipe" allowClear style={{ width: 160 }} onChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <Option value="ROUTINE">Routine</Option>
          <Option value="REPAIR">Repair</Option>
          <Option value="INSPECTION">Inspection</Option>
          <Option value="TIRE">Tire</Option>
          <Option value="BODY">Body</Option>
          <Option value="ENGINE">Engine</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        rowClassName={(record) => isOverdue(record) ? 'ant-table-row-warning' : ''}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }}
      />

      <style>{`.ant-table-row-warning { background-color: #fff7e6 !important; }`}</style>
    </div>
  );
};

export default MaintenanceListPage;
