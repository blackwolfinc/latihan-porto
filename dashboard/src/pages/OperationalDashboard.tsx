import React from 'react';
import {
  Card, Row, Col, Typography, Table, Tag, Button, Space, Alert,
  Timeline, Statistic, Avatar, Progress, List, Tooltip,
} from 'antd';
import {
  CarOutlined, UserOutlined, CalendarOutlined, WarningOutlined,
  ClockCircleOutlined, CheckCircleOutlined, PhoneOutlined,
  EnvironmentOutlined, ArrowRightOutlined, BellOutlined,
  DashboardOutlined, SwapOutlined, ToolOutlined,
  PlusOutlined, FileTextOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// ─── Mock Data ───────────────────────────────────────────────────────────────

const todayStats = {
  bookings: 6,
  pickups: 3,
  returns: 2,
  issues: 3,
};

const urgentAlerts = [
  {
    id: 1,
    type: 'error' as const,
    message: '2 mobil belum dikembalikan (overdue)',
    description:
      'Toyota Avanza B 1234 ABC (Pak Budi) terlambat 1 hari — Honda Brio B 7890 MNO (Bu Rina) terlambat 2 hari',
  },
  {
    id: 2,
    type: 'warning' as const,
    message: 'STNK B 5678 DEF akan expired dalam 5 hari',
    description: 'Honda Jazz milik armada cabang Jakarta Selatan. Segera perpanjang.',
  },
  {
    id: 3,
    type: 'warning' as const,
    message: '1 invoice jatuh tempo hari ini',
    description: 'INV-2026-0087 — PT Maju Bersama — Rp 12.500.000',
  },
];

const todaySchedule = [
  {
    time: '08:00',
    type: 'pickup',
    label: 'Pengambilan',
    car: 'Toyota Avanza',
    plate: 'B 2045 KJH',
    customer: 'Pak Budi Santoso',
    phone: '0812-3456-7890',
    driver: 'Andi Saputra',
    color: '#52c41a',
  },
  {
    time: '09:30',
    type: 'pickup',
    label: 'Pengambilan',
    car: 'Daihatsu Xenia',
    plate: 'B 9012 GHI',
    customer: 'Pak Ahmad Hidayat',
    phone: '0878-1234-5678',
    driver: 'Roni Setiawan',
    color: '#52c41a',
  },
  {
    time: '10:00',
    type: 'return',
    label: 'Pengembalian',
    car: 'Honda Jazz',
    plate: 'D 5678 DEF',
    customer: 'Bu Sari Dewi',
    phone: '0856-9876-5432',
    driver: null,
    color: '#faad14',
  },
  {
    time: '13:00',
    type: 'pickup',
    label: 'Pengambilan',
    car: 'Mitsubishi Pajero',
    plate: 'B 3344 WER',
    customer: 'Pak Hendra Gunawan',
    phone: '0813-5556-7778',
    driver: 'Andi Saputra',
    color: '#52c41a',
  },
  {
    time: '14:30',
    type: 'return',
    label: 'Pengembalian',
    car: 'Suzuki Ertiga',
    plate: 'L 4455 PQR',
    customer: 'Bu Mega Wulandari',
    phone: '0821-4433-2211',
    driver: null,
    color: '#faad14',
  },
  {
    time: '15:00',
    type: 'maintenance',
    label: 'Maintenance',
    car: 'Toyota Fortuner',
    plate: 'B 3456 JKL',
    customer: '—',
    phone: null,
    driver: null,
    color: '#1677ff',
  },
];

const fleetSummary = {
  total: 20,
  available: 15,
  rented: 4,
  maintenance: 1,
};

const availableDrivers = [
  { name: 'Andi Saputra', phone: '0812-3456-7890', avatar: 'A' },
  { name: 'Roni Setiawan', phone: '0878-1234-5678', avatar: 'R' },
  { name: 'Dedi Kurniawan', phone: '0856-7777-8888', avatar: 'D' },
  { name: 'Fajar Nugroho', phone: '0813-2222-3333', avatar: 'F' },
];

interface ActiveRental {
  key: string;
  car: string;
  plate: string;
  customer: string;
  driver: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'ending_today' | 'overdue';
}

const activeRentals: ActiveRental[] = [
  { key: '1', car: 'Toyota Avanza', plate: 'B 1234 ABC', customer: 'Budi Santoso', driver: 'Andi Saputra', startDate: '15 Mar 2026', endDate: '18 Mar 2026', status: 'overdue' },
  { key: '2', car: 'Honda Brio', plate: 'B 7890 MNO', customer: 'Rina Kartika', driver: 'Roni Setiawan', startDate: '14 Mar 2026', endDate: '17 Mar 2026', status: 'overdue' },
  { key: '3', car: 'Mitsubishi Pajero', plate: 'B 6677 STU', customer: 'Hendra Gunawan', driver: 'Dedi Kurniawan', startDate: '17 Mar 2026', endDate: '19 Mar 2026', status: 'ending_today' },
  { key: '4', car: 'Daihatsu Xenia', plate: 'D 1122 VWX', customer: 'Siti Nurhaliza', driver: 'Fajar Nugroho', startDate: '16 Mar 2026', endDate: '21 Mar 2026', status: 'ongoing' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const OperationalDashboard: React.FC = () => {
  const navigate = useNavigate();

  const statusColor: Record<string, { tag: string; label: string; color: string }> = {
    ongoing: { tag: 'green', label: 'Berjalan', color: '#52c41a' },
    ending_today: { tag: 'orange', label: 'Berakhir Hari Ini', color: '#faad14' },
    overdue: { tag: 'red', label: 'Overdue', color: '#ff4d4f' },
  };

  const rentalColumns = [
    {
      title: 'Mobil',
      key: 'car',
      render: (_: unknown, r: ActiveRental) => (
        <div>
          <Text strong>{r.car}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.plate}</Text>
        </div>
      ),
    },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Driver', dataIndex: 'driver', key: 'driver' },
    { title: 'Mulai', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Berakhir', dataIndex: 'endDate', key: 'endDate' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const cfg = statusColor[s] || statusColor.ongoing;
        return (
          <Tag
            color={cfg.tag}
            style={s === 'overdue' ? { animation: 'pulse 1.5s infinite' } : undefined}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
  ];

  // ─── Quick Stat Card helper ──────────────────────────────────────────────

  const QuickStat = ({
    title,
    value,
    icon,
    bg,
    iconColor,
    onClick,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    bg: string;
    iconColor: string;
    onClick?: () => void;
  }) => (
    <Card
      hoverable
      onClick={onClick}
      style={{ borderRadius: 10, cursor: onClick ? 'pointer' : 'default' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <Statistic value={value} valueStyle={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
        </div>
      </div>
    </Card>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Pulse animation for overdue tags */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: .55; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Operasional Hari Ini
          </Title>
          <Text type="secondary">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </div>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/bookings/create')}
          >
            Booking Baru
          </Button>
        </Space>
      </div>

      {/* ── Section 1: Quick Stats ───────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={12} md={6}>
          <QuickStat
            title="Booking Hari Ini"
            value={todayStats.bookings}
            icon={<CalendarOutlined />}
            bg="#e6f4ff"
            iconColor="#1677ff"
            onClick={() => navigate('/bookings')}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <QuickStat
            title="Pengambilan"
            value={todayStats.pickups}
            icon={<ArrowRightOutlined />}
            bg="#f6ffed"
            iconColor="#52c41a"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <QuickStat
            title="Pengembalian"
            value={todayStats.returns}
            icon={<SwapOutlined />}
            bg="#fff7e6"
            iconColor="#faad14"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <QuickStat
            title="Perlu Perhatian"
            value={todayStats.issues}
            icon={<WarningOutlined />}
            bg={todayStats.issues > 0 ? '#fff1f0' : '#f6ffed'}
            iconColor={todayStats.issues > 0 ? '#ff4d4f' : '#52c41a'}
          />
        </Col>
      </Row>

      {/* ── Section 2: Urgent Alerts ─────────────────────────────────────── */}
      {urgentAlerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {urgentAlerts.map((a) => (
            <Alert
              key={a.id}
              type={a.type}
              showIcon
              message={a.message}
              description={a.description}
              style={{ marginBottom: 8, borderRadius: 8 }}
              closable
            />
          ))}
        </div>
      )}

      {/* ── Section 3: Two-column layout ─────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* LEFT — Today's Schedule */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Jadwal Hari Ini</span>
              </Space>
            }
            style={{ borderRadius: 10 }}
            styles={{ body: { paddingTop: 12, paddingBottom: 12 } }}
          >
            <Timeline
              items={todaySchedule.map((item) => ({
                color: item.color,
                dot:
                  item.type === 'maintenance' ? (
                    <ToolOutlined style={{ fontSize: 14 }} />
                  ) : item.type === 'return' ? (
                    <SwapOutlined style={{ fontSize: 14 }} />
                  ) : (
                    <CarOutlined style={{ fontSize: 14 }} />
                  ),
                children: (
                  <div style={{ paddingBottom: 4 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 13 }}>
                          {item.time}
                        </Text>
                        <Tag
                          color={
                            item.type === 'pickup'
                              ? 'green'
                              : item.type === 'return'
                              ? 'orange'
                              : 'blue'
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {item.label}
                        </Tag>
                        <br />
                        <Text style={{ fontSize: 13 }}>
                          {item.car}{' '}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.plate}
                          </Text>
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.type === 'maintenance'
                            ? 'Servis rutin berkala'
                            : `${item.customer}${item.driver ? ` — Driver: ${item.driver}` : ''}`}
                        </Text>
                      </div>
                      <Space size={4}>
                        {item.phone && (
                          <Tooltip title={`Hubungi ${item.customer}`}>
                            <Button
                              size="small"
                              icon={<PhoneOutlined />}
                              href={`tel:${item.phone}`}
                            />
                          </Tooltip>
                        )}
                        <Tooltip title="Tandai selesai">
                          <Button size="small" icon={<CheckCircleOutlined />} />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* RIGHT — Status Board */}
        <Col xs={24} lg={10}>
          {/* Fleet Status */}
          <Card
            title={
              <Space>
                <CarOutlined />
                <span>Status Armada</span>
              </Space>
            }
            style={{ borderRadius: 10, marginBottom: 16 }}
            styles={{ body: { paddingTop: 16, paddingBottom: 16 } }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Tersedia</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {fleetSummary.available}/{fleetSummary.total}
                </Text>
              </div>
              <Progress
                percent={(fleetSummary.available / fleetSummary.total) * 100}
                showInfo={false}
                strokeColor="#52c41a"
                size="small"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Disewa</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {fleetSummary.rented}/{fleetSummary.total}
                </Text>
              </div>
              <Progress
                percent={(fleetSummary.rented / fleetSummary.total) * 100}
                showInfo={false}
                strokeColor="#1677ff"
                size="small"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Maintenance</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {fleetSummary.maintenance}/{fleetSummary.total}
                </Text>
              </div>
              <Progress
                percent={(fleetSummary.maintenance / fleetSummary.total) * 100}
                showInfo={false}
                strokeColor="#faad14"
                size="small"
              />
            </div>
          </Card>

          {/* Available Drivers */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Driver Tersedia</span>
              </Space>
            }
            style={{ borderRadius: 10, marginBottom: 16 }}
            styles={{ body: { paddingTop: 8, paddingBottom: 8 } }}
          >
            <List
              size="small"
              dataSource={availableDrivers}
              renderItem={(d) => (
                <List.Item
                  actions={[
                    <Tooltip title={`Hubungi ${d.name}`} key="call">
                      <Button
                        type="text"
                        size="small"
                        icon={<PhoneOutlined />}
                        href={`tel:${d.phone}`}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size="small" style={{ background: '#1677ff' }}>{d.avatar}</Avatar>}
                    title={<Text style={{ fontSize: 13 }}>{d.name}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{d.phone}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Quick Actions */}
          <Card
            title={
              <Space>
                <DashboardOutlined />
                <span>Aksi Cepat</span>
              </Space>
            }
            style={{ borderRadius: 10 }}
            styles={{ body: { paddingTop: 12, paddingBottom: 12 } }}
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Button
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/bookings/create')}
                >
                  Buat Booking
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<SwapOutlined />}
                  onClick={() => navigate('/bookings')}
                >
                  Pengembalian
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<DollarOutlined />}
                  onClick={() => navigate('/fuel/create')}
                >
                  Log BBM
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<FileTextOutlined />}
                  onClick={() => navigate('/invoices/create')}
                >
                  Buat Invoice
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Section 4: Active Rentals ────────────────────────────────────── */}
      <Card
        title={
          <Space>
            <CarOutlined />
            <span>Sewa Aktif</span>
          </Space>
        }
        style={{ borderRadius: 10 }}
        extra={
          <Button type="link" onClick={() => navigate('/bookings')}>
            Lihat Semua
          </Button>
        }
      >
        <Table
          columns={rentalColumns}
          dataSource={activeRentals}
          rowKey="key"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/bookings/${record.key}`),
          })}
        />
      </Card>
    </div>
  );
};

export default OperationalDashboard;
