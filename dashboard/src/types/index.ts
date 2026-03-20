// ========== ENUMS ==========

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export enum CarCategory {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  MPV = 'MPV',
  HATCHBACK = 'HATCHBACK',
  PICKUP = 'PICKUP',
  VAN = 'VAN',
  LUXURY = 'LUXURY',
  SPORT = 'SPORT',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum FuelType {
  BENSIN = 'BENSIN',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET',
  CASH = 'CASH',
  VA = 'VA',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
  INACTIVE = 'INACTIVE',
}

export enum InspectionType {
  PRE_RENTAL = 'PRE_RENTAL',
  POST_RENTAL = 'POST_RENTAL',
  PERIODIC = 'PERIODIC',
}

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  TIRE = 'TIRE',
  BODY = 'BODY',
  ENGINE = 'ENGINE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ExpenseCategory {
  FUEL = 'FUEL',
  MAINTENANCE = 'MAINTENANCE',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
  PARKING = 'PARKING',
  TOLL = 'TOLL',
  OTHER = 'OTHER',
}

export enum DocumentType {
  STNK = 'STNK',
  BPKB = 'BPKB',
  KIR = 'KIR',
  INSURANCE = 'INSURANCE',
  SIM = 'SIM',
  KTP = 'KTP',
  OTHER = 'OTHER',
}

export enum SaasPlan {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export interface PlanLimits {
  maxCars: number;
  maxMotorcycles: number;
  maxBranches: number;
  features: {
    gpsTracking: boolean;
    advancedReports: boolean;
    automation: boolean;
    removeAds: boolean;
    removeWatermark: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: SaasPlan;
  logo?: string;
  isActive: boolean;
}

// ========== INTERFACES ==========

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  branchId?: string;
  branch?: Branch;
  organizationId?: string;
  organization?: Organization;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cars: number;
    users: number;
  };
}

export interface Car {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: CarCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineCapacity: number;
  seats: number;
  pricePerDay: number;
  pricePerHour?: number;
  status: CarStatus;
  mileage: number;
  imageUrl?: string;
  images?: string[];
  branchId: string;
  branch?: Branch;
  features?: string[];
  description?: string;
  documents?: CarDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface CarDocument {
  id: string;
  carId: string;
  type: DocumentType;
  documentNumber: string;
  expiryDate?: string;
  fileUrl: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  user?: User;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  status: DriverStatus;
  rating?: number;
  totalTrips: number;
  branchId: string;
  branch?: Branch;
  documents?: DriverDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  type: DocumentType;
  documentNumber: string;
  expiryDate?: string;
  fileUrl: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer?: User;
  carId: string;
  car?: Car;
  driverId?: string;
  driver?: Driver;
  branchId: string;
  branch?: Branch;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  status: BookingStatus;
  totalAmount: number;
  driverFee?: number;
  discount?: number;
  notes?: string;
  payments?: Payment[];
  inspections?: Inspection[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  midtransOrderId?: string;
  midtransToken?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GpsLog {
  id: string;
  carId: string;
  car?: Car;
  bookingId?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: string;
}

export interface MaintenanceRecord {
  id: string;
  carId: string;
  car?: Car;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  vendor?: string;
  notes?: string;
  mileageAtService?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  carId: string;
  car?: Car;
  driverId?: string;
  driver?: Driver;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  fuelType: FuelType;
  station?: string;
  receiptUrl?: string;
  date: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  bookingId: string;
  booking?: Booking;
  carId: string;
  car?: Car;
  inspectorId: string;
  inspector?: User;
  type: InspectionType;
  exteriorCondition: string;
  interiorCondition: string;
  engineCondition: string;
  tireCondition: string;
  fuelLevel: number;
  mileage: number;
  damages?: string;
  photos?: string[];
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  booking?: Booking;
  customerId: string;
  customer?: User;
  carId: string;
  car?: Car;
  driverId?: string;
  driver?: Driver;
  rating: number;
  comment?: string;
  isPublished: boolean;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  bookingId: string;
  booking?: Booking;
  contractNumber: string;
  fileUrl?: string;
  signedAt?: string;
  signatureUrl?: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  branchId?: string;
  branch?: Branch;
  carId?: string;
  car?: Car;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  activeBookings: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  availableDrivers: number;
  totalDrivers: number;
  totalCustomers: number;
  pendingPayments: number;
  upcomingMaintenance: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface FleetUtilization {
  carId: string;
  plateNumber: string;
  brand: string;
  model: string;
  utilizationRate: number;
  totalDaysRented: number;
  revenue: number;
}

export interface ExpenseSummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
