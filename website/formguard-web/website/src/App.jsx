import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HardwareModal from './components/HardwareModal';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OledGuidePage from './pages/OledGuidePage';
import WearGuidePage from './pages/WearGuidePage';
import CalibrationPage from './pages/CalibrationPage';
import WorkoutPage from './pages/WorkoutPage';
import HistoryPage from './pages/HistoryPage';

import { INITIAL_USER, INITIAL_HISTORY_SESSIONS } from './data/mockData';
import { hardwareManager } from './services/bleService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  
  // Hardware status state
  const [hardwareStatus, setHardwareStatus] = useState({
    isConnected: false,
    type: 'none', // 'ble' | 'wifi' | 'simulated'
    deviceName: '',
  });

  // User State (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('formguard_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Workout History State (persisted in localStorage)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('formguard_sessions');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY_SESSIONS;
    } catch {
      return INITIAL_HISTORY_SESSIONS;
    }
  });

  // Calibration Baseline State
  const [calibratedBaseline, setCalibratedBaseline] = useState(null);

  // Hardware Status Listener
  useEffect(() => {
    hardwareManager.onStatusChange((status) => {
      setHardwareStatus(status);
    });
  }, []);

  // Save User profile updates
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('formguard_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('formguard_user', JSON.stringify(user));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('formguard_user');
    } catch (e) {
      console.warn("Storage remove failed", e);
    }
    setActiveTab('home');
  };

  // Save Workout Session
  const handleSaveSession = (newSession) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    try {
      localStorage.setItem('formguard_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  // Delete Workout Session
  const handleDeleteSession = (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    try {
      localStorage.setItem('formguard_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  const handleCalibrationComplete = (baseline) => {
    setCalibratedBaseline(baseline);
  };

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        hardwareStatus={hardwareStatus}
        onLogout={handleLogout}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            hardwareStatus={hardwareStatus}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            onLogin={handleLogin}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'oled-guide' && (
          <OledGuidePage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'wear-guide' && (
          <WearGuidePage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'calibration' && (
          <CalibrationPage
            hardwareStatus={hardwareStatus}
            onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            setActiveTab={setActiveTab}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutPage
            currentUser={currentUser}
            hardwareStatus={hardwareStatus}
            onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            onSaveSession={handleSaveSession}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Hardware Connection Modal (ESP32 BLE / WiFi / Simulator) */}
      <HardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        hardwareStatus={hardwareStatus}
      />

      {/* Project Footer with Team Members and Specs */}
      <Footer />

    </div>
  );
}
