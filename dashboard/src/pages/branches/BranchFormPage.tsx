import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Switch, message, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PageHeader from '@/components/shared/PageHeader';
import { branchesService } from '@/services/branches.service';

const { Text } = Typography;

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const BranchFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) loadBranch();
  }, [id]);

  const loadBranch = async () => {
    try {
      const { data } = await branchesService.getById(id!);
      const branch = data.data;
      form.setFieldsValue(branch);
      if (branch.latitude && branch.longitude) {
        setPosition([branch.latitude, branch.longitude]);
      }
    } catch {
      message.error('Gagal memuat data cabang');
      navigate('/branches');
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    form.setFieldsValue({ latitude: lat, longitude: lng });
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (isEdit) {
        await branchesService.update(id!, values);
        message.success('Cabang berhasil diperbarui');
      } else {
        await branchesService.create(values);
        message.success('Cabang berhasil ditambahkan');
      }
      navigate('/branches');
    } catch {
      message.error('Gagal menyimpan data cabang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Cabang' : 'Tambah Cabang'} subtitle="Kelola informasi lokasi cabang" />

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true }}>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Informasi Cabang" style={{ marginBottom: 16 }}>
              <Form.Item name="name" label="Nama Cabang" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input placeholder="Cabang Jakarta Pusat" />
              </Form.Item>
              <Form.Item name="address" label="Alamat" rules={[{ required: true, message: 'Wajib diisi' }]}>
                <Input.TextArea rows={2} placeholder="Alamat lengkap..." />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="city" label="Kota" rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input placeholder="Jakarta" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="province" label="Provinsi" rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input placeholder="DKI Jakarta" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="Telepon" rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input placeholder="021-12345678" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email">
                    <Input placeholder="cabang@rentalku.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="isActive" label="Status Aktif" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Lokasi di Peta" style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                Klik pada peta untuk menandai lokasi cabang
              </Text>
              <div style={{ height: 300, marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position} icon={defaultIcon} />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                </MapContainer>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="latitude" label="Latitude">
                    <Input placeholder="-6.2088" readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="longitude" label="Longitude">
                    <Input placeholder="106.8456" readOnly />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Cabang'}
          </Button>
          <Button onClick={() => navigate('/branches')}>Batal</Button>
        </Space>
      </Form>
    </div>
  );
};

export default BranchFormPage;
