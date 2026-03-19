import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { maintenanceService, type MaintenanceFilters } from '@/services/maintenance.service';
import type { MaintenanceRecord } from '@/types';
import { MaintenanceStatus, MaintenanceType } from '@/types';

const MaintenanceListPage: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<MaintenanceFilters>({});
  const navigate = useNavigate();

  useEffect(() => { loadRecords(); }, [pagination.current, filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data } = await maintenanceService.getAll({ page: pagination.current, limit: pagination.pageSize, ...filters });
      setRecords(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch { message.error('Gagal memuat data maintenance'); } finally { setLoading(false); }
  };

  const isOverdue = (record: MaintenanceRecord) => {
    return record.status === MaintenanceStatus.SCHEDULED && dayjs(record.scheduledDate).isBefore(dayjs(), 'day');
  };

  const columns: ColumnsType<MaintenanceRecord> = [
    { title: 'Mobil', key: 'car', render: (_, r) => r.car ? `${r.car.brand} ${r.car.model} (${r.car.plateNumber})` : '-' },
    { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Jadwal', dataIndex: 'scheduledDate', key: 'scheduledDate',
      render: (d, record) => (
        <Space>
          {dayjs(d).format('DD MMM YYYY')}
          {isOverdue(record) && <WarningOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      ),
    },
    { title: 'Biaya', dataIndex: 'cost', key: 'cost', render: (c) => `Rp ${(c || 0).toLocaleString('id-ID')}` },
    { title: 'Vendor', dataIndex: 'vendor', key: 'vendor', render: (v) => v || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <StatusTag type="maintenance" status={s} /> },
  ];

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Kelola jadwal perawatan kendaraan">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/maintenance/new')}>Tambah Record</Button>
      </PageHeader>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} options={Object.values(MaintenanceStatus).map((s) => ({ label: s, value: s }))} />
          <Select placeholder="Tipe" allowClear style={{ width: 150 }} onChange={(v) => setFilters((p) => ({ ...p, type: v }))} options={Object.values(MaintenanceType).map((t) => ({ label: t, value: t }))} />
        </Space>
        <Table columns={columns} dataSource={records} rowKey="id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total ${t} record` }} onChange={(pag) => setPagination(pag)} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default MaintenanceListPage;
