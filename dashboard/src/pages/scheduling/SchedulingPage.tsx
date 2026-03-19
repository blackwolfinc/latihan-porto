import React, { useState, useMemo } from 'react';
import {
  Card,
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
  Divider,
  Button,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import PageHeader from '@/components/shared/PageHeader';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { Text } = Typography;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FleetVehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  category: string;
  imageColor: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
}

interface BookingEntry {
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
  pickupLocation?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const today = dayjs();

const vehicles: FleetVehicle[] = [
  { id: 'c1', plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza', category: 'MPV', imageColor: '#e6f4ff', status: 'RENTED' },
  { id: 'c2', plateNumber: 'B 5678 DEF', brand: 'Honda', model: 'CR-V', category: 'SUV', imageColor: '#f0f5ff', status: 'RENTED' },
  { id: 'c3', plateNumber: 'B 9012 GHI', brand: 'Mitsubishi', model: 'Pajero Sport', category: 'SUV', imageColor: '#f9f0ff', status: 'AVAILABLE' },
  { id: 'c4', plateNumber: 'B 3456 JKL', brand: 'Toyota', model: 'Innova Zenix', category: 'MPV', imageColor: '#e6fffb', status: 'RENTED' },
  { id: 'c5', plateNumber: 'B 7890 MNO', brand: 'Suzuki', model: 'Ertiga', category: 'MPV', imageColor: '#fff7e6', status: 'AVAILABLE' },
  { id: 'c6', plateNumber: 'B 2345 PQR', brand: 'Daihatsu', model: 'Xenia', category: 'MPV', imageColor: '#fff1f0', status: 'MAINTENANCE' },
  { id: 'c7', plateNumber: 'B 6789 STU', brand: 'Honda', model: 'Brio', category: 'Hatchback', imageColor: '#fcffe6', status: 'RENTED' },
  { id: 'c8', plateNumber: 'B 1357 VWX', brand: 'Toyota', model: 'Fortuner', category: 'SUV', imageColor: '#e6fffb', status: 'RENTED' },
  { id: 'c9', plateNumber: 'B 2468 YZA', brand: 'BMW', model: 'X3', category: 'Luxury', imageColor: '#f0f5ff', status: 'AVAILABLE' },
  { id: 'c10', plateNumber: 'B 1122 BCD', brand: 'Mercedes-Benz', model: 'C200', category: 'Luxury', imageColor: '#f9f0ff', status: 'RENTED' },
];

const bookings: BookingEntry[] = [
  { id: 'b1', bookingNumber: 'BK-2026001', carId: 'c1', customerName: 'Budi Santoso', customerPhone: '0812-3456-7890', startDate: today.subtract(2, 'day').format('YYYY-MM-DD'), endDate: today.add(3, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 1750000, withDriver: true, driverName: 'Pak Agus', pickupLocation: 'Bandara Soekarno-Hatta' },
  { id: 'b2', bookingNumber: 'BK-2026002', carId: 'c2', customerName: 'Siti Rahayu', customerPhone: '0812-9876-5432', startDate: today.add(1, 'day').format('YYYY-MM-DD'), endDate: today.add(5, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 3000000, withDriver: false, pickupLocation: 'Kantor Pusat' },
  { id: 'b3', bookingNumber: 'BK-2026003', carId: 'c4', customerName: 'Ahmad Hidayat', customerPhone: '0856-1234-5678', startDate: today.subtract(5, 'day').format('YYYY-MM-DD'), endDate: today.subtract(1, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 2250000, withDriver: true, driverName: 'Pak Roni' },
  { id: 'b4', bookingNumber: 'BK-2026004', carId: 'c4', customerName: 'Dewi Lestari', customerPhone: '0878-1234-5678', startDate: today.add(2, 'day').format('YYYY-MM-DD'), endDate: today.add(8, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 3150000, withDriver: false },
  { id: 'b5', bookingNumber: 'BK-2026005', carId: 'c7', customerName: 'Rudi Hartono', customerPhone: '0813-4567-8901', startDate: today.subtract(1, 'day').format('YYYY-MM-DD'), endDate: today.add(2, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 900000, withDriver: false, pickupLocation: 'Stasiun Gambir' },
  { id: 'b6', bookingNumber: 'BK-2026006', carId: 'c8', customerName: 'Rina Wati', customerPhone: '0899-1234-5678', startDate: today.add(4, 'day').format('YYYY-MM-DD'), endDate: today.add(10, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 4200000, withDriver: true, driverName: 'Pak Dedi' },
  { id: 'b7', bookingNumber: 'BK-2026007', carId: 'c10', customerName: 'Joko Prasetyo', customerPhone: '0815-6789-0123', startDate: today.subtract(3, 'day').format('YYYY-MM-DD'), endDate: today.add(1, 'day').format('YYYY-MM-DD'), status: 'ONGOING', totalAmount: 6000000, withDriver: true, driverName: 'Pak Hendra', pickupLocation: 'Hotel Grand Hyatt' },
  { id: 'b8', bookingNumber: 'BK-2026008', carId: 'c3', customerName: 'Maya Sari', customerPhone: '0823-4567-8901', startDate: today.add(6, 'day').format('YYYY-MM-DD'), endDate: today.add(9, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 2800000, withDriver: false },
  { id: 'b9', bookingNumber: 'BK-2026009', carId: 'c5', customerName: 'Agus Pratama', customerPhone: '0816-7890-1234', startDate: today.subtract(7, 'day').format('YYYY-MM-DD'), endDate: today.subtract(4, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 1050000, withDriver: false },
  { id: 'b10', bookingNumber: 'BK-2026010', carId: 'c9', customerName: 'Linda Susanti', customerPhone: '0856-7890-1234', startDate: today.add(3, 'day').format('YYYY-MM-DD'), endDate: today.add(7, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 5000000, withDriver: true, driverName: 'Pak Bimo', pickupLocation: 'Bandara Halim' },
  { id: 'b11', bookingNumber: 'BK-2026011', carId: 'c1', customerName: 'Firman Nugroho', customerPhone: '0818-9012-3456', startDate: today.add(5, 'day').format('YYYY-MM-DD'), endDate: today.add(9, 'day').format('YYYY-MM-DD'), status: 'CONFIRMED', totalAmount: 1400000, withDriver: false },
  { id: 'b12', bookingNumber: 'BK-2026012', carId: 'c2', customerName: 'Diana Putri', customerPhone: '0821-9012-3456', startDate: today.subtract(6, 'day').format('YYYY-MM-DD'), endDate: today.subtract(3, 'day').format('YYYY-MM-DD'), status: 'COMPLETED', totalAmount: 1800000, withDriver: false },
  { id: 'b13', bookingNumber: 'BK-2026013', carId: 'c5', customerName: 'Hendra Wijaya', customerPhone: '0878-9012-3456', startDate: today.add(1, 'day').format('YYYY-MM-DD'), endDate: today.add(4, 'day').format('YYYY-MM-DD'), status: 'PENDING', totalAmount: 1050000, withDriver: true, driverName: 'Pak Surya' },
  { id: 'b14', bookingNumber: 'BK-2026014', carId: 'c6', customerName: 'Ratna Dewi', customerPhone: '0819-0123-4567', startDate: today.subtract(4, 'day').format('YYYY-MM-DD'), endDate: today.subtract(2, 'day').format('YYYY-MM-DD'), status: 'CANCELLED', totalAmount: 750000, withDriver: false, notes: 'Customer membatalkan karena perubahan jadwal' },
];

/* ------------------------------------------------------------------ */
/*  Status palette                                                     */
/* ------------------------------------------------------------------ */

const STATUS_PALETTE: Record<string, { fill: string; border: string; text: string; label: string }> = {
  ONGOING:   { fill: '#e8f5e9', border: '#66bb6a', text: '#2e7d32', label: 'Aktif' },
  CONFIRMED: { fill: '#e3f2fd', border: '#42a5f5', text: '#1565c0', label: 'Dikonfirmasi' },
  PENDING:   { fill: '#fff8e1', border: '#ffca28', text: '#f57f17', label: 'Pending' },
  COMPLETED: { fill: '#f5f5f5', border: '#bdbdbd', text: '#616161', label: 'Selesai' },
  CANCELLED: { fill: '#fce4ec', border: '#ef9a9a', text: '#c62828', label: 'Dibatalkan' },
};

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const COL_W = 52;
const SIDEBAR_W = 240;
const ROW_H = 56;
const HDR_H = 48;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SchedulingPage: React.FC = () => {
  const [rangeSize, setRangeSize] = useState<number>(14);
  const [startDate, setStartDate] = useState<Dayjs>(today.subtract(3, 'day'));
  const [selectedBooking, setSelectedBooking] = useState<BookingEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* derived ------------------------------------------------------- */

  const dates = useMemo(
    () => Array.from({ length: rangeSize }, (_, i) => startDate.add(i, 'day')),
    [startDate, rangeSize],
  );

  const todayIdx = useMemo(
    () => dates.findIndex((d) => d.isSame(today, 'day')),
    [dates],
  );

  /* helpers ------------------------------------------------------- */

  const bookingsFor = (carId: string) => bookings.filter((b) => b.carId === carId);

  const blockPosition = (b: BookingEntry) => {
    const bS = dayjs(b.startDate);
    const bE = dayjs(b.endDate);
    const rS = dates[0];
    const rE = dates[dates.length - 1];
    if (bE.isBefore(rS, 'day') || bS.isAfter(rE, 'day')) return null;
    const cS = bS.isBefore(rS, 'day') ? rS : bS;
    const cE = bE.isAfter(rE, 'day') ? rE : bE;
    const left = cS.diff(rS, 'day');
    const span = cE.diff(cS, 'day') + 1;
    return { left, span };
  };

  const shiftDates = (dir: number) => setStartDate((d) => d.add(dir * rangeSize, 'day'));

  /* summary stats ------------------------------------------------- */

  const activeToday = vehicles.filter((v) =>
    bookings.some(
      (b) =>
        b.carId === v.id &&
        (b.status === 'ONGOING' || b.status === 'CONFIRMED') &&
        dayjs(b.startDate).isSameOrBefore(today, 'day') &&
        dayjs(b.endDate).isSameOrAfter(today, 'day'),
    ),
  ).length;

  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const availableCount = vehicles.length - activeToday - maintenanceCount;

  const stats = [
    { label: 'Total Armada', value: vehicles.length, icon: <CarOutlined />, color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Terpakai Hari Ini', value: activeToday, icon: <CheckCircleOutlined />, color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Tersedia', value: availableCount, icon: <ClockCircleOutlined />, color: '#e65100', bg: '#fff3e0' },
    { label: 'Dalam Maintenance', value: maintenanceCount, icon: <ToolOutlined />, color: '#c62828', bg: '#fce4ec' },
  ];

  /* render -------------------------------------------------------- */

  return (
    <div>
      <PageHeader
        title="Scheduling"
        subtitle="Timeline booking kendaraan - Caritahub Rental"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Scheduling' }]}
      />

      {/* KPI row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <Card
              size="small"
              style={{ borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '14px 18px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: s.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: s.color,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#78909c', fontWeight: 500, letterSpacing: 0.2 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#263238', lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Controls bar */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 10, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: '10px 18px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space size={12} wrap>
            <Button icon={<LeftOutlined />} size="small" onClick={() => shiftDates(-1)} />
            <DatePicker
              value={startDate}
              onChange={(d) => d && setStartDate(d)}
              format="DD MMM YYYY"
              allowClear={false}
              style={{ width: 152 }}
              size="middle"
            />
            <Button icon={<RightOutlined />} size="small" onClick={() => shiftDates(1)} />
            <Divider type="vertical" style={{ height: 24 }} />
            <Segmented
              value={rangeSize}
              onChange={(v) => setRangeSize(v as number)}
              options={[
                { label: '7 Hari', value: 7 },
                { label: '14 Hari', value: 14 },
                { label: '30 Hari', value: 30 },
              ]}
              size="middle"
            />
            <Button
              size="small"
              type="link"
              onClick={() => setStartDate(today.subtract(3, 'day'))}
              style={{ padding: 0, fontSize: 13 }}
            >
              Hari Ini
            </Button>
          </Space>

          {/* Legend */}
          <Space size={6} wrap>
            {Object.values(STATUS_PALETTE).map((p) => (
              <Tag
                key={p.label}
                style={{
                  background: p.fill,
                  color: p.text,
                  border: `1px solid ${p.border}`,
                  borderRadius: 4,
                  fontSize: 11,
                  lineHeight: '20px',
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {p.label}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* ============ GANTT GRID ============ */}
      <Card
        style={{
          borderRadius: 10,
          border: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', overflow: 'hidden' }}>

          {/* --- Sidebar: vehicle list --- */}
          <div
            style={{
              width: SIDEBAR_W,
              minWidth: SIDEBAR_W,
              flexShrink: 0,
              borderRight: '1px solid #e0e0e0',
              background: '#fafbfc',
              zIndex: 10,
            }}
          >
            {/* header cell */}
            <div
              style={{
                height: HDR_H,
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
                fontWeight: 600,
                fontSize: 13,
                color: '#37474f',
                borderBottom: '1px solid #e0e0e0',
                background: '#f5f6f8',
                letterSpacing: 0.3,
              }}
            >
              <CarOutlined style={{ marginRight: 8, fontSize: 14 }} />
              Kendaraan
            </div>

            {vehicles.map((v, i) => (
              <div
                key={v.id}
                style={{
                  height: ROW_H,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 18px',
                  borderBottom: '1px solid #f0f0f0',
                  background: i % 2 === 0 ? '#fff' : '#fafbfc',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: v.imageColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    color: '#546e7a',
                    flexShrink: 0,
                  }}
                >
                  <CarOutlined />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#263238', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.plateNumber}
                  </div>
                  <div style={{ fontSize: 11, color: '#78909c', lineHeight: 1.3 }}>
                    {v.brand} {v.model}
                  </div>
                </div>
                {v.status === 'MAINTENANCE' && (
                  <Tooltip title="Dalam maintenance">
                    <Badge count={<ToolOutlined style={{ color: '#c62828', fontSize: 11 }} />} />
                  </Tooltip>
                )}
              </div>
            ))}
          </div>

          {/* --- Scrollable timeline area --- */}
          <div
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ minWidth: dates.length * COL_W, position: 'relative' }}>

              {/* date header row */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#f5f6f8' }}>
                {dates.map((d, idx) => {
                  const isToday = d.isSame(today, 'day');
                  const isSun = d.day() === 0;
                  const isSat = d.day() === 6;
                  let bg = '#f5f6f8';
                  if (isToday) bg = '#e3f2fd';
                  else if (isSun) bg = '#fce4ec';
                  else if (isSat) bg = '#ede7f6';

                  return (
                    <div
                      key={idx}
                      style={{
                        width: COL_W,
                        minWidth: COL_W,
                        height: HDR_H,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid #eeeeee',
                        background: bg,
                        lineHeight: 1.15,
                        userSelect: 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#1565c0' : isSun ? '#c62828' : '#90a4ae',
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        {d.format('ddd')}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isToday ? 800 : 600,
                          color: isToday ? '#1565c0' : isSun ? '#c62828' : '#37474f',
                        }}
                      >
                        {d.format('D')}
                      </span>
                      {(idx === 0 || d.date() === 1) && (
                        <span style={{ fontSize: 9, color: '#90a4ae', marginTop: -1 }}>{d.format('MMM')}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* vehicle rows */}
              {vehicles.map((v, rowIdx) => {
                const carBookings = bookingsFor(v.id);
                return (
                  <div
                    key={v.id}
                    style={{
                      position: 'relative',
                      height: ROW_H,
                      borderBottom: '1px solid #f0f0f0',
                      background: rowIdx % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                  >
                    {/* cell grid lines + weekend shading */}
                    {dates.map((d, idx) => {
                      const isSun = d.day() === 0;
                      const isSat = d.day() === 6;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: idx * COL_W,
                            top: 0,
                            width: COL_W,
                            height: ROW_H,
                            borderRight: '1px solid #f5f5f5',
                            background: isSun
                              ? 'rgba(252,228,236,0.18)'
                              : isSat
                              ? 'rgba(237,231,246,0.18)'
                              : 'transparent',
                          }}
                        />
                      );
                    })}

                    {/* booking blocks */}
                    {carBookings.map((b) => {
                      const pos = blockPosition(b);
                      if (!pos) return null;
                      const palette = STATUS_PALETTE[b.status] || STATUS_PALETTE.COMPLETED;
                      const bStart = dayjs(b.startDate);
                      const bEnd = dayjs(b.endDate);
                      const days = bEnd.diff(bStart, 'day') + 1;

                      return (
                        <Tooltip
                          key={b.id}
                          placement="top"
                          mouseEnterDelay={0.25}
                          title={
                            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>{b.bookingNumber}</div>
                              <div>{b.customerName}</div>
                              <div>
                                {bStart.format('DD MMM')} &ndash; {bEnd.format('DD MMM YYYY')} ({days} hari)
                              </div>
                              <div style={{ fontWeight: 600 }}>Rp {b.totalAmount.toLocaleString('id-ID')}</div>
                            </div>
                          }
                        >
                          <div
                            onClick={() => {
                              setSelectedBooking(b);
                              setDrawerOpen(true);
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.boxShadow = `0 2px 8px ${palette.border}66`;
                              el.style.transform = 'translateY(-1px)';
                              el.style.zIndex = '6';
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.boxShadow = 'none';
                              el.style.transform = 'none';
                              el.style.zIndex = '3';
                            }}
                            style={{
                              position: 'absolute',
                              left: pos.left * COL_W + 3,
                              top: 8,
                              width: pos.span * COL_W - 6,
                              height: ROW_H - 16,
                              background: palette.fill,
                              border: `1.5px solid ${palette.border}`,
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 10,
                              paddingRight: 6,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                              zIndex: 3,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: palette.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                letterSpacing: 0.1,
                              }}
                            >
                              {b.customerName}
                            </span>
                            {b.withDriver && (
                              <UserOutlined
                                style={{
                                  marginLeft: 'auto',
                                  fontSize: 10,
                                  color: palette.text,
                                  opacity: 0.6,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })}

              {/* Today marker line */}
              {todayIdx >= 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: todayIdx * COL_W + COL_W / 2 - 1,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#1565c0',
                    zIndex: 8,
                    pointerEvents: 'none',
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ============ DETAIL DRAWER ============ */}
      <Drawer
        title={null}
        placement="right"
        width={440}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedBooking(null);
        }}
        styles={{
          header: { borderBottom: 'none', padding: '20px 24px 0' },
          body: { padding: '16px 24px 24px' },
        }}
      >
        {selectedBooking && (() => {
          const car = vehicles.find((v) => v.id === selectedBooking.carId);
          const palette = STATUS_PALETTE[selectedBooking.status] || STATUS_PALETTE.COMPLETED;
          const bStart = dayjs(selectedBooking.startDate);
          const bEnd = dayjs(selectedBooking.endDate);
          const duration = bEnd.diff(bStart, 'day') + 1;

          return (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <CalendarOutlined style={{ fontSize: 18, color: '#546e7a' }} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#263238' }}>
                    {selectedBooking.bookingNumber}
                  </span>
                </div>
                <Tag
                  style={{
                    background: palette.fill,
                    color: palette.text,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '2px 12px',
                  }}
                >
                  {palette.label}
                </Tag>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Descriptions
                column={1}
                size="small"
                labelStyle={{ color: '#78909c', fontSize: 13, width: 130, paddingBottom: 10 }}
                contentStyle={{ fontWeight: 500, fontSize: 13, color: '#263238', paddingBottom: 10 }}
              >
                <Descriptions.Item
                  label={<span><UserOutlined style={{ marginRight: 6 }} />Customer</span>}
                >
                  <div>
                    <div>{selectedBooking.customerName}</div>
                    <div style={{ fontSize: 12, color: '#78909c', marginTop: 2 }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {selectedBooking.customerPhone}
                    </div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<span><CarOutlined style={{ marginRight: 6 }} />Kendaraan</span>}
                >
                  {car ? (
                    <div>
                      <div>{car.brand} {car.model}</div>
                      <div style={{ fontSize: 12, color: '#78909c', marginTop: 2 }}>{car.plateNumber} &middot; {car.category}</div>
                    </div>
                  ) : '-'}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<span><CalendarOutlined style={{ marginRight: 6 }} />Periode</span>}
                >
                  <div>
                    <div>{bStart.format('DD MMM YYYY')} &ndash; {bEnd.format('DD MMM YYYY')}</div>
                    <div style={{ fontSize: 12, color: '#78909c', marginTop: 2 }}>{duration} hari</div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<span><InfoCircleOutlined style={{ marginRight: 6 }} />Driver</span>}
                >
                  {selectedBooking.withDriver ? (
                    <span>{selectedBooking.driverName}</span>
                  ) : (
                    <span style={{ color: '#90a4ae' }}>Lepas Kunci</span>
                  )}
                </Descriptions.Item>

                {selectedBooking.pickupLocation && (
                  <Descriptions.Item
                    label={<span><InfoCircleOutlined style={{ marginRight: 6 }} />Pickup</span>}
                  >
                    {selectedBooking.pickupLocation}
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label={<span><DollarOutlined style={{ marginRight: 6 }} />Total</span>}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#263238' }}>
                    Rp {selectedBooking.totalAmount.toLocaleString('id-ID')}
                  </span>
                </Descriptions.Item>
              </Descriptions>

              {selectedBooking.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: '#f5f5f5',
                    borderRadius: 8,
                    borderLeft: '3px solid #bdbdbd',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#78909c', display: 'block', marginBottom: 4 }}>Catatan</Text>
                  <Text style={{ fontSize: 13, color: '#37474f' }}>{selectedBooking.notes}</Text>
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
