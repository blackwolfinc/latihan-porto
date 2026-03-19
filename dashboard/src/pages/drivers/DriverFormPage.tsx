import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { driversService } from '@/services/drivers.service';
import { customersService } from '@/services/customers.service';
import type { User } from '@/types';

const DriverFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  useEffect(() => {
    loadUsers();
    if (isEdit) {
      loadDriver();
    }
  }, [id]);

  const loadUsers = async () => {
    try {
      const { data } = await customersService.getAll({ limit: 200 });
      setUsers(data.data);
    } catch {
      message.error('Gagal memuat data user');
    }
  };

  const loadDriver = async () => {
    setLoading(true);
    try {
      const { data } = await driversService.getById(id!);
      const driver = data.data;
      form.setFieldsValue({
        userId: driver.userId,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpiry: driver.licenseExpiry ? dayjs(driver.licenseExpiry) : undefined,
      });
    } catch {
      message.error('Gagal memuat data driver');
      navigate('/drivers');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        licenseExpiry: (values.licenseExpiry as dayjs.Dayjs)?.toISOString(),
      };
      if (isEdit) {
        await driversService.update(id!, payload);
        message.success('Driver berhasil diperbarui');
      } else {
        await driversService.create(payload);
        message.success('Driver berhasil ditambahkan');
      }
      navigate('/drivers');
    } catch {
      message.error('Gagal menyimpan data driver');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Driver' : 'Tambah Driver'}
        subtitle={isEdit ? 'Perbarui data driver' : 'Daftarkan driver baru'}
        breadcrumbs={[
          { title: 'Driver', path: '/drivers' },
          { title: isEdit ? 'Edit' : 'Tambah' },
        ]}
      />
      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="userId"
            label="Pilih User"
            rules={[{ required: true, message: 'Pilih user!' }]}
          >
            <Select
              showSearch
              placeholder="Cari dan pilih user..."
              optionFilterProp="label"
              disabled={isEdit}
              options={users.map((u) => ({
                label: `${u.name} (${u.email})`,
                value: u.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="licenseNumber"
            label="Nomor SIM"
            rules={[{ required: true, message: 'Masukkan nomor SIM!' }]}
          >
            <Input placeholder="Masukkan nomor SIM" />
          </Form.Item>

          <Form.Item
            name="licenseType"
            label="Tipe SIM"
            rules={[{ required: true, message: 'Pilih tipe SIM!' }]}
          >
            <Select
              placeholder="Pilih tipe SIM"
              options={[
                { label: 'SIM A', value: 'A' },
                { label: 'SIM B1', value: 'B1' },
                { label: 'SIM B2', value: 'B2' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="licenseExpiry"
            label="Masa Berlaku SIM"
            rules={[{ required: true, message: 'Pilih tanggal masa berlaku!' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Pilih tanggal" format="DD MMMM YYYY" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
              {isEdit ? 'Perbarui' : 'Simpan'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/drivers')}>
              Batal
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DriverFormPage;
