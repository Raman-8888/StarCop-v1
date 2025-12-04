import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from "./pages/Home";
import Login from './pages/Login';
import Navbar from './components/Layout/Navbar';
import Chat from './pages/Chat';
import Signup from './pages/SignUp';

// 1. Create a Layout component that includes the Navbar.
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
          {/* 3. Wrap all routes that SHOULD have the Navbar inside the MainLayout route */}
          <Route path="/Signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* You can add other routes like /profile, /chat, etc. here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
