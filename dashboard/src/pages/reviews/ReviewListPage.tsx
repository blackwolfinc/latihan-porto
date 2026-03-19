import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Select, Rate, Typography, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { reviewsService, type ReviewFilters } from '@/services/reviews.service';
import type { Review } from '@/types';

const { Text } = Typography;

const ReviewListPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ReviewFilters>({});

  useEffect(() => {
    loadReviews();
  }, [pagination.current, filters]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await reviewsService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setReviews(data.data);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch {
      message.error('Gagal memuat data review');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Review> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.customer?.name || '-',
    },
    {
      title: 'Mobil',
      key: 'car',
      render: (_, record) =>
        record.car ? `${record.car.brand} ${record.car.model}` : '-',
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (_, record) => record.driver?.user?.name || '-',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (rating: number) => <Rate disabled value={rating} allowHalf style={{ fontSize: 14 }} />,
      sorter: true,
    },
    {
      title: 'Komentar',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment: string) => (
        <Text style={{ maxWidth: 300 }} ellipsis={{ tooltip: comment }}>
          {comment || '-'}
        </Text>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('DD MMM YYYY'),
      sorter: true,
    },
  ];

  return (
    <div>
      <PageHeader title="Daftar Review" subtitle="Ulasan pelanggan terhadap layanan rental" />
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Filter Rating"
            allowClear
            style={{ width: 180 }}
            onChange={(v) => setFilters((p) => ({ ...p, minRating: v }))}
            options={[
              { label: '5 Bintang', value: 5 },
              { label: '4 Bintang ke atas', value: 4 },
              { label: '3 Bintang ke atas', value: 3 },
              { label: '2 Bintang ke atas', value: 2 },
              { label: '1 Bintang ke atas', value: 1 },
            ]}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} review`,
          }}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'Belum ada review' }}
        />
      </Card>
    </div>
  );
};

export default ReviewListPage;
