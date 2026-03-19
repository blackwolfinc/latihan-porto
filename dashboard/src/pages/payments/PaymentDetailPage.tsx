import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Space, message, Typography, Modal, InputNumber, Input, Divider } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { paymentsService } from '@/services/payments.service';
import type { Payment } from '@/types';
import { PaymentStatus } from '@/types';

const { Text } = Typography;

const PaymentDetailPage: React.FC = () => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsService.getById(id!);
      setPayment(data.data);
      setRefundAmount(data.data.amount);
    } catch {
      message.error('Gagal memuat detail pembayaran');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      await paymentsService.refund(id!, refundAmount, refundReason);
      message.success('Refund berhasil diproses');
      setRefundModal(false);
      loadPayment();
    } catch {
      message.error('Gagal memproses refund');
    }
  };

  if (loading || !payment) return <Card loading />;

  return (
    <div>
      <PageHeader title={`Pembayaran #${payment.transactionId || payment.id.slice(0, 8)}`} subtitle="Detail transaksi pembayaran">
        {payment.status === PaymentStatus.PAID && (
          <Button icon={<RollbackOutlined />} danger onClick={() => setRefundModal(true)}>Refund</Button>
        )}
      </PageHeader>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="ID Transaksi">{payment.transactionId || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusTag type="payment" status={payment.status} /></Descriptions.Item>
          <Descriptions.Item label="No. Booking">{payment.booking?.bookingNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Metode Pembayaran">{payment.method}</Descriptions.Item>
          <Descriptions.Item label="Jumlah"><Text strong>Rp {payment.amount.toLocaleString('id-ID')}</Text></Descriptions.Item>
          <Descriptions.Item label="Tanggal Bayar">{payment.paidAt ? dayjs(payment.paidAt).format('DD MMMM YYYY HH:mm') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Midtrans Order ID">{payment.midtransOrderId || '-'}</Descriptions.Item>
          <Descriptions.Item label="Midtrans Token">{payment.midtransToken || '-'}</Descriptions.Item>
          {payment.refundedAt && (
            <>
              <Descriptions.Item label="Tanggal Refund">{dayjs(payment.refundedAt).format('DD MMMM YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Jumlah Refund">Rp {(payment.refundAmount || 0).toLocaleString('id-ID')}</Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Catatan" span={2}>{payment.notes || '-'}</Descriptions.Item>
          <Descriptions.Item label="Dibuat">{dayjs(payment.createdAt).format('DD MMMM YYYY HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Diperbarui">{dayjs(payment.updatedAt).format('DD MMMM YYYY HH:mm')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal title="Proses Refund" open={refundModal} onOk={handleRefund} onCancel={() => setRefundModal(false)} okText="Proses Refund" okButtonProps={{ danger: true }}>
        <div style={{ marginBottom: 16 }}>
          <Text>Jumlah Refund:</Text>
          <InputNumber style={{ width: '100%', marginTop: 8 }} value={refundAmount} onChange={(v) => setRefundAmount(v || 0)} max={payment.amount} min={0} formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(v) => Number(v!.replace(/Rp\s?|(\.*)/g, ''))} />
        </div>
        <div>
          <Text>Alasan Refund:</Text>
          <Input.TextArea rows={3} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Alasan refund..." style={{ marginTop: 8 }} />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentDetailPage;
