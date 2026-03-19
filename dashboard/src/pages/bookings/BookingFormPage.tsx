import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  InputNumber,
  message,
  Space,
  Typography,
  Divider,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { bookingsService } from '@/services/bookings.service';
import { carsService } from '@/services/cars.service';
import { driversService } from '@/services/drivers.service';
import { customersService } from '@/services/customers.service';
import { branchesService } from '@/services/branches.service';
import type { Car, Driver, User, Branch } from '@/types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const BookingFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    loadOptions();
    if (isEdit) loadBooking();
  }, [id]);

  const loadOptions = async () => {
    try {
      const [carsRes, driversRes, customersRes, branchesRes] = await Promise.allSettled([
        carsService.getAll({ limit: 100 }),
        driversService.getAll({ limit: 100 }),
        customersService.getAll({ limit: 100 }),
        branchesService.getAll({ limit: 100 }),
      ]);
      if (carsRes.status === 'fulfilled') setCars(carsRes.value.data.data);
      if (driversRes.status === 'fulfilled') setDrivers(driversRes.value.data.data);
      if (customersRes.status === 'fulfilled') setCustomers(customersRes.value.data.data);
      if (branchesRes.status === 'fulfilled') setBranches(branchesRes.value.data.data);
    } catch {
      // silent
    }
  };

  const loadBooking = async () => {
    try {
      const { data } = await bookingsService.getById(id!);
      const booking = data.data;
      form.setFieldsValue({
        ...booking,
        dateRange: [dayjs(booking.startDate), dayjs(booking.endDate)],
      });
      if (booking.car) setSelectedCar(booking.car);
    } catch {
      message.error('Gagal memuat data booking');
      navigate('/bookings');
    }
  };

  const handleCarChange = (carId: string) => {
    const car = cars.find((c) => c.id === carId);
    setSelectedCar(car || null);
    if (car) {
      form.setFieldValue('branchId', car.branchId);
      calculateTotal();
    }
  };

  const calculateTotal = () => {
    const dateRange = form.getFieldValue('dateRange');
    if (selectedCar && dateRange && dateRange[0] && dateRange[1]) {
      const days = dateRange[1].diff(dateRange[0], 'day') + 1;
      const driverFee = form.getFieldValue('driverFee') || 0;
      const discount = form.getFieldValue('discount') || 0;
      const total = selectedCar.pricePerDay * days + driverFee - discount;
      form.setFieldValue('totalAmount', Math.max(0, total));
    }
  };

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    const { dateRange, ...rest } = values as Record<string, unknown> & { dateRange: [dayjs.Dayjs, dayjs.Dayjs] };
    const payload = {
      ...rest,
      startDate: (dateRange[0] as dayjs.Dayjs).toISOString(),
      endDate: (dateRange[1] as dayjs.Dayjs).toISOString(),
    };

    try {
      if (isEdit) {
        await bookingsService.update(id!, payload);
        message.success('Booking berhasil diperbarui');
      } else {
        await bookingsService.create(payload);
        message.success('Booking berhasil dibuat');
      }
      navigate('/bookings');
    } catch {
      message.error('Gagal menyimpan booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Booking' : 'Buat Booking Baru'}
        subtitle={isEdit ? 'Perbarui data pesanan' : 'Buat pesanan rental baru'}
        showBack
      />

      <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={calculateTotal}>
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card title="Detail Booking" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="customerId" label="Customer" rules={[{ required: true, message: 'Pilih customer' }]}>
                    <Select
                      placeholder="Pilih Customer"
                      showSearch
                      optionFilterProp="label"
                      options={customers.map((c) => ({ label: `${c.name} (${c.email})`, value: c.id }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="carId" label="Mobil" rules={[{ required: true, message: 'Pilih mobil' }]}>
                    <Select
                      placeholder="Pilih Mobil"
                      showSearch
                      optionFilterProp="label"
                      onChange={handleCarChange}
                      options={cars.map((c) => ({
                        label: `${c.brand} ${c.model} - ${c.plateNumber} (Rp ${c.pricePerDay.toLocaleString('id-ID')}/hari)`,
                        value: c.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="driverId" label="Driver (opsional)">
                    <Select
                      placeholder="Pilih Driver"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={drivers.map((d) => ({
                        label: `${d.user?.name || 'Driver'} - ${d.licenseNumber}`,
                        value: d.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="branchId" label="Cabang" rules={[{ required: true, message: 'Pilih cabang' }]}>
                    <Select
                      placeholder="Pilih Cabang"
                      options={branches.map((b) => ({ label: b.name, value: b.id }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dateRange" label="Tanggal Rental" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="pickupLocation" label="Lokasi Jemput">
                    <Input placeholder="Alamat jemput" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dropoffLocation" label="Lokasi Antar">
                    <Input placeholder="Alamat antar" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="notes" label="Catatan">
                    <Input.TextArea rows={3} placeholder="Catatan tambahan..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Ringkasan Biaya" style={{ marginBottom: 16 }}>
              {selectedCar && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Mobil dipilih:</Text>
                  <br />
                  <Text strong>{selectedCar.brand} {selectedCar.model}</Text>
                  <br />
                  <Text>Rp {selectedCar.pricePerDay.toLocaleString('id-ID')} / hari</Text>
                </div>
              )}
              <Form.Item name="driverFee" label="Biaya Driver">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number(v!.replace(/Rp\s?|(\.*)/g, ''))}
                />
              </Form.Item>
              <Form.Item name="discount" label="Diskon">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number(v!.replace(/Rp\s?|(\.*)/g, ''))}
                />
              </Form.Item>
              <Divider />
              <Form.Item name="totalAmount" label="Total">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  readOnly
                  formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number(v!.replace(/Rp\s?|(\.*)/g, ''))}
                />
              </Form.Item>
            </Card>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {isEdit ? 'Simpan Perubahan' : 'Buat Booking'}
              </Button>
              <Button block onClick={() => navigate('/bookings')}>
                Batal
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BookingFormPage;
