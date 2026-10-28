import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Tv, 
  Compass, 
  PlayCircle, 
  BarChart3, 
  Cpu, 
  User, 
  Menu, 
  X, 
  Bluetooth, 
  Wifi, 
  LogOut,
  Download
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenHardwareModal, 
  hardwareStatus,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: ShieldCheck },
    { id: 'oled-guide', label: 'OLED Guide', icon: Tv },
    { id: 'wear-guide', label: 'Wear & Setup', icon: Compass },
    { id: 'calibration', label: 'Calibration', icon: Activity },
    { id: 'workout', label: 'Live Workout', icon: PlayCircle },
    { id: 'history', label: 'Progress & History', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Form<span className="text-teal-400">Guard</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Dual IMU
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Smart Wearable Posture & Joint Monitor</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action: Hardware Pill & User */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Download Project ZIP */}
            <a
              href="/formguard-web.zip"
              download="formguard-web.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 hover:border-teal-500/50 transition cursor-pointer"
              title="Download Full Project ZIP"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Download ZIP</span>
            </a>

            {/* Hardware Status Button */}
            <button
              onClick={onOpenHardwareModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition cursor-pointer ${
                hardwareStatus.isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500/60 hover:text-teal-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hardwareStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              ></span>
              <span className="hidden md:inline">
                {hardwareStatus.isConnected
                  ? `ESP32: ${hardwareStatus.type.toUpperCase()}`
                  : 'Link ESP32'}
              </span>
              {hardwareStatus.type === 'ble' && <Bluetooth className="w-3.5 h-3.5 text-blue-400" />}
              {hardwareStatus.type === 'wifi' && <Wifi className="w-3.5 h-3.5 text-teal-400" />}
              {hardwareStatus.type === 'simulated' && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
                  title="View Health Profile & Medical History"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                    {currentUser.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-teal-400 leading-none mt-0.5">{currentUser.fitnessLevel || 'Athlete'}</p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={onOpenHardwareModal}
              className="p-2 rounded-lg bg-slate-900 text-teal-400 border border-slate-800"
            >
              <Cpu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-teal-300 font-semibold flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> {currentUser.name} (Medical Profile)
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-400 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center bg-teal-600 text-white rounded-lg text-xs font-bold"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
