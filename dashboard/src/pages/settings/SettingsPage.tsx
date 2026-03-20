import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Modal,
  Select,
  Switch,
  message,
  Upload,
  Avatar,
  Tag,
  Popconfirm,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
  BellOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import type { User, Role } from '@/types';

const { TextArea } = Input;

const mockUsers: (User & { status: string })[] = [
  { id: '1', name: 'Admin Utama', email: 'admin@caritahub.com', role: 'SUPER_ADMIN' as Role, status: 'active', phone: '081234567890', isActive: true, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '2', name: 'Manager Jakarta', email: 'manager.jkt@caritahub.com', role: 'ADMIN' as Role, status: 'active', phone: '081234567891', isActive: true, createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: '3', name: 'Staff Bandung', email: 'staff.bdg@caritahub.com', role: 'STAFF' as Role, status: 'active', phone: '081234567892', isActive: true, createdAt: '2025-03-01', updatedAt: '2025-03-01' },
  { id: '4', name: 'Staff Surabaya', email: 'staff.sby@caritahub.com', role: 'STAFF' as Role, status: 'inactive', phone: '081234567893', isActive: false, createdAt: '2025-04-01', updatedAt: '2025-04-01' },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  STAFF: 'green',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
};

// Company Profile Tab
const CompanyProfileTab: React.FC = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      companyName: 'CaritaHub Rental',
      tagline: 'Solusi Rental Kendaraan Terpercaya',
      email: 'info@rentalku.com',
      phone: '021-12345678',
      whatsapp: '081234567890',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10110',
      website: 'https://rentalku.com',
      taxId: '12.345.678.9-012.000',
      description: 'CaritaHub Rental adalah perusahaan rental kendaraan yang menyediakan berbagai jenis kendaraan untuk kebutuhan pribadi dan bisnis.',
    });
  }, [form]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      setSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Profil perusahaan berhasil diperbarui');
    } catch {
      // validation failed
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical" style={{ maxWidth: 700 }}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="companyName" label="Nama Perusahaan" rules={[{ required: true, message: 'Masukkan nama perusahaan!' }]}>
              <Input placeholder="Nama perusahaan" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Logo Perusahaan">
              <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tagline" label="Tagline">
          <Input placeholder="Tagline perusahaan" />
        </Form.Item>

        <Form.Item name="description" label="Deskripsi">
          <TextArea rows={3} placeholder="Deskripsi perusahaan" />
        </Form.Item>

        <Divider>Kontak</Divider>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email tidak valid!' }]}>
              <Input placeholder="Email perusahaan" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="phone" label="Telepon">
              <Input placeholder="Nomor telepon" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="whatsapp" label="WhatsApp">
              <Input placeholder="Nomor WhatsApp" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Alamat</Divider>

        <Form.Item name="address" label="Alamat Lengkap">
          <TextArea rows={2} placeholder="Alamat lengkap" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="city" label="Kota">
              <Input placeholder="Kota" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="province" label="Provinsi">
              <Input placeholder="Provinsi" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="postalCode" label="Kode Pos">
              <Input placeholder="Kode pos" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Lainnya</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="website" label="Website">
              <Input placeholder="https://example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="taxId" label="NPWP">
              <Input placeholder="NPWP perusahaan" />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          Simpan Perubahan
        </Button>
      </Form>
    </Card>
  );
};

// User Management Tab
const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { status: string }) | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (user: User & { status: string }) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    message.success('Pengguna berhasil dihapus');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (editingUser) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)));
        message.success('Pengguna berhasil diperbarui');
      } else {
        const newUser = { ...values, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setUsers((prev) => [...prev, newUser]);
        message.success('Pengguna berhasil ditambahkan');
      }
      setModalOpen(false);
    } catch {
      // validation failed
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Pengguna',
      key: 'user',
      render: (_: unknown, r: User & { status: string }) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: roleColors[r.role] === 'red' ? '#ff4d4f' : roleColors[r.role] === 'blue' ? '#1677ff' : '#52c41a' }}>
            {r.name?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Telepon', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role]}>{roleLabels[role] || role}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? 'Aktif' : 'Nonaktif'}</Tag>,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_: unknown, r: User & { status: string }) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Hapus pengguna ini?" onConfirm={() => handleDelete(r.id)} okText="Hapus" cancelText="Batal">
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Daftar Pengguna"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Pengguna
          </Button>
        }
      >
        <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} pengguna` }} />
      </Card>

      <Modal
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true, message: 'Masukkan nama!' }]}>
            <Input placeholder="Nama lengkap" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Masukkan email!' }, { type: 'email', message: 'Email tidak valid!' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Telepon">
            <Input placeholder="Nomor telepon" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Pilih role!' }]}>
            <Select placeholder="Pilih role">
              <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="STAFF">Staff</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Pilih status!' }]}>
            <Select placeholder="Pilih status">
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Nonaktif</Select.Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Masukkan password!' }, { min: 6, message: 'Minimal 6 karakter!' }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

// Roles & Permissions Tab
const RolesTab: React.FC = () => {
  const roles = [
    {
      name: 'Super Admin',
      key: 'SUPER_ADMIN',
      description: 'Akses penuh ke semua fitur sistem',
      permissions: ['Dashboard', 'Mobil', 'Booking', 'Driver', 'Customer', 'Pembayaran', 'Perawatan', 'BBM', 'GPS', 'Inspeksi', 'Kontrak', 'Review', 'Cabang', 'Laporan', 'Pengaturan'],
      color: 'red',
    },
    {
      name: 'Admin',
      key: 'ADMIN',
      description: 'Manajemen operasional cabang',
      permissions: ['Dashboard', 'Mobil', 'Booking', 'Driver', 'Customer', 'Pembayaran', 'Perawatan', 'BBM', 'GPS', 'Inspeksi', 'Kontrak', 'Review', 'Laporan'],
      color: 'blue',
    },
    {
      name: 'Staff',
      key: 'STAFF',
      description: 'Operasional harian',
      permissions: ['Dashboard', 'Mobil', 'Booking', 'Driver', 'Customer', 'Inspeksi'],
      color: 'green',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {roles.map((role) => (
        <Col key={role.key} xs={24} md={8}>
          <Card
            title={
              <Space>
                <Tag color={role.color}>{role.name}</Tag>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <p style={{ color: '#8c8c8c', marginBottom: 16 }}>{role.description}</p>
            <Divider style={{ margin: '12px 0' }}>Hak Akses</Divider>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {role.permissions.map((p) => (
                <Tag key={p} color="processing" style={{ marginBottom: 4 }}>
                  {p}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// Notification Settings Tab
const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNewBooking: true,
    emailBookingStatus: true,
    emailPaymentReceived: true,
    emailMaintenanceDue: true,
    emailDailyReport: false,
    pushNewBooking: true,
    pushBookingStatus: true,
    pushPaymentReceived: true,
    pushMaintenanceDue: true,
    pushLowFuel: false,
    whatsappNewBooking: false,
    whatsappBookingStatus: false,
    whatsappPaymentReceived: false,
  });

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    message.success('Pengaturan notifikasi berhasil disimpan');
  };

  const renderNotifRow = (label: string, key: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span>{label}</span>
      <Switch checked={settings[key as keyof typeof settings]} onChange={(v) => handleToggle(key, v)} />
    </div>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card title="Notifikasi Email" size="small">
          {renderNotifRow('Booking Baru', 'emailNewBooking')}
          {renderNotifRow('Status Booking Berubah', 'emailBookingStatus')}
          {renderNotifRow('Pembayaran Diterima', 'emailPaymentReceived')}
          {renderNotifRow('Perawatan Jatuh Tempo', 'emailMaintenanceDue')}
          {renderNotifRow('Laporan Harian', 'emailDailyReport')}
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Notifikasi Push" size="small">
          {renderNotifRow('Booking Baru', 'pushNewBooking')}
          {renderNotifRow('Status Booking Berubah', 'pushBookingStatus')}
          {renderNotifRow('Pembayaran Diterima', 'pushPaymentReceived')}
          {renderNotifRow('Perawatan Jatuh Tempo', 'pushMaintenanceDue')}
          {renderNotifRow('BBM Rendah', 'pushLowFuel')}
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Notifikasi WhatsApp" size="small">
          {renderNotifRow('Booking Baru', 'whatsappNewBooking')}
          {renderNotifRow('Status Booking Berubah', 'whatsappBookingStatus')}
          {renderNotifRow('Pembayaran Diterima', 'whatsappPaymentReceived')}
        </Card>
      </Col>
      <Col span={24}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          Simpan Pengaturan Notifikasi
        </Button>
      </Col>
    </Row>
  );
};

// Subscription Tab
const SubscriptionTab: React.FC = () => {
  const [currentPlan] = useState('FREE');

  const plans = [
    {
      key: 'FREE',
      name: 'Free',
      price: 'Gratis',
      period: '',
      features: [
        'Maks. 3 mobil',
        'Maks. 5 motor',
        '1 cabang',
        'Semua fitur dasar',
        'Laporan dasar',
        'Email support',
      ],
      limitations: [
        'Iklan banner di dashboard',
        'Watermark di invoice & kontrak',
      ],
      color: '#8c8c8c',
    },
    {
      key: 'STANDARD',
      name: 'Standard',
      price: 'Rp 499.000',
      period: '/bulan',
      features: [
        'Maks. 25 mobil',
        'Maks. 40 motor',
        '3 cabang',
        'Semua fitur dasar',
        'Laporan dasar',
        'Tanpa iklan',
        'Tanpa watermark',
        'Priority support',
      ],
      limitations: [],
      color: '#1677ff',
      recommended: true,
    },
    {
      key: 'PREMIUM',
      name: 'Premium',
      price: 'Rp 1.499.000',
      period: '/bulan',
      features: [
        'Unlimited mobil',
        'Unlimited motor',
        'Unlimited cabang',
        'Semua fitur lengkap',
        'Laporan lanjutan (revenue, fleet, expense)',
        'GPS tracking real-time',
        'Automasi operasional',
        'Tanpa iklan',
        'Tanpa watermark',
        'Dedicated support',
      ],
      limitations: [],
      color: '#722ed1',
    },
  ];

  const planOrder = ['FREE', 'STANDARD', 'PREMIUM'];
  const currentIndex = planOrder.indexOf(currentPlan);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h3 style={{ marginBottom: 4 }}>Paket Langganan Anda</h3>
        <Tag color={plans.find((p) => p.key === currentPlan)?.color} style={{ fontSize: 14, padding: '4px 16px' }}>
          {plans.find((p) => p.key === currentPlan)?.name || currentPlan}
        </Tag>
      </div>
      <Row gutter={[16, 16]} justify="center">
        {plans.map((plan) => {
          const planIndex = planOrder.indexOf(plan.key);
          return (
            <Col key={plan.key} xs={24} md={8}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderColor: plan.key === currentPlan ? plan.color : undefined,
                  borderWidth: plan.key === currentPlan ? 2 : 1,
                }}
              >
                {plan.recommended && (
                  <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12, fontSize: 11 }}>
                    Rekomendasi
                  </Tag>
                )}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <h3 style={{ color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
                  <span style={{ fontSize: 28, fontWeight: 700, color: plan.color }}>{plan.price}</span>
                  {plan.period && <span style={{ color: '#8c8c8c' }}>{plan.period}</span>}
                </div>
                <Divider />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ padding: '6px 0', fontSize: 13 }}>
                      <span style={{ color: '#52c41a', marginRight: 8 }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                  {plan.limitations.map((f, i) => (
                    <li key={`lim-${i}`} style={{ padding: '6px 0', fontSize: 13, color: '#ff4d4f' }}>
                      <span style={{ marginRight: 8 }}>&#10007;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  {plan.key === currentPlan ? (
                    <Button disabled block>
                      Paket Saat Ini
                    </Button>
                  ) : (
                    <Button
                      type={planIndex > currentIndex ? 'primary' : 'default'}
                      block
                      onClick={() => message.info(`Hubungi sales untuk ${planIndex > currentIndex ? 'upgrade' : 'downgrade'} ke paket ${plan.name}`)}
                    >
                      {planIndex > currentIndex ? 'Upgrade' : 'Downgrade'}
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

// Invoice Template Tab (link to dedicated page)
const InvoiceTemplateTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <FileTextOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>Template Invoice</h3>
        <p style={{ color: '#8c8c8c', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          Kustomisasi tampilan invoice Anda dengan logo, warna, tanda tangan digital, informasi bank, dan syarat &amp; ketentuan. Preview langsung tersedia saat mengedit.
        </p>
        <Button
          type="primary"
          size="large"
          icon={<EditOutlined />}
          onClick={() => navigate('/settings/invoice-template')}
        >
          Kelola Template Invoice <RightOutlined />
        </Button>
      </div>
    </Card>
  );
};

// Main Settings Page
const SettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'company',
      label: (
        <span>
          <SettingOutlined /> Profil Perusahaan
        </span>
      ),
      children: <CompanyProfileTab />,
    },
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined /> Manajemen Pengguna
        </span>
      ),
      children: <UserManagementTab />,
    },
    {
      key: 'roles',
      label: (
        <span>
          <UserOutlined /> Role & Hak Akses
        </span>
      ),
      children: <RolesTab />,
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifikasi
        </span>
      ),
      children: <NotificationSettingsTab />,
    },
    {
      key: 'invoice-template',
      label: (
        <span>
          <FileTextOutlined /> Template Invoice
        </span>
      ),
      children: <InvoiceTemplateTab />,
    },
    {
      key: 'subscription',
      label: (
        <span>
          <SettingOutlined /> Langganan
        </span>
      ),
      children: <SubscriptionTab />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        subtitle="Kelola pengaturan aplikasi"
        breadcrumbs={[{ title: 'Dashboard', path: '/' }, { title: 'Pengaturan' }]}
      />
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
