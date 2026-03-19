import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Card, Space, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { fuelService } from '@/services/fuel.service';
import { carsService } from '@/services/cars.service';
import { driversService } from '@/services/drivers.service';
import type { Car, Driver } from '@/types';

const { Option } = Select;

const FuelFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchCars();
    fetchDrivers();
    if (isEdit && id) fetchLog(id);
  }, [id]);

  const fetchCars = async () => {
    try { const { data } = await carsService.getAll({ limit: 100 }); setCars(data.data); } catch { /* silent */ }
  };

  const fetchDrivers = async () => {
    try { const { data } = await driversService.getAll({ limit: 100 }); setDrivers(data.data); } catch { /* silent */ }
  };

  const fetchLog = async (logId: string) => {
    setLoading(true);
    try {
      const { data } = await fuelService.getById(logId);
      const log = data.data;
      form.setFieldsValue({ ...log, date: log.date ? dayjs(log.date) : undefined });
    } catch {
      message.error('Gagal memuat data');
      navigate('/fuel');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload = { ...values, date: values.date?.toISOString(), totalCost: (values.liters || 0) * (values.pricePerLiter || 0) };
      if (isEdit && id) {
        await fuelService.update(id, payload);
        message.success('Record berhasil diperbarui');
      } else {
        await fuelService.create(payload);
        message.success('Record berhasil ditambahkan');
      }
      navigate('/fuel');
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
        title={isEdit ? 'Edit BBM' : 'Tambah BBM'}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'BBM & Biaya', path: '/fuel' }, { title: isEdit ? 'Edit' : 'Tambah' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fuel')}>Kembali</Button>
      </PageHeader>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
          <Form.Item name="carId" label="Mobil" rules={[{ required: true, message: 'Pilih mobil!' }]}>
            <Select placeholder="Pilih mobil" showSearch optionFilterProp="children">
              {cars.map((car) => <Option key={car.id} value={car.id}>{car.plateNumber} - {car.brand} {car.model}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="driverId" label="Driver">
            <Select placeholder="Pilih driver" allowClear showSearch optionFilterProp="children">
              {drivers.map((d) => <Option key={d.id} value={d.id}>{d.user?.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="liters" label="Liter" rules={[{ required: true, message: 'Masukkan jumlah liter!' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="40" />
          </Form.Item>
          <Form.Item name="pricePerLiter" label="Harga per Liter" rules={[{ required: true, message: 'Masukkan harga!' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="13000" />
          </Form.Item>
          <Form.Item name="mileage" label="Odometer (km)" rules={[{ required: true, message: 'Masukkan odometer!' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="50000" />
          </Form.Item>
          <Form.Item name="fuelType" label="Jenis BBM" rules={[{ required: true, message: 'Pilih jenis BBM!' }]}>
            <Select placeholder="Pilih jenis BBM">
              <Option value="BENSIN">Bensin</Option>
              <Option value="DIESEL">Diesel</Option>
              <Option value="HYBRID">Hybrid</Option>
              <Option value="ELECTRIC">Electric</Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Tanggal" rules={[{ required: true, message: 'Pilih tanggal!' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="station" label="SPBU">
            <Input placeholder="Nama SPBU" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button onClick={() => navigate('/fuel')}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FuelFormPage;
