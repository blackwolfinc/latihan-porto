import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Table,
  Tag,
  Switch,
  Space,
  Typography,
  message,
  Row,
  Col,
  Avatar,
  Select,
  Modal,
  Divider,
} from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  PlusOutlined,
  SaveOutlined,
  MailOutlined,
  BellOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/shared/PageHeader';
import { Role } from '@/types';
import type { User } from '@/types';

const { Text, Title } = Typography;

const mockUsers: Partial<User>[] = [
  { id: '1', name: 'Admin Utama', email: 'admin@caritahub.com', role: Role.SUPER_ADMIN, isActive: true },
  { id: '2', name: 'Budi Operator', email: 'budi@caritahub.com', role: Role.ADMIN, isActive: true },
  { id: '3', name: 'Siti Staff', email: 'siti@caritahub.com', role: Role.STAFF, isActive: true },
  { id: '4', name: 'Ahmad Driver', email: 'ahmad@caritahub.com', role: Role.DRIVER, isActive: true },
  { id: '5', name: 'Dewi Staff', email: 'dewi@caritahub.com', role: Role.STAFF, isActive: false },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  STAFF: 'green',
  DRIVER: 'orange',
  CUSTOMER: 'default',
};

const CompanyProfileTab: React.FC = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await form.validateFields();
      message.success('Profil perusahaan berhasil disimpan');
    } catch {
      message.error('Periksa kembali data yang dimasukkan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        companyName: 'Caritahub Rental',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        phone: '021-12345678',
        email: 'info@caritahub.com',
        website: 'www.caritahub.com',
      }}
      style={{ maxWidth: 600 }}
    >
      <Form.Item label="Logo Perusahaan">
        <Upload
          listType="picture-card"
          maxCount={1}
          beforeUpload={() => false}
        >
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Logo</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        name="companyName"
        label="Nama Perusahaan"
        rules={[{ required: true, message: 'Masukkan nama perusahaan!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="Alamat"
        rules={[{ required: true, message: 'Masukkan alamat!' }]}
      >
        <Input.TextArea rows={2} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label="Telepon"
            rules={[{ required: true, message: 'Masukkan telepon!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="website" label="Website">
        <Input />
      </Form.Item>

      <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
        Simpan Perubahan
      </Button>
    </Form>
  );
};

const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<Partial<User>[]>(mockUsers);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  const handleAddUser = async () => {
    try {
      const values = await addForm.validateFields();
      const newUser: Partial<User> = {
        id: String(Date.now()),
        ...values,
        isActive: true,
      };
      setUsers([...users, newUser]);
      setAddModalVisible(false);
      addForm.resetFields();
      message.success('User berhasil ditambahkan');
    } catch {
      // validation failed
    }
  };

  const columns: ColumnsType<Partial<User>> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>
          {active ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      render: () => (
        <Button type="link" size="small">Edit</Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
          Tambah User
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Belum ada user' }}
      />

      <Modal
        title="Tambah User Baru"
        open={addModalVisible}
        onOk={handleAddUser}
        onCancel={() => setAddModalVisible(false)}
        okText="Tambah"
        cancelText="Batal"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Masukkan nama!' }]}
          >
            <Input placeholder="Nama lengkap" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Masukkan email!' },
              { type: 'email', message: 'Format email tidak valid!' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Pilih role!' }]}
          >
            <Select
              placeholder="Pilih role"
              options={Object.values(Role).map((r) => ({ label: r, value: r }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const NotificationTab: React.FC = () => {
  const [settings, setSettings] = useState({
    emailBookingNew: true,
    emailBookingStatusChange: true,
    emailPaymentReceived: true,
    emailMaintenanceDue: false,
    pushBookingNew: true,
    pushBookingStatusChange: true,
    pushPaymentReceived: true,
    pushMaintenanceDue: true,
    smsBookingConfirm: true,
    smsPaymentReceived: false,
    smsMaintenanceDue: false,
  });

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    message.success('Pengaturan notifikasi diperbarui');
  };

  const NotificationRow: React.FC<{
    label: string;
    emailKey: string;
    pushKey: string;
    smsKey?: string;
  }> = ({ label, emailKey, pushKey, smsKey }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <Text>{label}</Text>
      <Space size={24}>
        <Space>
          <MailOutlined />
          <Switch
            size="small"
            checked={settings[emailKey as keyof typeof settings]}
            onChange={(v) => handleToggle(emailKey, v)}
          />
        </Space>
        <Space>
          <BellOutlined />
          <Switch
            size="small"
            checked={settings[pushKey as keyof typeof settings]}
            onChange={(v) => handleToggle(pushKey, v)}
          />
        </Space>
        {smsKey && (
          <Space>
            <MessageOutlined />
            <Switch
              size="small"
              checked={settings[smsKey as keyof typeof settings]}
              onChange={(v) => handleToggle(smsKey, v)}
            />
          </Space>
        )}
      </Space>
    </div>
  );

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '2px solid #f0f0f0',
        marginBottom: 8,
      }}>
        <Text strong>Notifikasi</Text>
        <Space size={24}>
          <Space><MailOutlined /><Text type="secondary" style={{ fontSize: 12 }}>Email</Text></Space>
          <Space><BellOutlined /><Text type="secondary" style={{ fontSize: 12 }}>Push</Text></Space>
          <Space><MessageOutlined /><Text type="secondary" style={{ fontSize: 12 }}>SMS</Text></Space>
        </Space>
      </div>

      <NotificationRow
        label="Booking baru"
        emailKey="emailBookingNew"
        pushKey="pushBookingNew"
        smsKey="smsBookingConfirm"
      />
      <NotificationRow
        label="Perubahan status booking"
        emailKey="emailBookingStatusChange"
        pushKey="pushBookingStatusChange"
      />
      <NotificationRow
        label="Pembayaran diterima"
        emailKey="emailPaymentReceived"
        pushKey="pushPaymentReceived"
        smsKey="smsPaymentReceived"
      />
      <NotificationRow
        label="Maintenance jatuh tempo"
        emailKey="emailMaintenanceDue"
        pushKey="pushMaintenanceDue"
        smsKey="smsMaintenanceDue"
      />
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'company',
      label: 'Profil Perusahaan',
      children: <CompanyProfileTab />,
    },
    {
      key: 'users',
      label: 'Manajemen User',
      children: <UserManagementTab />,
    },
    {
      key: 'notifications',
      label: 'Notifikasi',
      children: <NotificationTab />,
    },
  ];

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi sistem Caritahub Rental" />
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
