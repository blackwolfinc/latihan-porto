import React, { useEffect, useState } from 'react';
import { Card, Select, DatePicker, Space, Tag, Typography, Tooltip, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import { bookingsService } from '@/services/bookings.service';
import { carsService } from '@/services/cars.service';
import type { Booking, Car } from '@/types';
import { BookingStatus } from '@/types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  [BookingStatus.PENDING]: '#faad14',
  [BookingStatus.CONFIRMED]: '#1677ff',
  [BookingStatus.ONGOING]: '#52c41a',
  [BookingStatus.COMPLETED]: '#8c8c8c',
  [BookingStatus.CANCELLED]: '#ff4d4f',
  [BookingStatus.OVERDUE]: '#ff7a45',
};

const SchedulingPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('week'), dayjs().endOf('week').add(1, 'week')]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.allSettled([
        carsService.getAll({ limit: 100 }),
        bookingsService.getCalendar(dateRange[0].month() + 1, dateRange[0].year()),
      ]);
      if (carsRes.status === 'fulfilled') setCars(carsRes.value.data.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data.data);
    } catch {
      message.error('Gagal memuat data scheduling');
    }
  };

  const days: Dayjs[] = [];
  let current = dateRange[0];
  while (current.isBefore(dateRange[1]) || current.isSame(dateRange[1], 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }

  const getBookingsForCar = (carId: string) => {
    return bookings.filter((b) => b.carId === carId);
  };

  const getBarStyle = (booking: Booking) => {
    const start = dayjs(booking.startDate);
    const end = dayjs(booking.endDate);
    const rangeStart = dateRange[0];
    const totalDays = dateRange[1].diff(rangeStart, 'day') + 1;

    const startOffset = Math.max(0, start.diff(rangeStart, 'day'));
    const endOffset = Math.min(totalDays - 1, end.diff(rangeStart, 'day'));
    const width = endOffset - startOffset + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`,
      backgroundColor: statusColors[booking.status] || '#1677ff',
    };
  };

  return (
    <div>
      <PageHeader title="Scheduling" subtitle="Timeline ketersediaan armada">
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([dates[0], dates[1]]);
            }
          }}
        />
      </PageHeader>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          {Object.entries(statusColors).map(([status, color]) => (
            <Tag key={status} color={color}>{status}</Tag>
          ))}
        </Space>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            {/* Header row - dates */}
            <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 4 }}>
              <div style={{ width: 180, flexShrink: 0, fontWeight: 600 }}>Mobil</div>
              <div style={{ flex: 1, display: 'flex' }}>
                {days.map((day) => (
                  <div
                    key={day.format('YYYY-MM-DD')}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 11,
                      color: day.day() === 0 || day.day() === 6 ? '#ff4d4f' : undefined,
                      fontWeight: day.isSame(dayjs(), 'day') ? 700 : 400,
                    }}
                  >
                    <div>{day.format('dd')}</div>
                    <div>{day.format('DD')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Car rows */}
            {cars.map((car) => {
              const carBookings = getBookingsForCar(car.id);
              return (
                <div
                  key={car.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #f5f5f5',
                    padding: '8px 0',
                    minHeight: 44,
                  }}
                >
                  <div style={{ width: 180, flexShrink: 0 }}>
                    <Text strong style={{ fontSize: 12 }}>{car.plateNumber}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{car.brand} {car.model}</Text>
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: 28 }}>
                    {/* Grid lines */}
                    <div style={{ display: 'flex', height: '100%', position: 'absolute', width: '100%' }}>
                      {days.map((day) => (
                        <div
                          key={day.format('YYYY-MM-DD')}
                          style={{
                            flex: 1,
                            borderLeft: '1px solid #f5f5f5',
                            backgroundColor: day.isSame(dayjs(), 'day') ? '#e6f4ff' : undefined,
                          }}
                        />
                      ))}
                    </div>
                    {/* Booking bars */}
                    {carBookings.map((booking) => {
                      const style = getBarStyle(booking);
                      return (
                        <Tooltip
                          key={booking.id}
                          title={`${booking.bookingNumber} - ${booking.customer?.name || 'Customer'} (${dayjs(booking.startDate).format('DD/MM')} - ${dayjs(booking.endDate).format('DD/MM')})`}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: 4,
                              height: 20,
                              borderRadius: 4,
                              opacity: 0.85,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 4,
                              ...style,
                            }}
                          >
                            <Text style={{ fontSize: 10, color: '#fff' }} ellipsis>
                              {booking.customer?.name || booking.bookingNumber}
                            </Text>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {cars.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Text type="secondary">Tidak ada data mobil</Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SchedulingPage;
