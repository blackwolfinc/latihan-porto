import React, { useState, useEffect, useRef } from 'react';
import { Card, List, Badge, Typography, Space, Tag, Spin, Input } from 'antd';
import { CarOutlined, SearchOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHeader from '@/components/shared/PageHeader';
import type { GpsLog, Car } from '@/types';

const { Text } = Typography;

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface CarGpsData {
  carId: string;
  plateNumber: string;
  brand: string;
  model: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdate: string;
  status: 'moving' | 'idle' | 'stopped';
}

const mockCarsGps: CarGpsData[] = [
  { carId: '1', plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza', latitude: -6.2088, longitude: 106.8456, speed: 45, lastUpdate: '2024-01-15T10:30:00', status: 'moving' },
  { carId: '2', plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V', latitude: -6.1751, longitude: 106.8650, speed: 0, lastUpdate: '2024-01-15T10:28:00', status: 'idle' },
  { carId: '3', plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero', latitude: -6.2297, longitude: 106.8295, speed: 60, lastUpdate: '2024-01-15T10:31:00', status: 'moving' },
  { carId: '4', plateNumber: 'B 3456 JKL', brand: 'Toyota', model: 'Innova', latitude: -6.1944, longitude: 106.8229, speed: 0, lastUpdate: '2024-01-15T09:45:00', status: 'stopped' },
  { carId: '5', plateNumber: 'B 7890 MNO', brand: 'Suzuki', model: 'Ertiga', latitude: -6.2400, longitude: 106.8500, speed: 30, lastUpdate: '2024-01-15T10:29:00', status: 'moving' },
  { carId: '6', plateNumber: 'B 2345 PQR', brand: 'Daihatsu', model: 'Xenia', latitude: -6.1600, longitude: 106.8800, speed: 0, lastUpdate: '2024-01-15T10:25:00', status: 'idle' },
];

const statusConfig = {
  moving: { color: 'green', label: 'Bergerak' },
  idle: { color: 'orange', label: 'Diam' },
  stopped: { color: 'red', label: 'Berhenti' },
};

const GpsTrackingPage: React.FC = () => {
  const [carsGps, setCarsGps] = useState<CarGpsData[]>(mockCarsGps);
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  const filteredCars = carsGps.filter((car) =>
    car.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    car.brand.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="GPS Tracking"
        subtitle="Pantau lokasi kendaraan secara real-time"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'GPS Tracking' }]}
      />

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 280px)' }}>
        <Card
          title="Kendaraan Aktif"
          size="small"
          style={{ width: 320, overflow: 'auto', flexShrink: 0 }}
          extra={<Badge count={filteredCars.length} style={{ backgroundColor: '#1677ff' }} />}
        >
          <Input
            placeholder="Cari kendaraan..."
            prefix={<SearchOutlined />}
            size="small"
            style={{ marginBottom: 12 }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <List
            dataSource={filteredCars}
            renderItem={(car) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '8px 4px',
                  background: selectedCar === car.carId ? '#e6f4ff' : undefined,
                  borderRadius: 4,
                }}
                onClick={() => setSelectedCar(car.carId)}
              >
                <List.Item.Meta
                  avatar={<CarOutlined style={{ fontSize: 20, color: statusConfig[car.status].color }} />}
                  title={
                    <Space size={4}>
                      <Text strong style={{ fontSize: 13 }}>{car.plateNumber}</Text>
                      <Tag color={statusConfig[car.status].color} style={{ fontSize: 11 }}>
                        {statusConfig[car.status].label}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div style={{ fontSize: 12 }}>
                      <div>{car.brand} {car.model}</div>
                      <div>Kecepatan: {car.speed} km/h</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card bodyStyle={{ padding: 0, height: '100%' }} style={{ flex: 1 }}>
          <MapContainer
            center={[-6.2088, 106.8456]}
            zoom={12}
            style={{ height: '100%', width: '100%', borderRadius: 8 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredCars.map((car) => (
              <Marker key={car.carId} position={[car.latitude, car.longitude]}>
                <Popup>
                  <div>
                    <strong>{car.plateNumber}</strong><br />
                    {car.brand} {car.model}<br />
                    Kecepatan: {car.speed} km/h<br />
                    Status: {statusConfig[car.status].label}<br />
                    Update: {new Date(car.lastUpdate).toLocaleTimeString('id-ID')}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>
      </div>
    </div>
  );
};

export default GpsTrackingPage;
