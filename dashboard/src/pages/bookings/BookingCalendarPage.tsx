import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Drawer, List, Tag, Button, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import PageHeader from '@/components/shared/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { bookingsService } from '@/services/bookings.service';
import type { Booking } from '@/types';

const statusBadgeMap: Record<string, 'success' | 'processing' | 'warning' | 'error' | 'default'> = {
  ONGOING: 'success',
  CONFIRMED: 'processing',
  PENDING: 'warning',
  CANCELLED: 'error',
  COMPLETED: 'default',
  OVERDUE: 'error',
};

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings(dayjs().month() + 1, dayjs().year());
  }, []);

  const fetchBookings = async (month: number, year: number) => {
    try {
      const { data } = await bookingsService.getCalendar(month, year);
      setBookings(data.data);
    } catch {
      // silent
    }
  };

  const onPanelChange = (date: Dayjs) => {
    fetchBookings(date.month() + 1, date.year());
  };

  const getBookingsForDate = (date: Dayjs) => {
    return bookings.filter((b) => {
      const start = dayjs(b.startDate);
      const end = dayjs(b.endDate);
      return date.isSame(start, 'day') || date.isSame(end, 'day') || (date.isAfter(start) && date.isBefore(end));
    });
  };

  const dateCellRender = (date: Dayjs) => {
    const dayBookings = getBookingsForDate(date);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayBookings.slice(0, 3).map((b) => (
          <li key={b.id}>
            <Badge
              status={statusBadgeMap[b.status] || 'default'}
              text={<span style={{ fontSize: 11 }}>{b.car?.brand || b.bookingNumber}</span>}
            />
          </li>
        ))}
        {dayBookings.length > 3 && (
          <li><span style={{ fontSize: 11, color: '#1677ff' }}>+{dayBookings.length - 3} lainnya</span></li>
        )}
      </ul>
    );
  };

  const onSelect = (date: Dayjs) => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length > 0) {
      setSelectedDate(date);
      setSelectedBookings(dayBookings);
      setDrawerOpen(true);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kalender Booking"
        breadcrumbs={[
          { title: 'Dashboard', path: '/' },
          { title: 'Booking', path: '/bookings' },
          { title: 'Kalender' },
        ]}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')}>Kembali</Button>
      </PageHeader>

      <Card>
        <Calendar
          cellRender={(date, info) => {
            if (info.type === 'date') return dateCellRender(date);
            return info.originNode;
          }}
          onPanelChange={onPanelChange}
          onSelect={onSelect}
        />
      </Card>

      <Drawer
        title={`Booking - ${selectedDate.format('DD MMMM YYYY')}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
      >
        <List
          dataSource={selectedBookings}
          renderItem={(booking) => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>Detail</Button>,
              ]}
            >
              <List.Item.Meta
                title={`${booking.bookingNumber} - ${booking.car?.brand} ${booking.car?.model}`}
                description={
                  <Space direction="vertical" size={2}>
                    <span>{booking.customer?.name}</span>
                    <span>{dayjs(booking.startDate).format('DD/MM')} - {dayjs(booking.endDate).format('DD/MM/YYYY')}</span>
                    <StatusTag status={booking.status} type="booking" />
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default BookingCalendarPage;
