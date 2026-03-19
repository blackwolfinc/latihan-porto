import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Upload, message, Card, Row, Col, Spin } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { carsService } from '@/services/cars.service';
import { branchesService } from '@/services/branches.service';
import type { Branch } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const CarFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const isEdit = Boolean(id);

  useEffect(() => {
    fetchBranches();
    if (isEdit && id) {
      fetchCar(id);
    }
  }, [id]);

  const fetchBranches = async () => {
    try {
      const { data } = await branchesService.getAll({ limit: 100 });
      setBranches(data.data);
    } catch {
      // silent
    }
  };

  const fetchCar = async (carId: string) => {
    setLoading(true);
    try {
      const { data } = await carsService.getById(carId);
      form.setFieldsValue(data.data);
    } catch {
      message.error('Gagal memuat data mobil');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await carsService.update(id, values);
        message.success('Mobil berhasil diperbarui');
      } else {
        await carsService.create(values);
        message.success('Mobil berhasil ditambahkan');
      }
      navigate('/cars');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menyimpan data mobil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Mobil' : 'Tambah Mobil'}
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Mobil', path: '/cars' },
          { title: isEdit ? 'Edit' : 'Tambah' },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cars')}>
          Kembali
        </Button>
      </PageHeader>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="brand" label="Brand" rules={[{ required: true, message: 'Masukkan brand!' }]}>
                <Input placeholder="Toyota, Honda, dll." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Masukkan model!' }]}>
                <Input placeholder="Avanza, CR-V, dll." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="year" label="Tahun" rules={[{ required: true, message: 'Masukkan tahun!' }]}>
                <InputNumber min={2000} max={2030} style={{ width: '100%' }} placeholder="2024" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="plateNumber" label="Plat Nomor" rules={[{ required: true, message: 'Masukkan plat nomor!' }]}>
                <Input placeholder="B 1234 ABC" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="color" label="Warna" rules={[{ required: true, message: 'Masukkan warna!' }]}>
                <Input placeholder="Hitam, Putih, dll." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="seats" label="Jumlah Kursi" rules={[{ required: true, message: 'Masukkan jumlah kursi!' }]}>
                <InputNumber min={2} max={20} style={{ width: '100%' }} placeholder="4" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="category" label="Kategori" rules={[{ required: true, message: 'Pilih kategori!' }]}>
                <Select placeholder="Pilih kategori">
                  <Option value="SEDAN">Sedan</Option>
                  <Option value="SUV">SUV</Option>
                  <Option value="MPV">MPV</Option>
                  <Option value="HATCHBACK">Hatchback</Option>
                  <Option value="PICKUP">Pickup</Option>
                  <Option value="VAN">Van</Option>
                  <Option value="LUXURY">Luxury</Option>
                  <Option value="SPORT">Sport</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="transmission" label="Transmisi" rules={[{ required: true, message: 'Pilih transmisi!' }]}>
                <Select placeholder="Pilih transmisi">
                  <Option value="MANUAL">Manual</Option>
                  <Option value="AUTOMATIC">Automatic</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="fuelType" label="Jenis BBM" rules={[{ required: true, message: 'Pilih jenis BBM!' }]}>
                <Select placeholder="Pilih jenis BBM">
                  <Option value="BENSIN">Bensin</Option>
                  <Option value="DIESEL">Diesel</Option>
                  <Option value="HYBRID">Hybrid</Option>
                  <Option value="ELECTRIC">Electric</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="pricePerDay" label="Tarif per Hari" rules={[{ required: true, message: 'Masukkan tarif!' }]}>
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/Rp\s?|(\.*)/g, '') as any}
                  placeholder="500000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="engineCapacity" label="Kapasitas Mesin (cc)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="1500" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="branchId" label="Cabang" rules={[{ required: true, message: 'Pilih cabang!' }]}>
                <Select placeholder="Pilih cabang">
                  {branches.map((branch) => (
                    <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Deskripsi">
            <TextArea rows={4} placeholder="Deskripsi mobil..." />
          </Form.Item>

          <Form.Item name="imageUrl" label="Gambar">
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button onClick={() => navigate('/cars')}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CarFormPage;
