import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import DoctorWorkspaceLayout from "./layouts/DoctorWorkspaceLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import PatientDashboardRoute from "./components/PatientDashboardRoute";
import GuestRoute from "./components/GuestRoute";
import OnboardingRequiredRoute from "./components/OnboardingRequiredRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import DashboardPage from "./features/patients/pages/DashboardPage";
import MedicalRecordsPage from "./features/patients/pages/MedicalRecordsPage";
import OnboardingPage from "./features/patients/pages/OnboardingPage";
import DoctorDashboardPage from "./features/doctors/pages/DoctorDashboardPage";
import DoctorProfessionalProfilePage from "./features/doctors/pages/DoctorProfessionalProfilePage";
import DoctorApplicationPage from "./features/doctors/pages/DoctorApplicationPage";
import HealthArticlesPage from "./features/articles/pages/HealthArticlesPage";
import ArticlePage from "./features/articles/pages/ArticlePage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutPage from "./pages/AboutPage";
import HealthcarePage from "./features/facilities/pages/HealthcarePage";
import HealthcareDetailsPage from "./features/facilities/pages/HealthcareDetailsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import DoctorsPage from "./features/doctors/pages/DoctorsPage";
import DoctorProfilePage from "./features/doctors/pages/DoctorProfilePage";
import BookAppointmentPage from "./features/appointments/pages/BookAppointmentPage";
import AppointmentsPage from "./features/appointments/pages/AppointmentsPage";
import AppointmentDetailPage from "./features/appointments/pages/AppointmentDetailPage";
import DoctorAppointmentsPage from "./features/appointments/pages/DoctorAppointmentsPage";
import FAQPage from "./pages/FAQPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import MedicinesPage from "./features/medicines/pages/MedicinesPage";
import MedicineDetailsPage from "./features/medicines/pages/MedicineDetailsPage";
import DoctorApplicationsPage from "./features/admin/pages/DoctorApplicationsPage";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LocationProvider>
          <ScrollToTop />
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/health-articles" element={<HealthArticlesPage />} />
              <Route path="/health-articles/:slug" element={<ArticlePage />} />
              <Route path="/healthcare" element={<HealthcarePage />} />
              <Route
                path="/healthcare/:placeId"
                element={<HealthcareDetailsPage />}
              />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route
                path="/medicines/:id"
                element={<MedicineDetailsPage />}
              />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
            </Route>

            {/* Authentication */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
            </Route>

            {/* Protected application */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedRoleRoute role="ADMIN" />}>
                <Route element={<AppLayout />}>
                  <Route
                    path="/admin/doctor-applications"
                    element={<DoctorApplicationsPage />}
                  />
                </Route>
              </Route>

              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<OnboardingRequiredRoute />}>
                <Route element={<AppLayout />}>
                  <Route element={<PatientDashboardRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Route>
                  <Route
                    element={
                      <ProtectedRoleRoute
                        role="PATIENT"
                        requireNoDoctorApplication
                      />
                    }
                  >
                    <Route
                      path="/apply-as-doctor"
                      element={<DoctorApplicationPage />}
                    />
                  </Route>
                  <Route path="/account" element={<AccountSettingsPage />} />
                  <Route path="/doctors" element={<DoctorsPage />} />
                  <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                  <Route
                    path="/doctors/:id/book"
                    element={<BookAppointmentPage />}
                  />

                  <Route
                    path="/appointments"
                    element={<AppointmentsPage />}
                  />
                  <Route
                    path="/appointments/:id"
                    element={<AppointmentDetailPage />}
                  />
                  <Route
                    path="/records"
                    element={<MedicalRecordsPage />}
                  />
                </Route>
                <Route element={<ProtectedRoleRoute role="DOCTOR" />}>
                  <Route element={<DoctorWorkspaceLayout />}>
                    <Route
                      path="/doctor-dashboard"
                      element={<DoctorDashboardPage />}
                    />
                    <Route
                      path="/doctor-dashboard/profile"
                      element={<DoctorProfessionalProfilePage />}
                    />
                    <Route
                      path="/doctor-dashboard/appointments"
                      element={<DoctorAppointmentsPage />}
                    />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </LocationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
