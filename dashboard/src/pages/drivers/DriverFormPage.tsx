import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Upload, Card, Space, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { driversService } from '@/services/drivers.service';

const { Option } = Select;

const DriverFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit && id) fetchDriver(id);
  }, [id]);

  const fetchDriver = async (driverId: string) => {
    setLoading(true);
    try {
      const { data } = await driversService.getById(driverId);
      const driver = data.data;
      form.setFieldsValue({
        ...driver,
        licenseExpiry: driver.licenseExpiry ? dayjs(driver.licenseExpiry) : undefined,
      });
    } catch {
      message.error('Gagal memuat data driver');
      navigate('/drivers');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        licenseExpiry: values.licenseExpiry?.toISOString(),
      };
      if (isEdit && id) {
        await driversService.update(id, payload);
        message.success('Driver berhasil diperbarui');
      } else {
        await driversService.create(payload);
        message.success('Driver berhasil ditambahkan');
      }
      navigate('/drivers');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menyimpan data driver');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Driver' : 'Tambah Driver'}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Driver', path: '/drivers' }, { title: isEdit ? 'Edit' : 'Tambah' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/drivers')}>Kembali</Button>
      </PageHeader>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
          {!isEdit && (
            <Form.Item name="userId" label="User" rules={[{ required: true, message: 'Pilih user!' }]}>
              <Input placeholder="User ID" />
            </Form.Item>
          )}
          <Form.Item name="licenseNumber" label="Nomor SIM" rules={[{ required: true, message: 'Masukkan nomor SIM!' }]}>
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item name="licenseType" label="Tipe SIM" rules={[{ required: true, message: 'Pilih tipe SIM!' }]}>
            <Select placeholder="Pilih tipe SIM">
              <Option value="A">SIM A</Option>
              <Option value="B1">SIM B1</Option>
              <Option value="B2">SIM B2</Option>
            </Select>
          </Form.Item>
          <Form.Item name="licenseExpiry" label="Masa Berlaku SIM" rules={[{ required: true, message: 'Masukkan masa berlaku!' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="Pilih tanggal" />
          </Form.Item>
          <Form.Item label="Dokumen">
            <Upload maxCount={3} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Upload Dokumen</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button onClick={() => navigate('/drivers')}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DriverFormPage;
