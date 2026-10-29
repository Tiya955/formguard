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
import { getWorkouts, deleteWorkout, clearWorkouts } from "./services/workoutStorage";
import { INITIAL_USER } from './data/mockData'; // demo sessions are no longer imported
import { hardwareManager } from './services/bleService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);

  // Hardware status state
  const [hardwareStatus, setHardwareStatus] = useState({
    isConnected: false,
    type: 'none',
    deviceName: '',
  });

  // User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('formguard_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch { return INITIAL_USER; }
  });

  // Workout History State: starts EMPTY, only contains workouts the user saved
  const [sessions, setSessions] = useState(() => getWorkouts());

  const [calibratedBaseline, setCalibratedBaseline] = useState(null);

  // Hardware Status Listener
  useEffect(() => {
    if (hardwareManager && typeof hardwareManager.onStatusChange === 'function') {
      hardwareManager.onStatusChange((status) => {
        setHardwareStatus(status);
      });
    }
  }, []);

  // Persist sessions whenever they change
  useEffect(() => {
    try { localStorage.setItem('formguard_sessions', JSON.stringify(sessions)); } catch (e) {}
  }, [sessions]);

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    try { localStorage.setItem('formguard_user', JSON.stringify(updatedUser)); } catch (e) {}
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try { localStorage.setItem('formguard_user', JSON.stringify(user)); } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem('formguard_user'); } catch (e) {}
    setActiveTab('home');
  };

  const handleSaveSession = (newSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleDeleteSession = (id) => {
  deleteWorkout(id);
  setSessions(prev => prev.filter(s => s.id !== id));
};

  const handleClearAll = () => {
    setSessions([]);
  };

  const handleCalibrationComplete = (baseline) => {
    setCalibratedBaseline(baseline);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        hardwareStatus={hardwareStatus}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomePage setActiveTab={setActiveTab} onOpenHardwareModal={() => setIsHardwareModalOpen(true)} hardwareStatus={hardwareStatus} />
        )}
        {activeTab === 'auth' && (
          <AuthPage onLogin={handleLogin} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'oled-guide' && (
          <OledGuidePage setActiveTab={setActiveTab} />
        )}
        {activeTab === 'wear-guide' && (
          <WearGuidePage setActiveTab={setActiveTab} />
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
            onClearAll={handleClearAll}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <HardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        hardwareStatus={hardwareStatus}
      />

      <Footer />
    </div>
  );
}
