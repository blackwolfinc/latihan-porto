import React, { useState, useMemo } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
  Drawer,
  Badge,
  Descriptions,
  Typography,
  Row,
  Col,
  Segmented,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import PageHeader from '@/components/shared/PageHeader';

dayjs.extend(isBetween);

const { Text, Title } = Typography;

// --- Mock Data ---

interface MockCar {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  category: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
}

interface MockBooking {
  id: string;
  bookingNumber: string;
  carId: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: 'ONGOING' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  withDriver: boolean;
  driverName?: string;
  notes?: string;
}

const today = dayjs();

const mockCars: MockCar[] = [
  { id: 'c1', plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza', category: 'MPV', status: 'RENTED' },
  { id: 'c2', plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V', category: 'SUV', status: 'RENTED' },
  { id: 'c3', plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero Sport', category: 'SUV', status: 'AVAILABLE' },
  { id: 'c4', plateNumber: 'B 3456 JKL', brand: 'Toyota', model: 'Innova Zenix', category: 'MPV', status: 'RENTED' },
  { id: 'c5', plateNumber: 'B 7890 MNO', brand: 'Suzuki', model: 'Ertiga', category: 'MPV', status: 'AVAILABLE' },
  { id: 'c6', plateNumber: 'B 2345 PQR', brand: 'Daihatsu', model: 'Xenia', category: 'MPV', status: 'MAINTENANCE' },
  { id: 'c7', plateNumber: 'B 6789 STU', brand: 'Honda', model: 'Brio', category: 'Hatchback', status: 'RENTED' },
  { id: 'c8', plateNumber: 'B 1357 VWX', brand: 'Toyota', model: 'Fortuner', category: 'SUV', status: 'RENTED' },
  { id: 'c9', plateNumber: 'B 2468 YZA', brand: 'BMW', model: 'X3', category: 'Luxury', status: 'AVAILABLE' },
  { id: 'c10', plateNumber: 'B 1122 BCD', brand: 'Mercedes-Benz', model: 'C200', category: 'Luxury', status: 'RENTED' },
];

const mockBookings: MockBooking[] = [
  { id: 'b1', bookingNumber: 'BK-2026001', carId: 'c1', customerName: 'Budi Santoso', customerPhone: '081234567890', startDate: today.subtract(2, 'day').format('YYYY-MM-DD'), endDate: today.add(3, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 1750000, withDriver: true, driverName: 'Pak Agus' },
  { id: 'b2', bookingNumber: 'BK-2026002', carId: 'c2', customerName: 'Siti Rahayu', customerPhone: '081298765432', startDate: today.add(1, 'day').format('YYYY-MM-DD'), endDate: today.add(5, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 3000000, withDriver: false },
  { id: 'b3', bookingNumber: 'BK-2026003', carId: 'c4', customerName: 'Ahmad Hidayat', customerPhone: '085612345678', startDate: today.subtract(5, 'day').format('YYYY-MM-DD'), endDate: today.subtract(1, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 2250000, withDriver: true, driverName: 'Pak Roni' },
  { id: 'b4', bookingNumber: 'BK-2026004', carId: 'c4', customerName: 'Dewi Lestari', customerPhone: '087812345678', startDate: today.add(2, 'day').format('YYYY-MM-DD'), endDate: today.add(8, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 3150000, withDriver: false },
  { id: 'b5', bookingNumber: 'BK-2026005', carId: 'c7', customerName: 'Rudi Hartono', customerPhone: '081345678901', startDate: today.subtract(1, 'day').format('YYYY-MM-DD'), endDate: today.add(2, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 900000, withDriver: false },
  { id: 'b6', bookingNumber: 'BK-2026006', carId: 'c8', customerName: 'Rina Wati', customerPhone: '089912345678', startDate: today.add(4, 'day').format('YYYY-MM-DD'), endDate: today.add(10, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 4200000, withDriver: true, driverName: 'Pak Dedi' },
  { id: 'b7', bookingNumber: 'BK-2026007', carId: 'c10', customerName: 'Joko Prasetyo', customerPhone: '081567890123', startDate: today.subtract(3, 'day').format('YYYY-MM-DD'), endDate: today.add(1, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 6000000, withDriver: true, driverName: 'Pak Hendra' },
  { id: 'b8', bookingNumber: 'BK-2026008', carId: 'c3', customerName: 'Maya Sari', customerPhone: '082345678901', startDate: today.add(6, 'day').format('YYYY-MM-DD'), endDate: today.add(9, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 2800000, withDriver: false },
  { id: 'b9', bookingNumber: 'BK-2026009', carId: 'c5', customerName: 'Agus Pratama', customerPhone: '081678901234', startDate: today.subtract(7, 'day').format('YYYY-MM-DD'), endDate: today.subtract(4, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 1050000, withDriver: false },
  { id: 'b10', bookingNumber: 'BK-2026010', carId: 'c9', customerName: 'Linda Susanti', customerPhone: '085678901234', startDate: today.add(3, 'day').format('YYYY-MM-DD'), endDate: today.add(7, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 5000000, withDriver: true, driverName: 'Pak Bimo' },
  { id: 'b11', bookingNumber: 'BK-2026011', carId: 'c1', customerName: 'Firman Nugroho', customerPhone: '081890123456', startDate: today.add(5, 'day').format('YYYY-MM-DD'), endDate: today.add(9, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 1400000, withDriver: false },
  { id: 'b12', bookingNumber: 'BK-2026012', carId: 'c2', customerName: 'Diana Putri', customerPhone: '082190123456', startDate: today.subtract(6, 'day').format('YYYY-MM-DD'), endDate: today.subtract(3, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 1800000, withDriver: false },
  { id: 'b13', bookingNumber: 'BK-2026013', carId: 'c5', customerName: 'Hendra Wijaya', customerPhone: '087890123456', startDate: today.add(1, 'day').format('YYYY-MM-DD'), endDate: today.add(4, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 1050000, withDriver: true, driverName: 'Pak Surya' },
  { id: 'b14', bookingNumber: 'BK-2026014', carId: 'c6', customerName: 'Ratna Dewi', customerPhone: '081901234567', startDate: today.subtract(4, 'day').format('YYYY-MM-DD'), endDate: today.subtract(2, 'day').format('YYYY-MM-DD'), status: 'CANCELLED', totalAmount: 750000, withDriver: false, notes: 'Customer membatalkan karena perubahan jadwal' },
];

// --- Styles ---

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  ONGOING: { color: '#389e0d', bg: '#f6ffed', label: 'Aktif' },
  CONFIRMED: { color: '#096dd9', bg: '#e6f7ff', label: 'Dikonfirmasi' },
  PENDING: { color: '#d48806', bg: '#fffbe6', label: 'Pending' },
  COMPLETED: { color: '#595959', bg: '#f5f5f5', label: 'Selesai' },
  CANCELLED: { color: '#cf1322', bg: '#fff1f0', label: 'Dibatalkan' },
};

const CELL_WIDTH = 48;
const CAR_COL_WIDTH = 220;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 44;

const SchedulingPage: React.FC = () => {
  const [rangeSize, setRangeSize] = useState<number>(14);
  const [startDate, setStartDate] = useState<Dayjs>(today.subtract(3, 'day'));
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dateRange = useMemo(() => {
    return Array.from({ length: rangeSize }, (_, i) => startDate.add(i, 'day'));
  }, [startDate, rangeSize]);

  const todayIndex = useMemo(() => {
    return dateRange.findIndex((d) => d.isSame(today, 'day'));
  }, [dateRange]);

  const getBookingsForCar = (carId: string) => {
    return mockBookings.filter((b) => b.carId === carId);
  };

  const getBookingBlockStyle = (booking: MockBooking): React.CSSProperties | null => {
    const bStart = dayjs(booking.startDate);
    const bEnd = dayjs(booking.endDate);
    const rangeStart = dateRange[0];
    const rangeEnd = dateRange[dateRange.length - 1];

    if (bEnd.isBefore(rangeStart, 'day') || bStart.isAfter(rangeEnd, 'day')) {
      return null;
    }

    const clampedStart = bStart.isBefore(rangeStart, 'day') ? rangeStart : bStart;
    const clampedEnd = bEnd.isAfter(rangeEnd, 'day') ? rangeEnd : bEnd;

    const startIdx = clampedStart.diff(rangeStart, 'day');
    const span = clampedEnd.diff(clampedStart, 'day') + 1;

    const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;

    return {
      position: 'absolute',
      left: startIdx * CELL_WIDTH + 4,
      top: 6,
      width: span * CELL_WIDTH - 8,
      height: ROW_HEIGHT - 12,
      backgroundColor: config.bg,
      border: `1px solid ${config.color}`,
      borderRadius: 6,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 8,
      paddingRight: 8,
      overflow: 'hidden',
      whiteSpace: 'nowrap' as const,
      transition: 'box-shadow 0.2s, transform 0.15s',
      zIndex: 2,
    };
  };

  const handleBlockClick = (booking: MockBooking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleBlockHover = (e: React.MouseEvent, entering: boolean) => {
    const el = e.currentTarget as HTMLElement;
    if (entering) {
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      el.style.transform = 'translateY(-1px)';
      el.style.zIndex = '5';
    } else {
      el.style.boxShadow = 'none';
      el.style.transform = 'none';
      el.style.zIndex = '2';
    }
  };

  // Summary stats
  const carsInUseToday = mockCars.filter((car) =>
    mockBookings.some(
      (b) =>
        b.carId === car.id &&
        (b.status === 'ONGOING' || b.status === 'CONFIRMED') &&
        dayjs(b.startDate).isSameOrBefore(today, 'day') &&
        dayjs(b.endDate).isSameOrAfter(today, 'day')
    )
  ).length;
  const maintenanceCars = mockCars.filter((c) => c.status === 'MAINTENANCE').length;
  const availableCars = mockCars.length - carsInUseToday - maintenanceCars;

  const summaryCards = [
    { label: 'Total Mobil', value: mockCars.length, icon: <CarOutlined />, color: '#1677ff' },
    { label: 'Terpakai Hari Ini', value: carsInUseToday, icon: <CheckCircleOutlined />, color: '#389e0d' },
    { label: 'Tersedia', value: availableCars, icon: <ClockCircleOutlined />, color: '#d48806' },
    { label: 'Dalam Maintenance', value: maintenanceCars, icon: <ToolOutlined />, color: '#cf1322' },
  ];

  return (
    <div>
      <PageHeader
        title="Scheduling"
        subtitle="Timeline booking per kendaraan"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Scheduling' }]}
      />

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {summaryCards.map((item) => (
          <Col xs={12} sm={6} key={item.label}>
            <Card
              size="small"
              style={{
                borderRadius: 8,
                borderLeft: `3px solid ${item.color}`,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, color: item.color }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: 1.3 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: '#262626', lineHeight: 1.3 }}>{item.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Controls */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space size={12}>
            <Text strong style={{ fontSize: 13, color: '#595959' }}>Mulai dari:</Text>
            <DatePicker
              value={startDate}
              onChange={(date) => date && setStartDate(date)}
              format="DD MMM YYYY"
              allowClear={false}
              style={{ width: 160 }}
            />
            <Text strong style={{ fontSize: 13, color: '#595959' }}>Tampilkan:</Text>
            <Segmented
              value={rangeSize}
              onChange={(val) => setRangeSize(val as number)}
              options={[
                { label: '7 Hari', value: 7 },
                { label: '14 Hari', value: 14 },
                { label: '30 Hari', value: 30 },
              ]}
            />
          </Space>

          {/* Legend */}
          <Space size={4} wrap>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <Tag
                key={key}
                style={{
                  backgroundColor: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}`,
                  borderRadius: 4,
                  fontSize: 11,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {cfg.label}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* Timeline Grid */}
      <Card
        style={{ borderRadius: 8, overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          {/* Car Column (sticky) */}
          <div
            style={{
              width: CAR_COL_WIDTH,
              minWidth: CAR_COL_WIDTH,
              flexShrink: 0,
              borderRight: '2px solid #e8e8e8',
              background: '#fafafa',
              zIndex: 10,
            }}
          >
            {/* Header */}
            <div
              style={{
                height: HEADER_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                fontWeight: 600,
                fontSize: 13,
                color: '#262626',
                borderBottom: '2px solid #e8e8e8',
                background: '#fafafa',
              }}
            >
              Kendaraan
            </div>
            {/* Car rows */}
            {mockCars.map((car, idx) => (
              <div
                key={car.id}
                style={{
                  height: ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  borderBottom: '1px solid #f0f0f0',
                  background: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#262626', lineHeight: 1.4 }}>
                    {car.plateNumber}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.3 }}>
                    {car.brand} {car.model}
                  </div>
                </div>
                {car.status === 'MAINTENANCE' && (
                  <Badge
                    count={<ToolOutlined style={{ color: '#cf1322', fontSize: 10 }} />}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Scrollable Timeline Area */}
          <div
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ minWidth: dateRange.length * CELL_WIDTH, position: 'relative' }}>
              {/* Date Header */}
              <div style={{ display: 'flex', borderBottom: '2px solid #e8e8e8', background: '#fafafa' }}>
                {dateRange.map((date, idx) => {
                  const isToday = date.isSame(today, 'day');
                  const isSunday = date.day() === 0;
                  const isSaturday = date.day() === 6;
                  return (
                    <div
                      key={idx}
                      style={{
                        width: CELL_WIDTH,
                        minWidth: CELL_WIDTH,
                        height: HEADER_HEIGHT,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid #f0f0f0',
                        background: isToday ? '#e6f7ff' : isSunday ? '#fff7f7' : isSaturday ? '#f9f9ff' : '#fafafa',
                        lineHeight: 1.2,
                      }}
                    >
                      <span style={{ fontSize: 10, color: isToday ? '#096dd9' : isSunday ? '#cf1322' : '#8c8c8c', fontWeight: isToday ? 600 : 400 }}>
                        {date.format('ddd')}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? '#096dd9' : isSunday ? '#cf1322' : '#262626' }}>
                        {date.format('D')}
                      </span>
                      {idx === 0 || date.date() === 1 ? (
                        <span style={{ fontSize: 9, color: '#8c8c8c', marginTop: -2 }}>{date.format('MMM')}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Car rows with bookings */}
              {mockCars.map((car, rowIdx) => {
                const carBookings = getBookingsForCar(car.id);
                return (
                  <div
                    key={car.id}
                    style={{
                      position: 'relative',
                      height: ROW_HEIGHT,
                      borderBottom: '1px solid #f0f0f0',
                      background: rowIdx % 2 === 0 ? '#ffffff' : '#fafbfc',
                    }}
                  >
                    {/* Cell borders */}
                    {dateRange.map((date, idx) => {
                      const isToday = date.isSame(today, 'day');
                      const isSunday = date.day() === 0;
                      const isSaturday = date.day() === 6;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: idx * CELL_WIDTH,
                            top: 0,
                            width: CELL_WIDTH,
                            height: ROW_HEIGHT,
                            borderRight: '1px solid #f0f0f0',
                            background: isSunday
                              ? 'rgba(255,240,240,0.3)'
                              : isSaturday
                              ? 'rgba(240,240,255,0.3)'
                              : 'transparent',
                          }}
                        />
                      );
                    })}

                    {/* Booking blocks */}
                    {carBookings.map((booking) => {
                      const style = getBookingBlockStyle(booking);
                      if (!style) return null;
                      const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;
                      const bStart = dayjs(booking.startDate);
                      const bEnd = dayjs(booking.endDate);
                      const duration = bEnd.diff(bStart, 'day') + 1;
                      return (
                        <Tooltip
                          key={booking.id}
                          title={
                            <div style={{ fontSize: 12 }}>
                              <div style={{ fontWeight: 600, marginBottom: 2 }}>{booking.bookingNumber}</div>
                              <div>{booking.customerName}</div>
                              <div>{bStart.format('DD MMM')} - {bEnd.format('DD MMM YYYY')} ({duration} hari)</div>
                              <div>Rp {booking.totalAmount.toLocaleString('id-ID')}</div>
                            </div>
                          }
                          placement="top"
                          mouseEnterDelay={0.3}
                        >
                          <div
                            style={style}
                            onClick={() => handleBlockClick(booking)}
                            onMouseEnter={(e) => handleBlockHover(e, true)}
                            onMouseLeave={(e) => handleBlockHover(e, false)}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: config.color,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {booking.customerName}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })}

              {/* Today vertical line */}
              {todayIndex >= 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: todayIndex * CELL_WIDTH + CELL_WIDTH / 2,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#1677ff',
                    zIndex: 8,
                    pointerEvents: 'none',
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Detail Drawer */}
      <Drawer
        title={
          selectedBooking ? (
            <Space>
              <CalendarOutlined />
              <span>Detail Booking {selectedBooking.bookingNumber}</span>
            </Space>
          ) : 'Detail Booking'
        }
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedBooking(null);
        }}
      >
        {selectedBooking && (() => {
          const car = mockCars.find((c) => c.id === selectedBooking.carId);
          const config = STATUS_CONFIG[selectedBooking.status] || STATUS_CONFIG.COMPLETED;
          const bStart = dayjs(selectedBooking.startDate);
          const bEnd = dayjs(selectedBooking.endDate);
          const duration = bEnd.diff(bStart, 'day') + 1;

          return (
            <div>
              <div style={{ marginBottom: 20 }}>
                <Tag
                  style={{
                    backgroundColor: config.bg,
                    color: config.color,
                    border: `1px solid ${config.color}`,
                    borderRadius: 4,
                    fontWeight: 500,
                    fontSize: 13,
                    padding: '2px 12px',
                  }}
                >
                  {config.label}
                </Tag>
              </div>

              <Descriptions
                column={1}
                size="small"
                labelStyle={{ color: '#8c8c8c', fontSize: 13, width: 130 }}
                contentStyle={{ fontWeight: 500, fontSize: 13 }}
              >
                <Descriptions.Item label="No. Booking">{selectedBooking.bookingNumber}</Descriptions.Item>
                <Descriptions.Item label="Customer">
                  <Space direction="vertical" size={0}>
                    <span><UserOutlined style={{ marginRight: 4 }} />{selectedBooking.customerName}</span>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}><PhoneOutlined style={{ marginRight: 4 }} />{selectedBooking.customerPhone}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Kendaraan">
                  {car ? (
                    <Space direction="vertical" size={0}>
                      <span>{car.brand} {car.model}</span>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{car.plateNumber}</span>
                    </Space>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Tanggal Mulai">{bStart.format('DD MMMM YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Tanggal Selesai">{bEnd.format('DD MMMM YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Durasi">{duration} hari</Descriptions.Item>
                <Descriptions.Item label="Dengan Driver">
                  {selectedBooking.withDriver ? (
                    <span>Ya - {selectedBooking.driverName}</span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>Tidak (Lepas Kunci)</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>
                    Rp {selectedBooking.totalAmount.toLocaleString('id-ID')}
                  </span>
                </Descriptions.Item>
              </Descriptions>

              {selectedBooking.notes && (
                <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Catatan:</Text>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{selectedBooking.notes}</div>
                </div>
              )}
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default SchedulingPage;
