export type UserRole = 'ADMIN' | 'TEAM';

export type PlaceStatus = 'NOT_SOLD' | 'SOLD' | 'WITHDRAWN';

export type WinningRule = 'SAVINGS' | 'EFFICIENCY' | 'ACTUAL_WORTH';

export type TransactionStatus = 'CONFIRMED' | 'CANCELLED';

export interface ITeamMember {
  _id?: string;
  teamId: string;
  fullName: string;
  enrollmentNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeam {
  _id: string;
  teamName: string;
  memberCount: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  participationStatus: 'ACTIVE' | 'INACTIVE';
  startingBudget: number;
  remainingBudget: number;
  totalSpent: number;
  totalActualWorth: number; // Only accessible by admin!
  username?: string;
  firstLoginMustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPlace {
  _id: string;
  placeName: string;
  description: string;
  imageUrl: string;
  imageStoragePath?: string;
  startingPrice: number;
  actualWorth?: number; // Strictly confidential, admin-only!
  status: PlaceStatus;
  winningTeamId?: string;
  winningTeamName?: string;
  finalPurchasePrice?: number;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPurchase {
  _id: string;
  placeId: string;
  placeName: string;
  teamId: string;
  teamName: string;
  finalPurchasePrice: number;
  actualWorthAtSale?: number; // Admin-only
  status: TransactionStatus;
  confirmedAt: string;
  adminId: string;
  adminUsername: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEventSettings {
  _id?: string;
  eventName: string;
  startingBudgetPerTeam: number;
  currency: string;
  activeWinningRule: WinningRule;
  isRegistrationOpen: boolean;
  requireAdminApproval: boolean;
  isAnnouncementPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuditLog {
  _id: string;
  adminId: string;
  adminUsername: string;
  actionType: string;
  affectedRecordType: string;
  affectedRecordId: string;
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  reason?: string;
  timestamp: string;
}

export interface IWinnerAnnouncement {
  _id?: string;
  winningTeamId: string;
  winningTeamName: string;
  scoringRule: WinningRule;
  placesPurchased: number;
  totalActualWorth: number;
  totalSpent: number;
  totalSavings: number;
  valueEfficiency: number;
  announcedAt: string;
  announcedBy: string;
  isActive: boolean;
}

export interface ITeamResult {
  rank: number;
  teamId: string;
  teamName: string;
  placesPurchased: number;
  totalActualWorth: number;
  totalSpent: number;
  totalSavings: number;
  remainingBudget: number;
  valueEfficiency: number | null; // null if spent is 0
  budgetUtilization: number | null;
  purchasedPlaces: Array<{
    placeId: string;
    placeName: string;
    finalPrice: number;
    actualWorth?: number;
  }>;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
  teamId?: string;
  teamName?: string;
}
