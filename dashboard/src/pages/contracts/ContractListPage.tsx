import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Modal } from 'antd';
import { EyeOutlined, DownloadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { contractsService } from '@/services/contracts.service';
import type { Contract } from '@/types';

const ContractListPage: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const { data } = await contractsService.getAll({ page, limit: 10, search: search || undefined });
      setContracts(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data kontrak');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, [page, search]);

  const handleDownload = async (id: string) => {
    try {
      const response = await contractsService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Gagal mengunduh PDF');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Kontrak', content: 'Hapus kontrak ini?', okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await contractsService.delete(id); message.success('Berhasil dihapus'); fetchContracts(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const columns = [
    { title: 'No. Kontrak', dataIndex: 'contractNumber', key: 'contractNumber' },
    { title: 'Booking', key: 'booking', render: (_: any, r: Contract) => r.booking?.bookingNumber || '-' },
    { title: 'Customer', key: 'customer', render: (_: any, r: Contract) => r.booking?.customer?.name || '-' },
    { title: 'Mobil', key: 'car', render: (_: any, r: Contract) => r.booking?.car ? `${r.booking.car.brand} ${r.booking.car.model}` : '-' },
    { title: 'Dibuat', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Ditandatangani', dataIndex: 'signedAt', key: 'signedAt', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : 'Belum' },
    {
      title: 'PDF', key: 'pdf',
      render: (_: any, r: Contract) => r.fileUrl ? (
        <Button type="link" icon={<DownloadOutlined />} size="small" onClick={() => handleDownload(r.id)}>Download</Button>
      ) : '-',
    },
    {
      title: 'Aksi', key: 'action', width: 120,
      render: (_: any, r: Contract) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/contracts/${r.id}`)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Kontrak"
        subtitle={`Total ${total} kontrak`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Kontrak' }]}
      />
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Cari kontrak..." prefix={<SearchOutlined />} allowClear style={{ width: 300 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </Space>
      <Table columns={columns} dataSource={contracts} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default ContractListPage;
