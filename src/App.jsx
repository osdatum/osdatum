import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ScrollToTop from './components/ScrollToTop';
import { startTokenExpirationCheck } from './utils/auth';

import Home from './pages/Home';
import Navdrop from "./components/Navdrop";
import Maps from './pages/Maps';
import About from './pages/About';
import Datum from './pages/Datum';
import DatumData from './pages/DatumData';
import Login from './pages/Login';
import User from './pages/User';
import Register from './pages/Register';
import Footer from './components/Footer';
import SubscriptionPage from './pages/Subscription';
import { AuthProvider } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust timeout as needed
  }, []);

  useEffect(() => {
    // Start checking token expiration
    startTokenExpirationCheck();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <ScrollToTop />
      <Navdrop />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services/map" element={<Maps />} />
        <Route path="/services/datum" element={<Datum />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/register" element={<Register />} />
        <Route path="/datum-data" element={<DatumData />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
      </Routes>
      <Footer />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AuthProvider>
  )
}

export default App;