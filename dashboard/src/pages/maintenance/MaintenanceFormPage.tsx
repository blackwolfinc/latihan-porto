import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Card, Space, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { maintenanceService } from '@/services/maintenance.service';
import { carsService } from '@/services/cars.service';
import type { Car } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const MaintenanceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchCars();
    if (isEdit && id) fetchRecord(id);
  }, [id]);

  const fetchCars = async () => {
    try { const { data } = await carsService.getAll({ limit: 100 }); setCars(data.data); } catch { /* silent */ }
  };

  const fetchRecord = async (recordId: string) => {
    setLoading(true);
    try {
      const { data } = await maintenanceService.getById(recordId);
      const record = data.data;
      form.setFieldsValue({
        ...record,
        scheduledDate: record.scheduledDate ? dayjs(record.scheduledDate) : undefined,
        completedDate: record.completedDate ? dayjs(record.completedDate) : undefined,
      });
    } catch {
      message.error('Gagal memuat data');
      navigate('/maintenance');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        scheduledDate: values.scheduledDate?.toISOString(),
        completedDate: values.completedDate?.toISOString(),
      };
      if (isEdit && id) {
        await maintenanceService.update(id, payload);
        message.success('Record berhasil diperbarui');
      } else {
        await maintenanceService.create(payload);
        message.success('Record berhasil ditambahkan');
      }
      navigate('/maintenance');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Maintenance' : 'Tambah Maintenance'}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Maintenance', path: '/maintenance' }, { title: isEdit ? 'Edit' : 'Tambah' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/maintenance')}>Kembali</Button>
      </PageHeader>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
          <Form.Item name="carId" label="Mobil" rules={[{ required: true, message: 'Pilih mobil!' }]}>
            <Select placeholder="Pilih mobil" showSearch optionFilterProp="children">
              {cars.map((car) => (
                <Option key={car.id} value={car.id}>{car.plateNumber} - {car.brand} {car.model}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Tipe" rules={[{ required: true, message: 'Pilih tipe!' }]}>
            <Select placeholder="Pilih tipe">
              <Option value="ROUTINE">Routine</Option>
              <Option value="REPAIR">Repair</Option>
              <Option value="INSPECTION">Inspection</Option>
              <Option value="TIRE">Tire</Option>
              <Option value="BODY">Body</Option>
              <Option value="ENGINE">Engine</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Deskripsi" rules={[{ required: true, message: 'Masukkan deskripsi!' }]}>
            <TextArea rows={3} placeholder="Deskripsi pekerjaan..." />
          </Form.Item>
          <Form.Item name="cost" label="Biaya" rules={[{ required: true, message: 'Masukkan biaya!' }]}>
            <InputNumber min={0} style={{ width: '100%' }}
              formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => v!.replace(/Rp\s?|(\.*)/g, '') as any}
            />
          </Form.Item>
          <Form.Item name="scheduledDate" label="Tanggal" rules={[{ required: true, message: 'Pilih tanggal!' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="completedDate" label="Tanggal Selesai">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mileageAtService" label="Odometer (km)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="50000" />
          </Form.Item>
          <Form.Item name="vendor" label="Vendor">
            <Input placeholder="Nama bengkel/vendor" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button onClick={() => navigate('/maintenance')}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MaintenanceFormPage;
