import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Input, Select, Tag, Image, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { carsService, type CarFilters } from '@/services/cars.service';
import type { Car } from '@/types';
import { CarStatus, CarCategory } from '@/types';

const CarListPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<CarFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCars();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadCars = async () => {
    setLoading(true);
    try {
      const { data } = await carsService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setCars(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data mobil');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await carsService.delete(id);
      message.success('Mobil berhasil dihapus');
      loadCars();
    } catch {
      message.error('Gagal menghapus mobil');
    }
  };

  const columns: ColumnsType<Car> = [
    {
      title: 'Foto',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 80,
      render: (url) => (
        <Image
          src={url || 'https://via.placeholder.com/60x40?text=No+Image'}
          width={60}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      ),
    },
    {
      title: 'Plat Nomor',
      dataIndex: 'plateNumber',
      key: 'plateNumber',
      sorter: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) => `${record.brand} ${record.model} (${record.year})`,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Transmisi',
      dataIndex: 'transmission',
      key: 'transmission',
    },
    {
      title: 'Harga/Hari',
      dataIndex: 'pricePerDay',
      key: 'pricePerDay',
      sorter: true,
      render: (price) => `Rp ${(price || 0).toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag type="car" status={status} />,
    },
    {
      title: 'Cabang',
      dataIndex: ['branch', 'name'],
      key: 'branch',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/cars/${record.id}`)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/cars/${record.id}/edit`)} />
          <Popconfirm title="Hapus mobil ini?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Mobil"
        subtitle="Kelola semua armada kendaraan"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cars/new')}>
            Tambah Mobil
          </Button>
        }
      />
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Cari plat/merk/model..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.values(CarStatus).map((s) => ({ label: s, value: s }))}
          />
          <Select
            placeholder="Kategori"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            options={Object.values(CarCategory).map((c) => ({ label: c, value: c }))}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={cars}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} mobil`,
          }}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default CarListPage;
