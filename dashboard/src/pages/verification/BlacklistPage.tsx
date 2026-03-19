import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Space, Button, Modal, Form, Input, Select, message, Typography, Popconfirm,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { verificationService, CustomerBlacklistItem } from '@/services/verification.service';

const { Text } = Typography;
const { TextArea } = Input;

const reasonConfig: Record<string, { label: string; color: string }> = {
  FRAUD: { label: 'Penipuan', color: 'red' },
  THEFT: { label: 'Pencurian', color: 'red' },
  DAMAGE: { label: 'Kerusakan Berat', color: 'orange' },
  NON_PAYMENT: { label: 'Tidak Membayar', color: 'volcano' },
  TRAFFIC_VIOLATION: { label: 'Pelanggaran Lalu Lintas', color: 'magenta' },
  ACCIDENT: { label: 'Kecelakaan', color: 'orange' },
  OVERDUE: { label: 'Tidak Tepat Waktu', color: 'gold' },
  OTHER: { label: 'Lainnya', color: 'default' },
};

const BlacklistPage: React.FC = () => {
  const [data, setData] = useState<CustomerBlacklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await verificationService.getBlacklist({ page, limit: 10 });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error('Gagal memuat data blacklist');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (values: any) => {
    setAddLoading(true);
    try {
      await verificationService.addToBlacklist(values);
      message.success('Berhasil menambahkan ke blacklist');
      setAddModal(false);
      form.resetFields();
      fetchData();
    } catch {
      message.error('Gagal menambahkan ke blacklist');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await verificationService.removeFromBlacklist(id);
      message.success('Berhasil menghapus dari blacklist');
      fetchData();
    } catch {
      message.error('Gagal menghapus dari blacklist');
    }
  };

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'No. KTP',
      dataIndex: 'ktpNumber',
      key: 'ktpNumber',
      render: (val: string) => val || '-',
    },
    {
      title: 'No. SIM',
      dataIndex: 'simNumber',
      key: 'simNumber',
      render: (val: string) => val || '-',
    },
    {
      title: 'Telepon',
      dataIndex: 'phone',
      key: 'phone',
      render: (val: string) => val || '-',
    },
    {
      title: 'Alasan',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => {
        const cfg = reasonConfig[reason] || { label: reason, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Dilaporkan Oleh',
      key: 'reporter',
      render: (_: any, record: CustomerBlacklistItem) => record.reporter?.name || '-',
    },
    {
      title: 'Tanggal',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      render: (_: any, record: CustomerBlacklistItem) => (
        <Popconfirm
          title="Hapus dari Blacklist?"
          description="Customer akan dihapus dari daftar blacklist"
          onConfirm={() => handleRemove(record.id)}
          okText="Ya, Hapus"
          cancelText="Batal"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Hapus
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Blacklist"
        subtitle="Kelola daftar blacklist customer"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Blacklist' },
        ]}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>
          Tambah Blacklist
        </Button>
      </PageHeader>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Total ${t} data`,
        }}
      />

      {/* Add Modal */}
      <Modal
        title="Tambah ke Blacklist"
        open={addModal}
        onCancel={() => {
          setAddModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input placeholder="Nama customer" />
          </Form.Item>
          <Form.Item name="ktpNumber" label="No. KTP">
            <Input placeholder="Nomor KTP (opsional)" />
          </Form.Item>
          <Form.Item name="simNumber" label="No. SIM">
            <Input placeholder="Nomor SIM (opsional)" />
          </Form.Item>
          <Form.Item name="phone" label="No. Telepon">
            <Input placeholder="Nomor telepon (opsional)" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Alasan"
            rules={[{ required: true, message: 'Alasan wajib dipilih' }]}
          >
            <Select placeholder="Pilih alasan">
              <Select.Option value="FRAUD">Penipuan / Dokumen Palsu</Select.Option>
              <Select.Option value="THEFT">Pencurian Kendaraan</Select.Option>
              <Select.Option value="DAMAGE">Kerusakan Berat Tanpa Ganti Rugi</Select.Option>
              <Select.Option value="NON_PAYMENT">Tidak Membayar</Select.Option>
              <Select.Option value="TRAFFIC_VIOLATION">Pelanggaran Lalu Lintas Berat</Select.Option>
              <Select.Option value="ACCIDENT">Kecelakaan Karena Kelalaian</Select.Option>
              <Select.Option value="OVERDUE">Tidak Mengembalikan Tepat Waktu (Berulang)</Select.Option>
              <Select.Option value="OTHER">Lainnya</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}
          >
            <TextArea rows={3} placeholder="Deskripsi detail kejadian..." />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setAddModal(false); form.resetFields(); }}>
                Batal
              </Button>
              <Button type="primary" htmlType="submit" loading={addLoading}>
                Tambahkan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlacklistPage;
