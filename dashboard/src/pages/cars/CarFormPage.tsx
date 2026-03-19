import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  Upload,
  message,
  Space,
  Divider,
  Table,
  DatePicker,
  Popconfirm,
} from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload';
import PageHeader from '@/components/shared/PageHeader';
import { carsService } from '@/services/cars.service';
import { branchesService } from '@/services/branches.service';
import { CarCategory, TransmissionType, FuelType, CarStatus, DocumentType } from '@/types';
import type { Branch, CarDocument } from '@/types';
import dayjs from 'dayjs';

const CarFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [documents, setDocuments] = useState<CarDocument[]>([]);
  const [docForm] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    loadBranches();
    if (isEdit) loadCar();
  }, [id]);

  const loadBranches = async () => {
    try {
      const { data } = await branchesService.getAll({ limit: 100 });
      setBranches(data.data);
    } catch {
      // silent
    }
  };

  const loadCar = async () => {
    try {
      const { data } = await carsService.getById(id!);
      const car = data.data;
      form.setFieldsValue(car);
      setDocuments(car.documents || []);
    } catch {
      message.error('Gagal memuat data mobil');
      navigate('/cars');
    }
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (isEdit) {
        await carsService.update(id!, values);
        message.success('Mobil berhasil diperbarui');
      } else {
        await carsService.create(values);
        message.success('Mobil berhasil ditambahkan');
      }
      navigate('/cars');
    } catch {
      message.error('Gagal menyimpan data mobil');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    try {
      const values = await docForm.validateFields();
      if (isEdit && fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj as File);
        formData.append('type', values.docType);
        formData.append('documentNumber', values.docNumber);
        if (values.docExpiry) formData.append('expiryDate', values.docExpiry.toISOString());
        await carsService.addDocument(id!, formData);
        message.success('Dokumen berhasil ditambahkan');
        loadCar();
      }
      docForm.resetFields();
      setFileList([]);
    } catch {
      // validation error
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!isEdit) return;
    try {
      await carsService.deleteDocument(id!, documentId);
      message.success('Dokumen berhasil dihapus');
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    } catch {
      message.error('Gagal menghapus dokumen');
    }
  };

  const documentColumns = [
    { title: 'Tipe', dataIndex: 'type', key: 'type' },
    { title: 'Nomor', dataIndex: 'documentNumber', key: 'documentNumber' },
    {
      title: 'Kadaluarsa',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: unknown, record: CarDocument) => (
        <Popconfirm title="Hapus dokumen?" onConfirm={() => handleDeleteDocument(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Mobil' : 'Tambah Mobil'}
        subtitle={isEdit ? 'Perbarui data kendaraan' : 'Tambahkan kendaraan baru ke armada'}
        showBack
      />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card title="Informasi Kendaraan" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="plateNumber" label="Plat Nomor" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input placeholder="B 1234 ABC" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="brand" label="Merk" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input placeholder="Toyota" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input placeholder="Avanza" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="year" label="Tahun" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <InputNumber style={{ width: '100%' }} min={2000} max={2030} placeholder="2024" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="color" label="Warna" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input placeholder="Putih" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="category" label="Kategori" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Select
                  placeholder="Pilih Kategori"
                  options={Object.values(CarCategory).map((c) => ({ label: c, value: c }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="transmission" label="Transmisi" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Select
                  placeholder="Pilih Transmisi"
                  options={Object.values(TransmissionType).map((t) => ({ label: t, value: t }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="fuelType" label="Bahan Bakar" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Select
                  placeholder="Pilih BBM"
                  options={Object.values(FuelType).map((f) => ({ label: f, value: f }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="engineCapacity" label="Kapasitas Mesin (cc)">
                <InputNumber style={{ width: '100%' }} min={500} max={10000} placeholder="1500" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="seats" label="Jumlah Kursi" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <InputNumber style={{ width: '100%' }} min={2} max={20} placeholder="7" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="mileage" label="Kilometer">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Harga & Status" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="pricePerDay" label="Harga per Hari" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => Number(value!.replace(/Rp\s?|(\.*)/g, ''))}
                  placeholder="350000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="pricePerHour" label="Harga per Jam (opsional)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => Number(value!.replace(/Rp\s?|(\.*)/g, ''))}
                  placeholder="50000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Status" initialValue={CarStatus.AVAILABLE}>
                <Select options={Object.values(CarStatus).map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="branchId" label="Cabang" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Select
                  placeholder="Pilih Cabang"
                  options={branches.map((b) => ({ label: b.name, value: b.id }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Gambar & Deskripsi" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="imageUrl" label="URL Gambar Utama">
                <Input placeholder="https://..." />
              </Form.Item>
              <Upload
                listType="picture-card"
                maxCount={5}
                beforeUpload={() => false}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="description" label="Deskripsi">
                <Input.TextArea rows={4} placeholder="Deskripsi kendaraan..." />
              </Form.Item>
              <Form.Item name="features" label="Fitur">
                <Select mode="tags" placeholder="Tambah fitur (tekan Enter)" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {isEdit && (
          <Card title="Dokumen Kendaraan" style={{ marginBottom: 16 }}>
            <Table
              dataSource={documents}
              columns={documentColumns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Belum ada dokumen' }}
            />
            <Divider />
            <Form form={docForm} layout="inline">
              <Form.Item name="docType" rules={[{ required: true, message: 'Pilih tipe' }]}>
                <Select
                  placeholder="Tipe Dokumen"
                  style={{ width: 150 }}
                  options={Object.values(DocumentType).map((d) => ({ label: d, value: d }))}
                />
              </Form.Item>
              <Form.Item name="docNumber" rules={[{ required: true, message: 'Isi nomor' }]}>
                <Input placeholder="Nomor Dokumen" />
              </Form.Item>
              <Form.Item name="docExpiry">
                <DatePicker placeholder="Kadaluarsa" />
              </Form.Item>
              <Upload
                fileList={fileList}
                onChange={({ fileList: fl }) => setFileList(fl)}
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>File</Button>
              </Upload>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddDocument} style={{ marginLeft: 8 }}>
                Tambah Dokumen
              </Button>
            </Form>
          </Card>
        )}

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Mobil'}
          </Button>
          <Button onClick={() => navigate('/cars')}>Batal</Button>
        </Space>
      </Form>
    </div>
  );
};

export default CarFormPage;
