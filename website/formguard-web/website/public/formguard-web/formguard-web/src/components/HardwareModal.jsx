import React, { useState } from 'react';
import { Bluetooth, Wifi, Cpu, X, CheckCircle, AlertTriangle, Play, Power, HelpCircle } from 'lucide-react';
import { hardwareManager } from '../services/bleService';

export default function HardwareModal({ isOpen, onClose, hardwareStatus }) {
  const [wifiUrl, setWifiUrl] = useState('ws://192.168.4.1:81');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnectBLE = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await hardwareManager.connectBLE();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Bluetooth connection failed or was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWiFi = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await hardwareManager.connectWiFi(wifiUrl);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to connect to ESP32 WebSocket. Ensure your PC is connected to the same Wi-Fi or ESP32 SoftAP.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSim = () => {
    hardwareManager.startSimulator();
    onClose();
  };

  const handleDisconnect = () => {
    hardwareManager.disconnect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ESP32 Hardware Link</h2>
              <p className="text-xs text-slate-400">Bluetooth BLE 4.2/5.0 & Wi-Fi WebSocket Bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                hardwareStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            ></span>
            <span className="text-sm font-medium text-slate-200">
              {hardwareStatus.isConnected
                ? `Connected (${hardwareStatus.type.toUpperCase()})`
                : 'No Hardware Connected'}
            </span>
          </div>
          {hardwareStatus.isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-xs px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/50 flex items-center gap-1"
            >
              <Power className="w-3 h-3" /> Disconnect
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Connection Options */}
        <div className="mt-5 space-y-4">
          {/* Option 1: Web Bluetooth (Recommended for Wireless) */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-sm text-white">Option 1: Web Bluetooth (Direct BLE)</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                Low Latency
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Pairs directly from Chrome or Edge to your ESP32's Nordic UART Service without installing any local drivers.
            </p>
            <button
              onClick={handleConnectBLE}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition cursor-pointer"
            >
              <Bluetooth className="w-4 h-4" />
              {loading ? 'Scanning for FormGuard...' : 'Scan & Pair ESP32 Bluetooth'}
            </button>
          </div>

          {/* Option 2: Wi-Fi WebSocket Stream */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-sm text-white">Option 2: Wi-Fi WebSocket</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                IP Network
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Connect if your ESP32 is running a WebSocket server on your local Wi-Fi or SoftAP.
            </p>
            <form onSubmit={handleConnectWiFi} className="flex gap-2">
              <input
                type="text"
                value={wifiUrl}
                onChange={(e) => setWifiUrl(e.target.value)}
                placeholder="ws://192.168.4.1:81"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-teal-300 focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Connect
              </button>
            </form>
          </div>

          {/* Option 3: Virtual Hardware Simulator */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-800/60 border border-teal-500/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">Option 3: Virtual IMU Simulator</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Instant Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Test calibration, live rep graphs, buzzer sounds, and knee valgus alerts right now without any physical board!
            </p>
            <button
              onClick={handleStartSim}
              className="w-full py-2 px-3 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" /> Launch Hardware Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
