import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Select, Tag, theme } from 'antd';
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
  SafetyCertificateOutlined,
  StopOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { t, LANGUAGES, Language } from '@/i18n';
import { useLanguageStore } from '@/stores/language.store';
import AdBanner from '@/components/shared/AdBanner';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const premiumLabel = (text: string) => (
  <span>{text} <CrownOutlined style={{ color: '#faad14', fontSize: 11 }} /></span>
);

const getMenuItems = (plan?: string) => [
  { key: '/operational', icon: <DashboardOutlined />, label: t('nav.operational') },
  { key: '/dashboard', icon: <BarChartOutlined />, label: t('nav.dashboard') },
  { key: '/cars', icon: <CarOutlined />, label: t('nav.cars') },
  { key: '/bookings', icon: <CalendarOutlined />, label: t('nav.bookings') },
  { key: '/scheduling', icon: <ScheduleOutlined />, label: t('nav.scheduling') },
  { key: '/drivers', icon: <TeamOutlined />, label: t('nav.drivers') },
  { key: '/customers', icon: <UserOutlined />, label: t('nav.customers') },
  { key: '/verification', icon: <SafetyCertificateOutlined />, label: 'Verifikasi' },
  { key: '/blacklist', icon: <StopOutlined />, label: 'Blacklist' },
  { key: '/invoices', icon: <FileTextOutlined />, label: t('nav.invoices') },
  { key: '/payments', icon: <CreditCardOutlined />, label: t('nav.payments') },
  { key: '/maintenance', icon: <ToolOutlined />, label: t('nav.maintenance') },
  { key: '/fuel', icon: <DollarOutlined />, label: t('nav.fuel') },
  { key: '/gps', icon: <EnvironmentOutlined />, label: plan !== 'PREMIUM' ? premiumLabel(t('nav.gps')) : t('nav.gps') },
  { key: '/inspections', icon: <FileSearchOutlined />, label: t('nav.inspections') },
  { key: '/contracts', icon: <FileTextOutlined />, label: t('nav.contracts') },
  { key: '/reviews', icon: <StarOutlined />, label: t('nav.reviews') },
  { key: '/branches', icon: <BankOutlined />, label: t('nav.branches') },
  { key: '/reports', icon: <BarChartOutlined />, label: plan !== 'PREMIUM' ? premiumLabel(t('nav.reports')) : t('nav.reports') },
  { key: '/settings', icon: <SettingOutlined />, label: t('nav.settings') },
];

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const selectedKey = '/' + (location.pathname.split('/')[1] || '');
  const currentPlan = (user as any)?.organization?.plan || 'FREE';
  const menuItems = getMenuItems(currentPlan);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.detail'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
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
            <Select
              value={language}
              onChange={(value) => setLanguage(value as Language)}
              style={{ width: 160 }}
              suffixIcon={<GlobalOutlined />}
              options={LANGUAGES.map((lang) => ({
                value: lang.code,
                label: `${lang.flag} ${lang.label}`,
              }))}
            />
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
          <AdBanner plan={currentPlan} placement="top" />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
