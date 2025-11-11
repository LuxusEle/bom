export type UserRole = "owner" | "manager" | "staff";

export type ProjectStatus = "quote" | "in-progress" | "completed";

export type BOMCategory = "material" | "labor" | "service";

export type ClaimStatus = "pending" | "approved" | "rejected" | "paid";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientContact: string;
  clientEmail?: string;
  status: ProjectStatus;
  assignedStaff: string[]; // User IDs
  totalBudget: number;
  totalClaimed: number;
  totalPaid: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMItem {
  id: string;
  projectId: string;
  category: BOMCategory;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  supplier?: string;
  budgetAmount: number; // quantity * unitCost
  claimedAmount: number;
  paidAmount: number;
  stockAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseClaim {
  id: string;
  projectId: string;
  bomItemId: string;
  claimedBy: string; // User ID
  claimedByName: string;
  amount: number;
  description: string;
  receiptUrls: string[];
  status: ClaimStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  paymentReference?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteData {
  project: Project;
  bomItems: BOMItem[];
  materialItems: BOMItem[];
  laborItems: BOMItem[];
  serviceItems: BOMItem[];
  subtotal: number;
  tax?: number;
  total: number;
}
