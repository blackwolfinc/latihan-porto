import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Select, DatePicker, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { fuelService, type FuelFilters } from '@/services/fuel.service';
import { carsService } from '@/services/cars.service';
import type { FuelLog, Car } from '@/types';

const { RangePicker } = DatePicker;

const FuelListPage: React.FC = () => {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<FuelFilters>({});
  const navigate = useNavigate();

  useEffect(() => { loadCars(); }, []);
  useEffect(() => { loadLogs(); }, [pagination.current, filters]);

  const loadCars = async () => {
    try { const { data } = await carsService.getAll({ limit: 100 }); setCars(data.data); } catch { /* */ }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await fuelService.getAll({ page: pagination.current, limit: pagination.pageSize, ...filters });
      setLogs(data.data);
      setPagination((p) => ({ ...p, total: data.meta.total }));
    } catch { message.error('Gagal memuat data BBM'); } finally { setLoading(false); }
  };

  const columns: ColumnsType<FuelLog> = [
    { title: 'Mobil', key: 'car', render: (_, r) => r.car ? `${r.car.brand} ${r.car.model} (${r.car.plateNumber})` : '-' },
    { title: 'Driver', key: 'driver', render: (_, r) => r.driver?.user?.name || '-' },
    { title: 'Liter', dataIndex: 'liters', key: 'liters', render: (v) => `${v} L` },
    { title: 'Harga/L', dataIndex: 'pricePerLiter', key: 'pricePerLiter', render: (v) => `Rp ${(v || 0).toLocaleString('id-ID')}` },
    { title: 'Total', dataIndex: 'totalCost', key: 'totalCost', render: (v) => `Rp ${(v || 0).toLocaleString('id-ID')}` },
    { title: 'KM', dataIndex: 'mileage', key: 'mileage', render: (v) => `${(v || 0).toLocaleString('id-ID')} km` },
    { title: 'SPBU', dataIndex: 'station', key: 'station', render: (v) => v || '-' },
    { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (d) => dayjs(d).format('DD MMM YYYY') },
  ];

  return (
    <div>
      <PageHeader title="Log BBM" subtitle="Catatan pengisian bahan bakar">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/fuel/new')}>Tambah BBM</Button>
      </PageHeader>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select placeholder="Pilih Mobil" allowClear style={{ width: 200 }} onChange={(v) => setFilters((p) => ({ ...p, carId: v }))} options={cars.map((c) => ({ label: `${c.plateNumber} - ${c.brand} ${c.model}`, value: c.id }))} showSearch optionFilterProp="label" />
          <RangePicker onChange={(dates) => { if (dates) { setFilters((p) => ({ ...p, startDate: dates[0]?.toISOString(), endDate: dates[1]?.toISOString() })); } else { setFilters((p) => ({ ...p, startDate: undefined, endDate: undefined })); }}} />
        </Space>
        <Table columns={columns} dataSource={logs} rowKey="id" loading={loading} pagination={{ ...pagination, showTotal: (t) => `Total ${t} log` }} onChange={(pag) => setPagination(pag)} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default FuelListPage;
