import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Typography,
  Breadcrumb,
  theme,
  Button,
  Popover,
  List,
  Empty,
} from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  StarOutlined,
  BankOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import { notificationsService } from '@/services/notifications.service';
import type { Notification } from '@/types';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'cars-group',
    icon: <CarOutlined />,
    label: 'Mobil',
    children: [
      { key: '/cars', label: 'Daftar Mobil' },
      { key: '/cars/new', label: 'Tambah Mobil' },
    ],
  },
  {
    key: 'bookings-group',
    icon: <CalendarOutlined />,
    label: 'Booking',
    children: [
      { key: '/bookings', label: 'Daftar Booking' },
      { key: '/bookings/new', label: 'Buat Booking' },
      { key: '/bookings/calendar', label: 'Kalender' },
    ],
  },
  { key: '/scheduling', icon: <ScheduleOutlined />, label: 'Scheduling' },
  {
    key: 'drivers-group',
    icon: <TeamOutlined />,
    label: 'Driver',
    children: [
      { key: '/drivers', label: 'Daftar Driver' },
      { key: '/drivers/new', label: 'Tambah Driver' },
    ],
  },
  { key: '/customers', icon: <UserOutlined />, label: 'Customer' },
  { key: '/payments', icon: <DollarOutlined />, label: 'Pembayaran' },
  {
    key: 'maintenance-group',
    icon: <ToolOutlined />,
    label: 'Maintenance',
    children: [
      { key: '/maintenance', label: 'Daftar Maintenance' },
      { key: '/maintenance/new', label: 'Tambah Record' },
    ],
  },
  {
    key: 'fuel-group',
    icon: <ThunderboltOutlined />,
    label: 'BBM & Biaya',
    children: [
      { key: '/fuel', label: 'Log BBM' },
      { key: '/fuel/new', label: 'Tambah BBM' },
      { key: '/expenses', label: 'Biaya Operasional' },
    ],
  },
  { key: '/gps-tracking', icon: <EnvironmentOutlined />, label: 'GPS Tracking' },
  { key: '/inspections', icon: <SafetyCertificateOutlined />, label: 'Inspeksi' },
  { key: '/contracts', icon: <FileTextOutlined />, label: 'Kontrak' },
  { key: '/reviews', icon: <StarOutlined />, label: 'Review' },
  {
    key: 'branches-group',
    icon: <BankOutlined />,
    label: 'Cabang',
    children: [
      { key: '/branches', label: 'Daftar Cabang' },
      { key: '/branches/new', label: 'Tambah Cabang' },
    ],
  },
  {
    key: 'reports-group',
    icon: <BarChartOutlined />,
    label: 'Laporan',
    children: [
      { key: '/reports/revenue', label: 'Pendapatan' },
      { key: '/reports/fleet', label: 'Armada' },
      { key: '/reports/expenses', label: 'Pengeluaran' },
    ],
  },
  { key: '/settings', icon: <SettingOutlined />, label: 'Pengaturan' },
];

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/cars': 'Mobil',
  '/cars/new': 'Tambah Mobil',
  '/bookings': 'Booking',
  '/bookings/new': 'Buat Booking',
  '/bookings/calendar': 'Kalender Booking',
  '/scheduling': 'Scheduling',
  '/drivers': 'Driver',
  '/drivers/new': 'Tambah Driver',
  '/customers': 'Customer',
  '/payments': 'Pembayaran',
  '/maintenance': 'Maintenance',
  '/maintenance/new': 'Tambah Maintenance',
  '/fuel': 'Log BBM',
  '/fuel/new': 'Tambah BBM',
  '/expenses': 'Biaya Operasional',
  '/gps-tracking': 'GPS Tracking',
  '/inspections': 'Inspeksi',
  '/contracts': 'Kontrak',
  '/reviews': 'Review',
  '/branches': 'Cabang',
  '/branches/new': 'Tambah Cabang',
  '/reports/revenue': 'Laporan Pendapatan',
  '/reports/fleet': 'Laporan Armada',
  '/reports/expenses': 'Laporan Pengeluaran',
  '/settings': 'Pengaturan',
};

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: { colorBgContainer } } = theme.useToken();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsService.getAll(1, 10),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data.data);
      setUnreadCount(countRes.data.data.count);
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil Saya' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Pengaturan' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', danger: true },
  ];

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') handleLogout();
    else if (key === 'settings') navigate('/settings');
    else if (key === 'profile') navigate('/settings');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    ...pathSegments.map((_, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      return { title: breadcrumbMap[path] || pathSegments[index] };
    }),
  ];

  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    .filter((item): item is MenuItem & { children: MenuItem[] } =>
      !!(item && 'children' in item && item.children)
    )
    .filter((item) =>
      item.children?.some((child) => child && 'key' in child && location.pathname.startsWith(child.key as string))
    )
    .map((item) => item!.key as string);

  const notificationContent = (
    <div style={{ width: 350 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Notifikasi</Text>
        <Button type="link" size="small" onClick={handleMarkAllRead}>
          Tandai semua dibaca
        </Button>
      </div>
      {notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 12px', background: item.isRead ? undefined : '#f6ffed' }}>
              <List.Item.Meta title={item.title} description={item.message} />
            </List.Item>
          )}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />
      ) : (
        <Empty description="Tidak ada notifikasi" style={{ padding: 24 }} />
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            {collapsed ? 'RK' : 'RentalKu'}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Space size={16}>
            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <Badge count={unreadCount} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Popover>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: 'block', fontSize: 13 }}>{user?.name || 'Admin'}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{user?.role || 'ADMIN'}</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
