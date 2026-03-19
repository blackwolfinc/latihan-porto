import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Rate, Modal, message, Input, Tag } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { reviewsService } from '@/services/reviews.service';
import type { Review } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const ReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await reviewsService.getAll({ page, limit: 10, minRating: ratingFilter });
      setReviews(data.data);
      setTotal(data.meta.total);
    } catch {
      message.error('Gagal memuat data review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [page, ratingFilter]);

  const handleTogglePublish = async (id: string) => {
    try {
      await reviewsService.togglePublish(id);
      message.success('Status publikasi berhasil diubah');
      fetchReviews();
    } catch {
      message.error('Gagal mengubah status');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Hapus Review', content: 'Hapus review ini?', okText: 'Hapus', okType: 'danger', cancelText: 'Batal',
      onOk: async () => {
        try { await reviewsService.delete(id); message.success('Berhasil dihapus'); fetchReviews(); }
        catch { message.error('Gagal menghapus'); }
      },
    });
  };

  const columns = [
    { title: 'Customer', key: 'customer', render: (_: any, r: Review) => r.customer?.name || '-' },
    { title: 'Mobil', key: 'car', render: (_: any, r: Review) => r.car ? `${r.car.brand} ${r.car.model}` : '-' },
    { title: 'Driver', key: 'driver', render: (_: any, r: Review) => r.driver?.user?.name || '-' },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating',
      render: (rating: number) => <Rate disabled value={rating} allowHalf style={{ fontSize: 14 }} />,
    },
    { title: 'Komentar', dataIndex: 'comment', key: 'comment', ellipsis: true, width: 200 },
    { title: 'Tanggal', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Publikasi', dataIndex: 'isPublished', key: 'isPublished',
      render: (v: boolean) => v ? <Tag color="green">Dipublikasi</Tag> : <Tag color="default">Draft</Tag>,
    },
    {
      title: 'Aksi', key: 'action', width: 140,
      render: (_: any, r: Review) => (
        <Space>
          <Button
            type="link"
            icon={r.isPublished ? <StopOutlined /> : <CheckOutlined />}
            onClick={() => handleTogglePublish(r.id)}
          />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daftar Review"
        subtitle={`Total ${total} review`}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Review' }]}
      />
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Rating minimum" allowClear style={{ width: 180 }} onChange={(v) => { setRatingFilter(v); setPage(1); }}>
          <Option value={5}>5 Bintang</Option>
          <Option value={4}>4+ Bintang</Option>
          <Option value={3}>3+ Bintang</Option>
          <Option value={2}>2+ Bintang</Option>
          <Option value={1}>1+ Bintang</Option>
        </Select>
      </Space>
      <Table columns={columns} dataSource={reviews} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage, showTotal: (t) => `Total ${t} data` }} />
    </div>
  );
};

export default ReviewListPage;
