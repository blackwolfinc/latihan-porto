import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Image, Modal, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { carsService } from '@/services/cars.service';
import type { Car, CarStatus, CarCategory } from '@/types';

const { Option } = Select;

const CarListPage: React.FC = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarStatus | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<CarCategory | undefined>();

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await carsService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter,
        category: categoryFilter,
      });
      setCars(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data mobil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [page, search, statusFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Mobil',
      content: 'Apakah Anda yakin ingin menghapus mobil ini?',
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await carsService.delete(id);
          message.success('Mobil berhasil dihapus');
          fetchCars();
        } catch {
          message.error('Gagal menghapus mobil');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Foto',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url: string) => (
        <Image
          src={url || '/placeholder-car.png'}
          alt="car"
          width={60}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkC1TroQAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: 'Plat Nomor',
      dataIndex: 'plateNumber',
      key: 'plateNumber',
      width: 120,
    },
    {
      title: 'Brand/Model',
      key: 'brandModel',
      render: (_: any, record: Car) => `${record.brand} ${record.model}`,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="car" />,
    },
    {
      title: 'Tarif/Hari',
      dataIndex: 'pricePerDay',
      key: 'pricePerDay',
      render: (price: number) => `Rp ${price?.toLocaleString('id-ID')}`,
    },
    {
      title: 'Cabang',
      key: 'branch',
      render: (_: any, record: Car) => record.branch?.name || '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_: any, record: Car) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/cars/${record.id}`)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/cars/${record.id}/edit`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Mobil"
        subtitle={`Total ${total} mobil`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Mobil' }]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cars/create')}>
          Tambah Mobil
        </Button>
      </PageHeader>

      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={12}>
        <Input
          placeholder="Cari mobil..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select
          placeholder="Kategori"
          allowClear
          style={{ width: 150 }}
          onChange={(val) => { setCategoryFilter(val); setPage(1); }}
        >
          <Option value="SEDAN">Sedan</Option>
          <Option value="SUV">SUV</Option>
          <Option value="MPV">MPV</Option>
          <Option value="HATCHBACK">Hatchback</Option>
          <Option value="PICKUP">Pickup</Option>
          <Option value="VAN">Van</Option>
          <Option value="LUXURY">Luxury</Option>
          <Option value="SPORT">Sport</Option>
        </Select>
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
        >
          <Option value="AVAILABLE">Tersedia</Option>
          <Option value="RENTED">Disewa</Option>
          <Option value="MAINTENANCE">Perawatan</Option>
          <Option value="INACTIVE">Nonaktif</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={cars}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} data`,
        }}
      />
    </div>
  );
};

export default CarListPage;
