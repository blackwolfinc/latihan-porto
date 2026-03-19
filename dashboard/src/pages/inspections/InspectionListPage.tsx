import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { inspectionsService } from '@/services/inspections.service';
import type { Inspection, InspectionType } from '@/types';

const { Option } = Select;

const InspectionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<InspectionType | undefined>();

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const { data } = await inspectionsService.getAll({ page, limit: 10, type: typeFilter });
      setInspections(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data inspeksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInspections(); }, [page, typeFilter]);

  const columns = [
    { title: 'Booking', key: 'booking', render: (_: any, r: Inspection) => r.booking?.bookingNumber || '-' },
    { title: 'Mobil', key: 'car', render: (_: any, r: Inspection) => r.car ? `${r.car.plateNumber} - ${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t: string) => t === 'PRE_RENTAL' ? 'Sebelum Rental' : t === 'POST_RENTAL' ? 'Setelah Rental' : 'Berkala' },
    { title: 'Inspector', key: 'inspector', render: (_: any, r: Inspection) => r.inspector?.name || '-' },
    { title: 'Eksterior', dataIndex: 'exteriorCondition', key: 'exteriorCondition', ellipsis: true },
    { title: 'Interior', dataIndex: 'interiorCondition', key: 'interiorCondition', ellipsis: true },
    { title: 'Tanggal', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Aksi', key: 'action', width: 80,
      render: (_: any, r: Inspection) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/inspections/${r.id}`)} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Inspeksi"
        subtitle={`Total ${total} inspeksi`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Inspeksi' }]}
      />
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Tipe" allowClear style={{ width: 180 }} onChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <Option value="PRE_RENTAL">Sebelum Rental</Option>
          <Option value="POST_RENTAL">Setelah Rental</Option>
          <Option value="PERIODIC">Berkala</Option>
        </Select>
      </Space>
      <Table columns={columns} dataSource={inspections} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default InspectionListPage;
