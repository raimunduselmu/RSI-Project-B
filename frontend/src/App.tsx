import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import Login from '@/pages/auth/Login';
import ChangePassword from '@/pages/auth/ChangePassword';
import Home from '@/pages/public/Home';
import CekStatus from '@/pages/public/CekStatus';
import Dashboard from '@/pages/dashboard/Dashboard';
import NotFound from '@/pages/errors/NotFound';
import Forbidden from '@/pages/errors/Forbidden';
import FormPeminjaman from '@/pages/public/FormPeminjaman';
import DaftarKegiatan from '@/pages/public/DaftarKegiatan';
import FormIntensi from '@/pages/public/FormIntensi';
import FormPastoral from '@/pages/public/FormPastoral';
import Kalender from '@/pages/public/Kalender';
import AssetList from '@/pages/assets/AssetList';
import AssetForm from '@/pages/assets/AssetForm';
import AssetDetail from '@/pages/assets/AssetDetail';
import LoanList from '@/pages/loans/LoanList';
import LoanApproval from '@/pages/loans/LoanApproval';
import LoanHandover from '@/pages/loans/LoanHandover';
import MaintenanceList from '@/pages/maintenance/MaintenanceList';
import StocktakeList from '@/pages/stocktakes/StocktakeList';
import MemberList from '@/pages/members/MemberList';
import MemberDetail from '@/pages/members/MemberDetail';
import OrganizationPage from '@/pages/organization/OrganizationPage';
import HandoverPage from '@/pages/organization/HandoverPage';
import LiturgySchedule from '@/pages/liturgy/LiturgySchedule';
import EventList from '@/pages/events/EventList';
import EventRegistrations from '@/pages/events/EventRegistrations';
import CashPage from '@/pages/finance/CashPage';
import BudgetPage from '@/pages/finance/BudgetPage';
import KasMine from '@/pages/kas/KasMine';
import KasVerification from '@/pages/kas/KasVerification';
import MassIntentions from '@/pages/pastoral/MassIntentions';
import PastoralCares from '@/pages/pastoral/PastoralCares';
import DocumentList from '@/pages/documents/DocumentList';
import UserList from '@/pages/admin/UserList';
import SettingsPage from '@/pages/admin/SettingsPage';
import WorkflowPage from '@/pages/admin/WorkflowPage';
import AuditLog from '@/pages/admin/AuditLog';

export default function App() {
  return (
    <Routes>
      {/* ===== Publik (tanpa akun) ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/peminjaman" element={<FormPeminjaman />} />
        <Route path="/kegiatan" element={<DaftarKegiatan />} />
        <Route path="/intensi" element={<FormIntensi />} />
        <Route path="/pastoral" element={<FormPastoral />} />
        <Route path="/kalender" element={<Kalender />} />
        <Route path="/cek-status" element={<CekStatus />} />
      </Route>

      <Route path="/login" element={<Login />} />

      {/* ===== Wajib login ===== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/ganti-password" element={<ChangePassword />} />

        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="organization/handovers" element={<HandoverPage />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id/registrations" element={<EventRegistrations />} />
          <Route path="kas" element={<KasMine />} />
          <Route path="documents" element={<DocumentList />} />

          <Route element={<RoleRoute roles={['Sarpras', 'PHT']} />}>
            <Route path="assets" element={<AssetList />} />
            <Route path="assets/new" element={<AssetForm />} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="loans" element={<LoanList />} />
            <Route path="loans/:id" element={<LoanApproval />} />
            <Route path="loans/:id/handover" element={<LoanHandover />} />
            <Route path="maintenance" element={<MaintenanceList />} />
            <Route path="stocktakes" element={<StocktakeList />} />
          </Route>

          <Route element={<RoleRoute roles={['PHT', 'Pastor']} />}>
            <Route path="members" element={<MemberList />} />
            <Route path="members/:id" element={<MemberDetail />} />
          </Route>

          <Route element={<RoleRoute roles={['Liturgi', 'PHT', 'Pastor']} />}>
            <Route path="liturgy" element={<LiturgySchedule />} />
          </Route>

          <Route element={<RoleRoute roles={['Bendahara', 'PHT']} />}>
            <Route path="finance" element={<CashPage />} />
            <Route path="finance/budgets" element={<BudgetPage />} />
            <Route path="kas/verification" element={<KasVerification />} />
          </Route>

          <Route element={<RoleRoute roles={['Pastor', 'Liturgi']} />}>
            <Route path="pastoral" element={<MassIntentions />} />
            <Route path="pastoral/cares" element={<PastoralCares />} />
          </Route>

          <Route element={<RoleRoute roles={['Admin']} />}>
            <Route path="admin/users" element={<UserList />} />
            <Route path="admin/audit" element={<AuditLog />} />
          </Route>
          <Route element={<RoleRoute roles={['Admin', 'Bendahara']} />}>
            <Route path="admin/settings" element={<SettingsPage />} />
          </Route>
          <Route element={<RoleRoute roles={['Admin', 'PHT']} />}>
            <Route path="admin/workflows" element={<WorkflowPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
