import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Input, message } from 'antd';
import { EyeOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { contractsService, type ContractFilters } from '@/services/contracts.service';
import type { Contract } from '@/types';

const ContractListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ContractFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, [pagination.current, filters]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const { data } = await contractsService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setContracts(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data kontrak');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await contractsService.downloadPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kontrak-${id.slice(0, 8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Gagal mengunduh PDF');
    }
  };

  const columns: ColumnsType<Contract> = [
    {
      title: 'No. Kontrak',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (num: string) => <strong>{num}</strong>,
    },
    {
      title: 'Booking ID',
      key: 'booking',
      render: (_, record) => record.booking?.bookingNumber || record.bookingId.slice(0, 8),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.booking?.customer?.name || '-',
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) =>
        record.booking?.car
          ? `${record.booking.car.brand} ${record.booking.car.model}`
          : '-',
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('DD MMM YYYY'),
      sorter: true,
    },
    {
      title: 'Ditandatangani',
      dataIndex: 'signedAt',
      key: 'signedAt',
      render: (d: string | null) =>
        d ? dayjs(d).format('DD MMM YYYY HH:mm') : 'Belum ditandatangani',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/contracts/${record.id}`)}
          >
            Lihat
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPdf(record.id)}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Daftar Kontrak" subtitle="Kelola kontrak rental kendaraan" />
      <Card>
        <Input
          placeholder="Cari no kontrak/booking..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} kontrak`,
          }}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 900 }}
          locale={{ emptyText: 'Belum ada data kontrak' }}
        />
      </Card>
    </div>
  );
};

export default ContractListPage;
