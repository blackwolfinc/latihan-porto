import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Select, theme } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
  CreditCardOutlined,
  ToolOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  StarOutlined,
  BankOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { t, LANGUAGES, Language } from '@/i18n';
import { useLanguageStore } from '@/stores/language.store';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/operational', icon: <DashboardOutlined />, label: 'Operasional' },
  { key: '/dashboard', icon: <BarChartOutlined />, label: 'Laporan & Analisa' },
  { key: '/cars', icon: <CarOutlined />, label: 'Mobil' },
  { key: '/bookings', icon: <CalendarOutlined />, label: 'Booking' },
  { key: '/scheduling', icon: <ScheduleOutlined />, label: 'Scheduling' },
  { key: '/drivers', icon: <TeamOutlined />, label: 'Driver' },
  { key: '/customers', icon: <UserOutlined />, label: 'Customer' },
  { key: '/invoices', icon: <FileTextOutlined />, label: 'Invoice' },
  { key: '/payments', icon: <CreditCardOutlined />, label: 'Pembayaran' },
  { key: '/maintenance', icon: <ToolOutlined />, label: 'Maintenance' },
  { key: '/fuel', icon: <DollarOutlined />, label: 'BBM & Biaya' },
  { key: '/gps', icon: <EnvironmentOutlined />, label: 'GPS Tracking' },
  { key: '/inspections', icon: <FileSearchOutlined />, label: 'Inspeksi' },
  { key: '/contracts', icon: <FileTextOutlined />, label: 'Kontrak' },
  { key: '/reviews', icon: <StarOutlined />, label: 'Review' },
  { key: '/branches', icon: <BankOutlined />, label: 'Cabang' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Laporan' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Pengaturan' },
];

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const selectedKey = '/' + (location.pathname.split('/')[1] || '');

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={250}
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
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Text strong style={{ color: '#fff', fontSize: collapsed ? 16 : 20 }}>
            {collapsed ? 'CH' : 'Caritahub Rental'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, cursor: 'pointer' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Space size={16}>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <Text>{user?.name || 'Admin'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: 24,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
