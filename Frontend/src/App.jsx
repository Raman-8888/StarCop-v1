import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
  return (
    <AuthProvider>
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
          <Route path="/opportunities/:id" element={<OpportunityDetails />} />

          {/* 3. Wrap all routes that SHOULD have the Navbar inside the MainLayout route */}
          <Route path="/chat" element={<Chat />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* Profile routes moved out to disable Navbar */}
            {/* You can add other routes like /profile, /chat, etc. here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
