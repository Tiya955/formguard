import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Save, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hardwareManager } from '../services/bleService';
import OledSimulator from '../components/OledSimulator';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler);

export default function WorkoutPage({ hardwareStatus, onSaveSession, setActiveTab, currentUser }) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [repCount, setRepCount] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [badReps, setBadReps] = useState(0);
  const [liveFlexion, setLiveFlexion] = useState(0);
  const [peakFlexion, setPeakFlexion] = useState(0);
  const [repHistory, setRepHistory] = useState([]); // one entry per rep, for the live graph
  const [notes, setNotes] = useState('');
  const [liveValgus, setLiveValgus] = useState(0);
  const [liveTilt, setLiveTilt] = useState(0);
  const [liveFatigue, setLiveFatigue] = useState(0);
  const [buzzer, setBuzzer] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [debugData, setDebugData] = useState('No data yet. Do a squat!');

  const prevRepRef = useRef(0);
  const sessionActiveRef = useRef(false);
  const buzzerTimerRef = useRef(null);

  useEffect(() => {
    sessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  // Session timer
  useEffect(() => {
    let timer = null;
    if (isSessionActive) timer = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Receive data from ESP32
  useEffect(() => {
    hardwareManager.onData((data) => {
      setDebugData(JSON.stringify(data));

      // Rep JSON arrives wrapped as { repData: {...} }
      const d = data.repData;
      if (!d) return;

      if (d.rep !== undefined && d.rep > prevRepRef.current) {
        prevRepRef.current = d.rep;
        setRepCount(d.rep);
        const bad = d.badReps ?? 0;
        setBadReps(bad);
        setGoodReps(d.rep - bad);
        setRepHistory((h) => [
          ...h,
          { rep: d.rep, flexion: d.flexion ?? 0, fatigue: d.fatigue ?? 0, bad: !!d.badForm },
        ]);

        if (d.badForm) {
          setBuzzer(true);
          clearTimeout(buzzerTimerRef.current);
          buzzerTimerRef.current = setTimeout(() => setBuzzer(false), 800);
        }
      }
      if (d.flexion !== undefined) {
        setLiveFlexion(d.flexion);
        setPeakFlexion((p) => Math.max(p, d.flexion));
      }
      if (d.valgus !== undefined) setLiveValgus(d.valgus);
      if (d.tilt !== undefined) setLiveTilt(d.tilt);
      if (d.fatigue !== undefined) setLiveFatigue(d.fatigue);
    });

    return () => {
      hardwareManager.onData(null);
      clearTimeout(buzzerTimerRef.current);
    };
  }, []);

  const resetMetrics = () => {
    setElapsedSeconds(0);
    setRepCount(0);
    setGoodReps(0);
    setBadReps(0);
    setLiveFlexion(0);
    setPeakFlexion(0);
    setRepHistory([]);
    setNotes('');
    setLiveValgus(0);
    setLiveTilt(0);
    setLiveFatigue(0);
    prevRepRef.current = 0;
  };

  // Auto-start right after calibration (ESP32 is already monitoring, so no commands needed)
  useEffect(() => {
    if (hardwareManager.autoStartWorkout) {
      hardwareManager.autoStartWorkout = false;
      resetMetrics();
      setIsSessionActive(true);
      setDebugData('Calibration done. Counting reps, do a squat!');
    }
  }, []);

  // Manual start: reset ESP32 counters, then start monitoring (calibration baseline is kept)
  const handleStartSession = () => {
    resetMetrics();
    setIsSessionActive(true);
    setDebugData('Session started. Waiting for hardware...');

    if (hardwareManager.isConnected) {
      hardwareManager.sendCommand('RESET');
      setTimeout(() => hardwareManager.sendCommand('START_WORKOUT'), 500);
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setIsSummaryOpen(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (hardwareManager.isConnected) hardwareManager.sendCommand('RESET'); // ESP32 back to idle
  };

  const handleSave = () => {
    const summary = {
      id: `sess_${Date.now()}`,
      date: new Date().toISOString(),
      exercise: 'Squats',
      duration: elapsedSeconds,
      reps: repCount,
      goodReps,
      badReps,
      formScore: repCount > 0 ? Math.round((goodReps / repCount) * 100) : 0,
      peakFlexion: Math.round(peakFlexion),
      avgFatigue: liveFatigue,
      notes: notes.trim(),
    };
    onSaveSession(summary);
    resetMetrics();
    setIsSummaryOpen(false);
    setActiveTab('history');
  };

  // Close the summary WITHOUT saving anything to history
  const handleDiscard = () => {
    setIsSummaryOpen(false);
    resetMetrics();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formScore = repCount > 0 ? Math.round((goodReps / repCount) * 100) : 100;

  // ---- Live graph (one point per rep) ----
  const graphData = {
    labels: repHistory.map((r) => `Rep ${r.rep}`),
    datasets: [
      {
        label: 'Peak Flexion (°)',
        data: repHistory.map((r) => r.flexion),
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: repHistory.map((r) => (r.bad ? '#f43f5e' : '#2dd4bf')),
        pointBorderColor: repHistory.map((r) => (r.bad ? '#f43f5e' : '#2dd4bf')),
        yAxisID: 'y',
      },
      {
        label: 'Fatigue (%)',
        data: repHistory.map((r) => r.fatigue),
        borderColor: '#f97316',
        borderDash: [6, 4],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: 'y1',
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { position: 'top', labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#2dd4bf',
        bodyColor: '#ffffff',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          afterBody: (items) => {
            const r = repHistory[items[0].dataIndex];
            return r && r.bad ? '⚠ Compensating (bad form)' : '✓ Good rep';
          },
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: {
        position: 'left',
        min: 0,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#2dd4bf', font: { size: 10 }, callback: (v) => `${v}°` },
      },
      y1: {
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { color: '#f97316', font: { size: 10 }, callback: (v) => `${v}%` },
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Workout</h1>
          <p className="text-sm text-slate-400">
            User: {currentUser?.name || 'Athlete'} • Time: {formatTime(elapsedSeconds)}
          </p>
        </div>

        {!isSessionActive ? (
          <button onClick={handleStartSession} className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl flex items-center gap-2">
            <Play size={18} /> Start Session
          </button>
        ) : (
          <button onClick={handleEndSession} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl flex items-center gap-2 animate-pulse">
            <Square size={18} /> End & Save
          </button>
        )}
      </div>

      {/* Raw data box */}
      <div className="p-4 bg-slate-950 border border-slate-700 rounded-xl">
        <p className="text-xs text-teal-400 font-mono font-bold mb-1 flex items-center gap-2">
          <Cpu size={14} /> RAW DATA FROM ESP32:
        </p>
        <p className="text-sm text-white font-mono break-all">{debugData}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-sm text-slate-400">Total Reps</span>
          <div className="text-4xl font-black text-white mt-2">{repCount}</div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-sm text-slate-400">Form Score</span>
          <div className="text-4xl font-black text-emerald-400 mt-2">{formScore}%</div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-sm text-slate-400">Peak Flexion</span>
          <div className="text-4xl font-black text-teal-400 mt-2">{liveFlexion.toFixed(1)}°</div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-sm text-slate-400">Fatigue</span>
          <div className="text-4xl font-black text-orange-400 mt-2">{liveFatigue}%</div>
        </div>
      </div>

      {/* OLED mirror */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center">
          <span className="text-xs font-mono text-teal-400 font-bold mb-3 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> OLED Mirror
          </span>
          <OledSimulator
            mode={isSessionActive || repCount > 0 ? 'REP' : 'IDLE'}
            repCount={repCount}
            angle={liveFlexion}
            valgus={liveValgus}
            tilt={liveTilt}
            fatigue={liveFatigue}
            isBle={hardwareStatus.isConnected}
            isBuzzerActive={buzzer}
          />
        </div>

        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Live Rep Graph</h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Bad form</span>
            </div>
          </div>

          {repHistory.length > 0 ? (
            <div className="flex-1 min-h-[260px]">
              <Line data={graphData} options={graphOptions} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-1">
              <p className="text-sm">Waiting for your first rep...</p>
              <p className="text-xs">Each squat adds a point showing your peak flexion and fatigue.</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary modal */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 p-8 rounded-3xl max-w-md w-full space-y-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white text-center">Session Complete!</h2>
            <div className="flex justify-between text-slate-300">
              <span>Total Reps:</span> <span className="font-bold text-white">{repCount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Form Score:</span> <span className="font-bold text-emerald-400">{formScore}%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Peak Flexion:</span> <span className="font-bold text-teal-300">{Math.round(peakFlexion)}°</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={2}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
            <button onClick={handleSave} className="w-full py-3 bg-teal-500 text-black font-bold rounded-xl flex items-center justify-center gap-2">
              <Save size={18} /> Save & Exit
            </button>
            <button onClick={handleDiscard} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl">
              Discard (don't save)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
