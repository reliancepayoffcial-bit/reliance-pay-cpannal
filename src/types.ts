export interface User {
  id: number;
  user_code: string;
  mobile: string;
  name: string;
  role: 'user' | 'admin';
  balance: number;
  deposited: number;
  withdrawn: number;
  withdrawal_pin?: string;
  kyc_status: string; // Keep for backward compatibility if needed
  kyc_required?: number;
  kyc_verification_status?: 'Not Required' | 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  referral_code: string;
  upi_id?: string;
  bank_details?: string;
  status: string;
  profile_photo?: string;
  created_at?: string;
  kyc_details?: {
    aadhaar_name: string;
    aadhaar_number: string;
    utr_id: string;
    status: string;
  } | null;
}

export interface Plan {
  id: number;
  name: string;
  category?: string;
  amount: number;
  duration_days: number;
  claim_interval_hours?: number;
  daily_return: number;
  claim_amount?: number;
  total_claims?: number;
  total_return: number;
  description?: string;
  image_url?: string;
  status: string;
  joined_users?: number;
  joined_users_offset?: number;
  capacity?: number;
  layout?: 'full' | 'side';
}

export interface UserPlan {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  category?: string;
  amount: number;
  duration_days?: number;
  daily_return: number;
  claim_amount?: number;
  claim_interval_hours?: number;
  total_claims?: number;
  claims_completed?: number;
  total_return: number;
  earned_so_far: number;
  last_claim_at?: string;
  next_claim_at?: string;
  can_claim?: boolean;
  seconds_remaining?: number;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface DividendClaim {
  id: number;
  claim_id: string;
  user_id: number;
  user_plan_id: number;
  plan_id: number;
  plan_name?: string;
  claim_number: number;
  amount: number;
  wallet_balance_before: number;
  wallet_balance_after: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  status: string;
  reference_no?: string;
  details: string;
  created_at: string;
}

export interface Deposit {
  id: number;
  user_id: number;
  user_name?: string;
  user_mobile?: string;
  amount: number;
  utr: string;
  screenshot?: string;
  status: string;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  user_name?: string;
  user_mobile?: string;
  amount: number;
  method: string;
  account_details: string;
  status: string;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

export interface KycEntry {
  id: number;
  user_id: number;
  user_name?: string;
  user_mobile?: string;
  aadhaar_name: string;
  aadhaar_number: string;
  utr_id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface ScratchCard {
  id: number;
  user_id: number;
  reward_amount: number;
  is_scratched: number;
  status: string;
  created_at: string;
}

export interface ReferralItem {
  id: number;
  referee_name: string;
  referee_mobile: string;
  bonus_amount: number;
  referee_joined: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposited: number;
  totalWithdrawn: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKyc: number;
}

export type LiveActivityType = 
  | 'deposit_success' 
  | 'bonus_received' 
  | 'withdrawal_success' 
  | 'referral_bonus' 
  | 'verification_completed';

export interface LiveActivity {
  id: string;
  type: LiveActivityType;
  title: string;
  user_display: string;
  mobile_masked: string;
  amount?: number;
  time_ago: string;
  is_demo?: boolean;
  created_at: string;
}
