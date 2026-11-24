// Bentuk data dari backend (lihat backend/src/modules/*/service.ts)

export interface Category {
  category_id: number;
  category_code: string;
  category_name: string;
  maintenance_default_days?: number | null;
  asset_count?: number;
}

export interface Room {
  room_id: number;
  room_name: string;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
}

export interface AssetRow {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  category_id: number;
  category_name: string;
  location_text: string;
  asset_condition: string;
  status: string;
  is_lendable: boolean;
  has_photo: number;
}

export interface AssetFull extends AssetRow {
  source_type?: string;
  donor_name?: string | null;
  acquired_date?: string;
  acquisition_value?: number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string | null;
}

export interface AssetHistory {
  history_id: string;
  event_type: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  note: string | null;
  actor_name: string | null;
  created_at: string;
}

export interface LoanRow {
  loan_id: string;
  loan_code: string;
  request_type: 'RUANGAN' | 'ASET';
  borrower_name: string;
  borrower_org: string | null;
  room_id: number | null;
  room_name: string | null;
  asset_names: string | null;
  use_facilities: boolean;
  start_at: string;
  end_at: string;
  status: string;
  created_at: string;
}

export interface LoanDetail extends LoanRow {
  borrower_phone: string;
  borrower_email: string;
  purpose: string;
  reject_reason: string | null;
  reviewed_by_name: string | null;
  workflow_name: string | null;
  return_note: string | null;
  items: { loan_item_id: string; asset_id: string; asset_code: string; asset_name: string; asset_status: string; condition_out: string | null; condition_in: string | null }[];
  approvals: { decision: string; note: string | null; decided_at: string; approver_name: string | null; approver_role: string; step_order: number }[];
  pic_wa_link?: string;
}

export interface CalendarEvent {
  source_type: string;
  title: string;
  room_id: number | null;
  room_name: string | null;
  start_at: string;
  end_at: string;
  ref_code?: string;
  status?: string;
}
