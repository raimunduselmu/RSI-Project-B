// Peta route = FSD v1.2 §3.1 Screen Inventory (SCR-00 s.d. SCR-43).
// Huruf di komentar = template desain (A–K) yang dipakai layar tsb.
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { SharedRoute } from '@/routes/SharedRoute';

// publik
import Home from '@/pages/public/Home';
import Kalender from '@/pages/public/Kalender';
import FormPeminjaman from '@/pages/public/FormPeminjaman';
import Transparansi from '@/pages/public/Transparansi';
import JadwalIbadah from '@/pages/public/JadwalIbadah';
import DaftarKegiatan from '@/pages/public/DaftarKegiatan';
import FormIntensi from '@/pages/public/FormIntensi';
import FormPastoral from '@/pages/public/FormPastoral';
import CekStatus from '@/pages/public/CekStatus';
// auth
import Login from '@/pages/auth/Login';
import ChangePassword from '@/pages/auth/ChangePassword';
// pengurus
import Dashboard from '@/pages/dashboard/Dashboard';
import Overview from '@/pages/dashboard/Overview';
import UserList from '@/pages/admin/UserList';
import AssetList from '@/pages/assets/AssetList';
import AssetForm from '@/pages/assets/AssetForm';
import AssetDetail from '@/pages/assets/AssetDetail';
import AssetLabels from '@/pages/assets/AssetLabels';
import LoanList from '@/pages/loans/LoanList';
import UsageReport from '@/pages/usage/UsageReport';
import MaintenanceList from '@/pages/maintenance/MaintenanceList';
import IncidentList from '@/pages/incidents/IncidentList';
import StocktakeList from '@/pages/stocktakes/StocktakeList';
import InventoryReport from '@/pages/reports/InventoryReport';
import CommitteeList from '@/pages/committees/CommitteeList';
import NotificationList from '@/pages/notifications/NotificationList';
import AuditLog from '@/pages/admin/AuditLog';
import MemberList from '@/pages/members/MemberList';
import MemberDetail from '@/pages/members/MemberDetail';
import OrganizationPage from '@/pages/organization/OrganizationPage';
import HandoverPage from '@/pages/organization/HandoverPage';
import LiturgySchedule from '@/pages/liturgy/LiturgySchedule';
import LiturgyAssignments from '@/pages/liturgy/LiturgyAssignments';
import EventList from '@/pages/events/EventList';
import EventRegistrations from '@/pages/events/EventRegistrations';
import EventLpj from '@/pages/events/EventLpj';
import DonationPage from '@/pages/finance/DonationPage';
import CashPage from '@/pages/finance/CashPage';
import LoanPayments from '@/pages/finance/LoanPayments';
import FinanceReport from '@/pages/finance/FinanceReport';
import MassIntentions from '@/pages/pastoral/MassIntentions';
import PastoralCares from '@/pages/pastoral/PastoralCares';
import AnnouncementList from '@/pages/announcements/AnnouncementList';
import WorkflowPage from '@/pages/admin/WorkflowPage';
import DocumentList from '@/pages/documents/DocumentList';
import KasMine from '@/pages/kas/KasMine';
import KasVerification from '@/pages/kas/KasVerification';
import SettingsPage from '@/pages/admin/SettingsPage';
import NotFound from '@/pages/errors/NotFound';
import Forbidden from '@/pages/errors/Forbidden';

export default function App() {
  return (
    <Routes>
      {/* ===== Publik (tanpa login) ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} /> {/* SCR-00 G */}
        <Route path="/calendar" element={<Kalender />} /> {/* SCR-08 I */}
        <Route path="/borrow" element={<FormPeminjaman />} /> {/* SCR-09 H */}
        <Route path="/transparansi" element={<Transparansi />} /> {/* SCR-15 J */}
        <Route path="/status" element={<CekStatus />} /> {/* SCR-43 H */}
      </Route>

      {/* ===== Satu URL untuk publik & pengurus ===== */}
      <Route path="/liturgy/schedule" element={<SharedRoute internal={<LiturgySchedule />} publik={<JadwalIbadah />} />} /> {/* SCR-25 C/J */}
      <Route path="/events" element={<SharedRoute internal={<EventList />} publik={<DaftarKegiatan />} />} /> {/* SCR-27 B */}
      <Route path="/events/:id/participants" element={<SharedRoute internal={<EventRegistrations />} publik={<DaftarKegiatan />} />} /> {/* SCR-28 A/H */}
      <Route path="/pastoral/intentions" element={<SharedRoute roles={['Pastor', 'Liturgi']} internal={<MassIntentions />} publik={<FormIntensi />} />} /> {/* SCR-34 C/H */}
      <Route path="/pastoral/care" element={<SharedRoute roles={['Pastor']} internal={<PastoralCares />} publik={<FormPastoral />} />} /> {/* SCR-35 C/H */}

      <Route path="/login" element={<Login />} /> {/* SCR-01 K */}

      {/* ===== Wajib login ===== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/password/change" element={<ChangePassword />} /> {/* SCR-02 K */}

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} /> {/* SCR-03 F */}
          <Route path="/dashboard/overview" element={<Overview />} /> {/* SCR-39 F */}
          <Route path="/notifications" element={<NotificationList />} /> {/* SCR-18 A */}

          {/* Sarana Prasarana */}
          <Route path="/assets" element={<AssetList />} /> {/* SCR-05 A */}
          <Route path="/assets/:id" element={<AssetDetail />} /> {/* SCR-07 E */}
          <Route path="/usage/report" element={<UsageReport />} /> {/* SCR-11 D */}
          <Route path="/maintenance" element={<MaintenanceList />} /> {/* SCR-12 B */}
          <Route path="/incidents" element={<IncidentList />} /> {/* SCR-13 B */}
          <Route path="/reports" element={<InventoryReport />} /> {/* SCR-16 F */}
          <Route path="/committees" element={<CommitteeList />} /> {/* SCR-17 B */}
          <Route element={<RoleRoute roles={['Sarpras']} />}>
            <Route path="/assets/create" element={<AssetForm />} /> {/* SCR-06 D */}
            <Route path="/assets/:id/edit" element={<AssetForm />} /> {/* SCR-06 D */}
            <Route path="/assets/labels" element={<AssetLabels />} /> {/* SCR-20 E */}
            <Route path="/stocktake" element={<StocktakeList />} /> {/* SCR-14 A */}
          </Route>
          <Route element={<RoleRoute roles={['Sarpras', 'PHT']} />}>
            <Route path="/admin/loans" element={<LoanList />} /> {/* SCR-10 C */}
            <Route path="/admin/audit-logs" element={<AuditLog />} /> {/* SCR-19 C */}
          </Route>

          {/* Keumatan & Organisasi */}
          <Route element={<RoleRoute roles={['PHT', 'Pastor']} />}>
            <Route path="/members" element={<MemberList />} /> {/* SCR-21 B */}
            <Route path="/members/:id/records" element={<MemberDetail />} /> {/* SCR-22 E */}
          </Route>
          <Route path="/admin/periods" element={<OrganizationPage />} /> {/* SCR-23 B */}
          <Route path="/handover" element={<HandoverPage />} /> {/* SCR-24 E */}

          {/* Liturgi & Kegiatan */}
          <Route element={<RoleRoute roles={['Liturgi', 'PHT', 'Pastor']} />}>
            <Route path="/liturgy/assignments" element={<LiturgyAssignments />} /> {/* SCR-26 A */}
          </Route>
          <Route path="/events/:id/lpj" element={<EventLpj />} /> {/* SCR-29 E */}

          {/* Keuangan */}
          <Route element={<RoleRoute roles={['Bendahara', 'PHT']} />}>
            <Route path="/finance/donations" element={<DonationPage />} /> {/* SCR-30 B */}
            <Route path="/finance/cash" element={<CashPage />} /> {/* SCR-31 B */}
            <Route path="/finance/reports" element={<FinanceReport />} /> {/* SCR-33 F */}
            <Route path="/finance/dues/verify" element={<KasVerification />} /> {/* SCR-41 C */}
          </Route>
          <Route element={<RoleRoute roles={['Bendahara', 'Sarpras', 'PHT']} />}>
            <Route path="/finance/loan-payments" element={<LoanPayments />} /> {/* SCR-32 D */}
          </Route>
          <Route element={<RoleRoute roles={['Sarpras', 'PHT', 'Liturgi', 'Bendahara']} />}>
            <Route path="/finance/dues" element={<KasMine />} /> {/* SCR-40 D */}
          </Route>

          {/* Administrasi */}
          <Route element={<RoleRoute roles={['Sarpras', 'PHT', 'Liturgi', 'Pastor']} />}>
            <Route path="/announcements" element={<AnnouncementList />} /> {/* SCR-36 B */}
          </Route>
          <Route path="/documents" element={<DocumentList />} /> {/* SCR-38 B */}
          <Route element={<RoleRoute roles={['PHT']} />}>
            <Route path="/admin/workflows" element={<WorkflowPage />} /> {/* SCR-37 A */}
          </Route>
            <Route element={<RoleRoute roles={['Admin']} />}>
            <Route path="/admin/users" element={<UserList />} />
          </Route>
          <Route element={<RoleRoute roles={['Bendahara']} />}>
            <Route path="/admin/settings" element={<SettingsPage />} /> {/* SCR-42 D */}
          </Route>
        </Route>
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
