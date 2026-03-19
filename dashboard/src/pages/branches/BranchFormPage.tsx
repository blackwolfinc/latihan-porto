import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, message, Spin, InputNumber, Row, Col } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { branchesService } from '@/services/branches.service';

const BranchFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit && id) fetchBranch(id);
  }, [id]);

  const fetchBranch = async (branchId: string) => {
    setLoading(true);
    try {
      const { data } = await branchesService.getById(branchId);
      form.setFieldsValue(data.data);
    } catch {
      message.error('Gagal memuat data cabang');
      navigate('/branches');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await branchesService.update(id, values);
        message.success('Cabang berhasil diperbarui');
      } else {
        await branchesService.create(values);
        message.success('Cabang berhasil ditambahkan');
      }
      navigate('/branches');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menyimpan data cabang');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Cabang' : 'Tambah Cabang'}
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Cabang', path: '/branches' }, { title: isEdit ? 'Edit' : 'Tambah' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/branches')}>Kembali</Button>
      </PageHeader>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
          <Form.Item name="name" label="Nama Cabang" rules={[{ required: true, message: 'Masukkan nama cabang!' }]}>
            <Input placeholder="Cabang Jakarta Pusat" />
          </Form.Item>
          <Form.Item name="address" label="Alamat" rules={[{ required: true, message: 'Masukkan alamat!' }]}>
            <Input.TextArea rows={2} placeholder="Jl. Sudirman No. 1" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Kota" rules={[{ required: true, message: 'Masukkan kota!' }]}>
                <Input placeholder="Jakarta" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="province" label="Provinsi" rules={[{ required: true, message: 'Masukkan provinsi!' }]}>
                <Input placeholder="DKI Jakarta" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phone" label="Telepon" rules={[{ required: true, message: 'Masukkan telepon!' }]}>
            <Input placeholder="021-1234567" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="cabang@rentalku.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber style={{ width: '100%' }} placeholder="-6.2088" step={0.0001} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber style={{ width: '100%' }} placeholder="106.8456" step={0.0001} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button onClick={() => navigate('/branches')}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BranchFormPage;
