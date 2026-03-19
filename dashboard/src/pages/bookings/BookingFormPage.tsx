import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Space, Form, Select, DatePicker, Input, Switch, Descriptions, Table, message, Row, Col, Empty, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { carsService } from '@/services/cars.service';
import { customersService } from '@/services/customers.service';
import { driversService } from '@/services/drivers.service';
import { bookingsService } from '@/services/bookings.service';
import type { Car, User, Driver } from '@/types';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [withDriver, setWithDriver] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCars();
    fetchCustomers();
  }, []);

  const fetchCars = async () => {
    try {
      const { data } = await carsService.getAll({ status: 'AVAILABLE' as any, limit: 100 });
      setCars(data.data);
    } catch {
      // silent
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await customersService.getAll({ limit: 100 });
      setCustomers(data.data);
    } catch {
      // silent
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await driversService.getAll({ status: 'AVAILABLE' as any, limit: 100 });
      setDrivers(data.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (withDriver) fetchDrivers();
  }, [withDriver]);

  const totalDays = dateRange ? dateRange[1].diff(dateRange[0], 'day') + 1 : 0;
  const totalAmount = (selectedCar?.pricePerDay || 0) * totalDays;

  const handleSubmit = async () => {
    if (!selectedCar || !selectedCustomer || !dateRange) {
      message.error('Lengkapi semua data yang diperlukan');
      return;
    }
    setSaving(true);
    try {
      await bookingsService.create({
        carId: selectedCar.id,
        customerId: selectedCustomer.id,
        driverId: withDriver && selectedDriver ? selectedDriver.id : undefined,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        pickupLocation,
        dropoffLocation,
        notes,
        totalAmount,
      });
      message.success('Booking berhasil dibuat');
      navigate('/bookings');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal membuat booking');
    } finally {
      setSaving(false);
    }
  };

  const carColumns = [
    {
      title: 'Mobil',
      key: 'car',
      render: (_: any, record: Car) => `${record.brand} ${record.model} (${record.year})`,
    },
    { title: 'Plat', dataIndex: 'plateNumber', key: 'plateNumber' },
    { title: 'Kategori', dataIndex: 'category', key: 'category' },
    {
      title: 'Tarif/Hari',
      dataIndex: 'pricePerDay',
      key: 'pricePerDay',
      render: (price: number) => `Rp ${price?.toLocaleString('id-ID')}`,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: Car) => (
        <Button
          type={selectedCar?.id === record.id ? 'primary' : 'default'}
          size="small"
          onClick={() => setSelectedCar(record)}
        >
          {selectedCar?.id === record.id ? 'Terpilih' : 'Pilih'}
        </Button>
      ),
    },
  ];

  const steps = [
    {
      title: 'Pilih Mobil',
      content: (
        <Table
          columns={carColumns}
          dataSource={cars}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: <Empty description="Tidak ada mobil tersedia" /> }}
        />
      ),
    },
    {
      title: 'Pilih Customer',
      content: (
        <Select
          showSearch
          placeholder="Cari dan pilih customer..."
          style={{ width: '100%' }}
          optionFilterProp="children"
          value={selectedCustomer?.id}
          onChange={(id) => {
            const customer = customers.find((c) => c.id === id);
            setSelectedCustomer(customer || null);
          }}
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
          size="large"
        >
          {customers.map((customer) => (
            <Option key={customer.id} value={customer.id}>
              {customer.name} - {customer.email}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Detail Booking',
      content: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <label>Tanggal Sewa</label>
              <RangePicker
                style={{ width: '100%', marginTop: 8 }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <label>Lokasi Pickup</label>
              <Input
                style={{ marginTop: 8 }}
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Alamat penjemputan"
              />
            </Col>
            <Col xs={24} md={12}>
              <label>Lokasi Dropoff</label>
              <Input
                style={{ marginTop: 8 }}
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Alamat pengantaran"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Space>
                <label>Dengan Driver</label>
                <Switch checked={withDriver} onChange={setWithDriver} />
              </Space>
            </Col>
            {withDriver && (
              <Col xs={24} md={12}>
                <label>Pilih Driver</label>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Pilih driver"
                  value={selectedDriver?.id}
                  onChange={(id) => setSelectedDriver(drivers.find((d) => d.id === id) || null)}
                >
                  {drivers.map((driver) => (
                    <Option key={driver.id} value={driver.id}>
                      {driver.user?.name} - {driver.licenseNumber}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
          </Row>
          <div>
            <label>Catatan</label>
            <TextArea
              style={{ marginTop: 8 }}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
            />
          </div>
        </Space>
      ),
    },
    {
      title: 'Ringkasan',
      content: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mobil">
            {selectedCar ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.plateNumber})` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.email})` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal">
            {dateRange ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')} (${totalDays} hari)` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Lokasi Pickup">{pickupLocation || '-'}</Descriptions.Item>
          <Descriptions.Item label="Lokasi Dropoff">{dropoffLocation || '-'}</Descriptions.Item>
          <Descriptions.Item label="Driver">
            {withDriver ? (selectedDriver?.user?.name || 'Belum dipilih') : 'Tanpa Driver'}
          </Descriptions.Item>
          <Descriptions.Item label="Tarif/Hari">
            Rp {selectedCar?.pricePerDay?.toLocaleString('id-ID') || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            <strong style={{ fontSize: 18, color: '#1677ff' }}>
              Rp {totalAmount.toLocaleString('id-ID')}
            </strong>
          </Descriptions.Item>
          {notes && <Descriptions.Item label="Catatan">{notes}</Descriptions.Item>}
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Buat Booking Baru"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Booking', path: '/bookings' },
          { title: 'Buat Baru' },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')}>Kembali</Button>
      </PageHeader>

      <Card>
        <Steps current={current} items={steps.map((s) => ({ title: s.title }))} style={{ marginBottom: 32 }} />
        <div style={{ minHeight: 300 }}>{steps[current].content}</div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Sebelumnya
          </Button>
          {current < steps.length - 1 ? (
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => setCurrent(current + 1)}>
              Selanjutnya
            </Button>
          ) : (
            <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit} loading={saving}>
              Konfirmasi Booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingFormPage;
