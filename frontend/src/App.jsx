import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignupPage';
import './App.css';
import InventoryManagement from './pages/HomePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import SetupPassword from './pages/SetupPassword';
import FileUpload from './pages/FileUpload';

function App() {
  // const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth]);

  // console.log("app se bol raha" + authUser);

  // if (isCheckingAuth && !authUser) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Loader className="size-10 animate-spin" />
  //     </div>
  //   );
  // }
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<LoginPage />}
        />
        <Route path='/signup' element={<SignUpPage />}></Route>
        <Route path='/dashboard' element={<InventoryManagement />}></Route>
        <Route path="/setup-password/:token" element={<SetupPassword />} />
        <Route path="/file-upload" element={<FileUpload />} />

      </Routes>

      <Toaster />
    </div>
  )
}

export default App
