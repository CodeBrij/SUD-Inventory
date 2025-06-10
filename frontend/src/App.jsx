import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage.jsx';
// import SignUpPage from './pages/SignupPage.jsx';
import './App.css';
import InventoryManagement from './pages/HomePage.jsx';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import SetupPassword from './pages/SetupPassword.jsx';
import AddUsers from './pages/AddUsers.jsx';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, []);

  console.log("Authentication User" + JSON.stringify(authUser));

  if (isCheckingAuth === true) {
    // If checking auth is in progress, show a loader
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <Routes>
        <Route path='/' element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />}></Route>
        {/* <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/dashboard" />}></Route> */}
        <Route path='/dashboard' element={authUser ? <InventoryManagement /> : <Navigate to="/" />}></Route>
        <Route path="/setup-password/:token" element={<SetupPassword />} />
        <Route path="/add-user" element={<AddUsers />} />

      </Routes>

      <Toaster />
    </div>
  )
}

export default App
