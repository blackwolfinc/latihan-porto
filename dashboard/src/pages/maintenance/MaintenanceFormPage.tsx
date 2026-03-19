import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, DatePicker, InputNumber, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { maintenanceService } from '@/services/maintenance.service';
import { carsService } from '@/services/cars.service';
import { MaintenanceType, MaintenanceStatus } from '@/types';
import type { Car } from '@/types';

const MaintenanceFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    loadCars();
    if (isEdit) loadRecord();
  }, [id]);

  const loadCars = async () => {
    try {
      const { data } = await carsService.getAll({ limit: 100 });
      setCars(data.data);
    } catch { /* silent */ }
  };

  const loadRecord = async () => {
    try {
      const { data } = await maintenanceService.getById(id!);
      const record = data.data;
      form.setFieldsValue({
        ...record,
        scheduledDate: record.scheduledDate ? dayjs(record.scheduledDate) : undefined,
        completedDate: record.completedDate ? dayjs(record.completedDate) : undefined,
      });
    } catch {
      message.error('Gagal memuat data');
      navigate('/maintenance');
    }
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    const payload = {
      ...values,
      scheduledDate: (values.scheduledDate as dayjs.Dayjs)?.toISOString(),
      completedDate: (values.completedDate as dayjs.Dayjs)?.toISOString(),
    };
    try {
      if (isEdit) {
        await maintenanceService.update(id!, payload);
        message.success('Record berhasil diperbarui');
      } else {
        await maintenanceService.create(payload);
        message.success('Record berhasil ditambahkan');
      }
      navigate('/maintenance');
    } catch {
      message.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Maintenance' : 'Tambah Maintenance'} subtitle="Catat jadwal perawatan kendaraan" />
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="carId" label="Mobil" rules={[{ required: true, message: 'Pilih mobil' }]}>
                <Select placeholder="Pilih mobil" showSearch optionFilterProp="label" options={cars.map((c) => ({ label: `${c.brand} ${c.model} - ${c.plateNumber}`, value: c.id }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Tipe Maintenance" rules={[{ required: true, message: 'Pilih tipe' }]}>
                <Select placeholder="Pilih tipe" options={Object.values(MaintenanceType).map((t) => ({ label: t, value: t }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="scheduledDate" label="Tanggal Jadwal" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Status" initialValue={MaintenanceStatus.SCHEDULED}>
                <Select options={Object.values(MaintenanceStatus).map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Deskripsi" rules={[{ required: true, message: 'Isi deskripsi' }]}>
                <Input.TextArea rows={3} placeholder="Deskripsi perawatan..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="cost" label="Biaya" rules={[{ required: true, message: 'Isi biaya' }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(v) => Number(v!.replace(/Rp\s?|(\.*)/g, ''))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="vendor" label="Vendor/Bengkel">
                <Input placeholder="Nama bengkel" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="mileageAtService" label="KM saat service">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label="Catatan">
                <Input.TextArea rows={2} placeholder="Catatan tambahan..." />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
            <Button onClick={() => navigate('/maintenance')}>Batal</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default MaintenanceFormPage;
