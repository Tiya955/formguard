import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hardwareManager } from '../services/bleService';

export default function CalibrationPage({ hardwareStatus, setActiveTab, onCalibrationComplete }) {
  const [calibState, setCalibState] = useState('idle'); // idle | running | completed
  const [currentRep, setCurrentRep] = useState(0);
  const [notice, setNotice] = useState('');

  // Keep the latest callback without re-registering the BLE listener
  const completeCbRef = useRef(onCalibrationComplete);
  const setTabRef = useRef(setActiveTab);
  const navTimerRef = useRef(null);
  useEffect(() => {
    completeCbRef.current = onCalibrationComplete;
    setTabRef.current = setActiveTab;
  }, [onCalibrationComplete, setActiveTab]);

  useEffect(() => {
    hardwareManager.onData((data) => {
      console.log('Calibration Page received:', data);

      if (data.ack === 'START_CALIB') {
        setNotice('');
      }

      if (data.calibRep !== undefined) {
        setCurrentRep(data.calibRep);
        setCalibState('running');
      }

      if (data.calibDone) {
        setCalibState('completed');
        setCurrentRep(3);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        if (completeCbRef.current) completeCbRef.current({ depth: 90 });

        // ESP32 is already in monitoring mode, so just tell the workout page to auto-start
        hardwareManager.autoStartWorkout = true;
        navTimerRef.current = setTimeout(() => setTabRef.current('workout'), 2000);
      }
    });

    // Remove listener (and pending auto-navigation) when leaving the page
    return () => {
      hardwareManager.onData(null);
      clearTimeout(navTimerRef.current);
    };
  }, []);

  const handleStartCalibration = () => {
    if (!hardwareManager.isConnected) {
      setNotice('ESP32 is not connected. Connect via Bluetooth first.');
      return;
    }
    setNotice('');
    setCalibState('running');
    setCurrentRep(0);
    hardwareManager.sendCommand('START_CALIB');
  };

  const handleReset = () => {
    setCalibState('idle');
    setCurrentRep(0);
    setNotice('');
    hardwareManager.sendCommand('RESET'); // puts ESP32 back to IDLE
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-white">3-Rep Calibration</h1>
        {calibState === 'running' ? (
          <p className="text-teal-300 text-lg font-semibold animate-pulse">
            Do 3 slow reps for calibration ({currentRep}/3 done)
          </p>
        ) : (
          <p className="text-slate-400">Do 3 slow squats to set your baseline.</p>
        )}

        <div className="flex justify-center gap-6 my-10">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 transition-all duration-300
              ${
                currentRep >= step
                  ? 'bg-teal-500 border-teal-400 text-black scale-110 shadow-lg shadow-teal-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {currentRep >= step ? <CheckCircle2 size={40} /> : step}
            </div>
          ))}
        </div>

        {notice && <p className="text-amber-400 text-sm">{notice}</p>}

        {calibState === 'idle' && (
          <button
            onClick={handleStartCalibration}
            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition"
          >
            <Play size={20} /> Start Calibration
          </button>
        )}

        {calibState === 'running' && (
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-2 mx-auto transition"
          >
            <RotateCcw size={20} /> Cancel / Reset
          </button>
        )}

        {calibState === 'completed' && (
          <button
            onClick={() => {
              // Skip the 2-second wait; ESP32 is already monitoring
              clearTimeout(navTimerRef.current);
              hardwareManager.autoStartWorkout = true;
              setActiveTab('workout');
            }}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition animate-bounce"
          >
            Proceed to Workout <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
