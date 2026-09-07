import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import OnboardingRequiredRoute from "./components/OnboardingRequiredRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import AccountPage from "./pages/AccountPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import DoctorApplicationPage from "./pages/DoctorApplicationPage";
import FeaturePage from "./pages/FeaturePage";
import HealthArticlesPage from "./pages/HealthArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutPage from "./pages/AboutPage";
import HealthcarePage from "./pages/HealthcarePage";
import HealthcareDetailsPage from "./pages/HealthcareDetailsPage";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LocationProvider>
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
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<OnboardingRequiredRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route
                    path="/doctor-dashboard"
                    element={<DoctorDashboardPage />}
                  />

                  <Route
                    path="/apply-as-doctor"
                    element={<DoctorApplicationPage />}
                  />

                  <Route path="/account" element={<AccountPage />} />

                  <Route
                    path="/doctors"
                    element={
                      <FeaturePage
                        eyebrow="Care directory"
                        title="Find a doctor"
                        description="Browse approved clinicians, compare available services and book an appointment."
                        action={{
                          label: "View my appointments",
                          to: "/appointments",
                        }}
                      />
                    }
                  />

                  <Route
                    path="/appointments"
                    element={
                      <FeaturePage
                        eyebrow="Your care plan"
                        title="Appointments"
                        description="Your upcoming and previous appointments will be listed here as you book care."
                        action={{
                          label: "Find a doctor",
                          to: "/doctors",
                        }}
                      />
                    }
                  />

                  <Route
                    path="/records"
                    element={
                      <FeaturePage
                        eyebrow="Health information"
                        title="Medical records"
                        description="Your verified records, test results and visit documents will appear here."
                      />
                    }
                  />
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
