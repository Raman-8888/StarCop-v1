import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster, toast } from 'react-hot-toast';
import Home from "./pages/Home";
import Login from './pages/Login';
import Navbar from './components/Layout/Navbar';
import Chat from './pages/Chat';
import Signup from './pages/SignUp';
import CompleteProfileStartup from './pages/CompleteProfileStartup';
import CompleteProfileInvestor from './pages/CompleteProfileInvestor';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';


import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import SavedOpportunitiesView from './pages/SavedOpportunitiesView';
import StartupDashboard from './pages/StartupDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import Notifications from './pages/Notifications';
import DigitalPass from './pages/DigitalPass';
import CreateOpportunity from './components/CreateOpportunity';
import ProtectedRoute from './components/ProtectedRoute';
import { API_URL } from './config';


//    The <Outlet /> component will render the child route's element (e.g., <Home />).
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  useEffect(() => {
    // Firebase logic removed in favor of Native Notifications via NotificationContext
  }, []);

  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#111',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#111',
            },
          },
        }}
      />
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* 2. Routes that should NOT have the Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/complete-profile/startup" element={<CompleteProfileStartup />} />
            <Route path="/complete-profile/investor" element={<CompleteProfileInvestor />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:username" element={<Profile />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/saved" element={<SavedOpportunitiesView />} />
            <Route path="/opportunities/:id" element={<OpportunityDetails />} />
            <Route path="/dashboard" element={<StartupDashboard />} />
            <Route path="/investor-dashboard" element={<InvestorDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/digital-pass/:username" element={<DigitalPass />} />

            {/* 3. Wrap all routes that SHOULD have the Navbar inside the MainLayout route */}
            <Route path="/chat" element={<Chat />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              {/* Profile routes moved out to disable Navbar */}
              {/* You can add other routes like /profile, /chat, etc. here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
