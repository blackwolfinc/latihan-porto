import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Image, Row, Col, Button, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { inspectionsService } from '@/services/inspections.service';
import type { Inspection } from '@/types';

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchInspection(id); }, [id]);

  const fetchInspection = async (inspId: string) => {
    try {
      const { data } = await inspectionsService.getById(inspId);
      setInspection(data.data);
    } catch {
      message.error('Gagal memuat data inspeksi');
      navigate('/inspections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!inspection) return <Empty description="Inspeksi tidak ditemukan" />;

  return (
    <div>
      <PageHeader
        title="Detail Inspeksi"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Inspeksi', path: '/inspections' }, { title: 'Detail' }]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inspections')}>Kembali</Button>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Informasi Inspeksi" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
              <Descriptions.Item label="Tipe">
                {inspection.type === 'PRE_RENTAL' ? 'Sebelum Rental' : inspection.type === 'POST_RENTAL' ? 'Setelah Rental' : 'Berkala'}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal">{dayjs(inspection.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Mobil">{inspection.car ? `${inspection.car.plateNumber} - ${inspection.car.brand} ${inspection.car.model}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Inspector">{inspection.inspector?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Booking">{inspection.booking?.bookingNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Kilometer">{inspection.mileage?.toLocaleString('id-ID')} km</Descriptions.Item>
              <Descriptions.Item label="Level BBM">{inspection.fuelLevel}%</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Kondisi Kendaraan" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Eksterior">{inspection.exteriorCondition}</Descriptions.Item>
              <Descriptions.Item label="Interior">{inspection.interiorCondition}</Descriptions.Item>
              <Descriptions.Item label="Mesin">{inspection.engineCondition}</Descriptions.Item>
              <Descriptions.Item label="Ban">{inspection.tireCondition}</Descriptions.Item>
              {inspection.damages && <Descriptions.Item label="Kerusakan">{inspection.damages}</Descriptions.Item>}
              {inspection.notes && <Descriptions.Item label="Catatan">{inspection.notes}</Descriptions.Item>}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Foto Inspeksi">
            {inspection.photos && inspection.photos.length > 0 ? (
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {inspection.photos.map((photo, idx) => (
                    <Col key={idx} span={12}>
                      <Image src={photo} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }} />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            ) : (
              <Empty description="Tidak ada foto" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InspectionDetailPage;
