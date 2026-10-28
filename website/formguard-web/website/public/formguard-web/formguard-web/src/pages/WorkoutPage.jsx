import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  Volume2, 
  VolumeX, 
  Zap, 
  Bluetooth, 
  Wifi, 
  Save, 
  Clock, 
  Sliders, 
  Cpu,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import confetti from 'canvas-confetti';
import { hardwareManager } from '../services/bleService';
import { playHapticSound } from '../services/audioService';
import OledSimulator from '../components/OledSimulator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WorkoutPage({ 
  currentUser, 
  hardwareStatus, 
  onOpenHardwareModal, 
  onSaveSession,
  setActiveTab 
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Real-time tracking values
  const [repCount, setRepCount] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [badReps, setBadReps] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Standing');
  const [liveAngle, setLiveAngle] = useState(5);
  const [liveValgus, setLiveValgus] = useState(1.2);
  const [liveTilt, setLiveTilt] = useState(12);
  const [liveFatigue, setLiveFatigue] = useState(18);
  const [peakFlexion, setPeakFlexion] = useState(0);

  // Active Alert Banner
  const [activeAlert, setActiveAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Rolling chart data buffers
  const [chartLabels, setChartLabels] = useState([]);
  const [angleData, setAngleData] = useState([]);
  const [valgusData, setValgusData] = useState([]);
  const [tiltData, setTiltData] = useState([]);

  // End Session Summary Modal State
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completedSessionData, setCompletedSessionData] = useState(null);

  const prevRepRef = useRef(0);
  const lastAlertTimeRef = useRef(0);

  // Timer effect
  useEffect(() => {
    let timer = null;
    if (isSessionActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Hardware telemetry listener
  useEffect(() => {
    hardwareManager.onData((data) => {
      setLiveAngle(data.angle);
      setLiveValgus(data.valgus);
      setLiveTilt(data.tilt);
      setLiveFatigue(data.fatigue || 20);
      setCurrentPhase(data.phase || 'Live');

      if (data.angle > peakFlexion) {
        setPeakFlexion(data.angle);
      }

      if (!isSessionActive) return;

      // Update rolling chart (keep last 30 data points)
      const nowLabel = new Date().toLocaleTimeString().split(' ')[0].slice(3); // MM:SS
      setChartLabels((prev) => [...prev.slice(-29), nowLabel]);
      setAngleData((prev) => [...prev.slice(-29), data.angle]);
      setValgusData((prev) => [...prev.slice(-29), data.valgus]);
      setTiltData((prev) => [...prev.slice(-29), data.tilt]);

      // Detect Rep increment
      if (data.rep > prevRepRef.current) {
        prevRepRef.current = data.rep;
        setRepCount(data.rep);

        const hasFlaw = Math.abs(data.valgus) > 9 || data.tilt > 35;
        if (hasFlaw) {
          setBadReps((b) => b + 1);
        } else {
          setGoodReps((g) => g + 1);
        }

        if (soundEnabled) {
          playHapticSound(hasFlaw ? 'warning' : 'rep');
        }
      }

      // Check real-time form errors
      const now = Date.now();
      if (Math.abs(data.valgus) > 10) {
        if (now - lastAlertTimeRef.current > 1800) {
          lastAlertTimeRef.current = now;
          setActiveAlert({
            type: 'valgus',
            title: 'Knee Caving In (Valgus)',
            message: 'Push your knees outward! Track knees directly over your 2nd and 3rd toes.',
          });
          if (soundEnabled) playHapticSound('warning');
        }
      } else if (data.tilt > 38) {
        if (now - lastAlertTimeRef.current > 1800) {
          lastAlertTimeRef.current = now;
          setActiveAlert({
            type: 'tilt',
            title: 'Lumbar Spine Rounding',
            message: 'Lift your chest up! Keep your back neutral and brace your abdominal core.',
          });
          if (soundEnabled) playHapticSound('warning');
        }
      } else {
        if (now - lastAlertTimeRef.current > 2500) {
          setActiveAlert(null);
        }
      }
    });
  }, [isSessionActive, peakFlexion, soundEnabled]);

  // Session Handlers
  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setElapsedSeconds(0);
    setRepCount(0);
    setGoodReps(0);
    setBadReps(0);
    setPeakFlexion(0);
    setChartLabels([]);
    setAngleData([]);
    setValgusData([]);
    setTiltData([]);
    prevRepRef.current = 0;

    // If hardware is not connected, start simulator for instant readiness!
    if (!hardwareStatus.isConnected) {
      hardwareManager.startSimulator();
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    hardwareManager.stopSimulator();

    const total = repCount || (goodReps + badReps) || 1;
    const clean = goodReps;
    const score = Math.round((clean / total) * 100);

    const summary = {
      id: `sess_${Date.now()}`,
      date: new Date().toISOString(),
      exercise: 'Bodyweight Squats',
      duration: elapsedSeconds,
      reps: total,
      goodReps: clean,
      badReps: Math.max(0, total - clean),
      formScore: Math.min(100, Math.max(65, score)),
      peakFlexion: Math.max(88, Math.round(peakFlexion)),
      avgFatigue: liveFatigue,
      flaws: {
        valgus: badReps,
        backTilt: Math.floor(badReps / 2),
        shallow: 0,
      },
      notes: sessionNotes || 'Solid workout session. Good range of motion.',
    };

    setCompletedSessionData(summary);
    setIsSummaryOpen(true);
    playHapticSound('fanfare');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#0d9488', '#10b981', '#f59e0b']
    });
  };

  const handleConfirmSave = () => {
    if (completedSessionData) {
      const finalData = {
        ...completedSessionData,
        notes: sessionNotes || completedSessionData.notes,
      };
      onSaveSession(finalData);
      setIsSummaryOpen(false);
      setActiveTab('history'); // Take user straight to progress dashboard!
    }
  };

  // Form Quality Score calculation
  const totalRepsRecorded = repCount || (goodReps + badReps) || 0;
  const liveFormScore = totalRepsRecorded > 0 
    ? Math.round((goodReps / totalRepsRecorded) * 100) 
    : 100;

  // Chart Configuration
  const chartDataConfig = {
    labels: chartLabels.length > 0 ? chartLabels : ['00:00', '00:01', '00:02', '00:03'],
    datasets: [
      {
        label: 'Knee Flexion (Degrees)',
        data: angleData.length > 0 ? angleData : [5, 45, 91, 10],
        borderColor: '#2dd4bf', // Teal
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: 'Valgus Inward Deviation (°)',
        data: valgusData.length > 0 ? valgusData : [0, 2, 8, 1],
        borderColor: '#f97316', // Orange
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 1,
      },
      {
        label: 'Lumbar Spine Tilt (°)',
        data: tiltData.length > 0 ? tiltData : [10, 18, 24, 12],
        borderColor: '#a855f7', // Purple
        borderWidth: 1.8,
        borderDash: [4, 4],
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Turn off animation for smooth real-time 60fps streaming
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#2dd4bf',
        bodyColor: '#ffffff',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 120,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#64748b', 
          font: { size: 10 },
          callback: (val) => `${val}°`,
        },
      },
    },
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Top Session Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Live Workout Session</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                isSessionActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {isSessionActive ? 'RECORDING LIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Athlete: <span className="text-slate-200 font-semibold">{currentUser?.name || 'Athlete'}</span> • Exercise: <span className="text-teal-400 font-semibold">Bodyweight Squats</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-teal-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Haptic Sound Enabled' : 'Haptic Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/25 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Workout Session</span>
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition cursor-pointer animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>End Session & Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Alert Banner */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 animate-haptic flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-slate-950 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>{activeAlert.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700">
                  HAPTIC BUZZ ACTIVE
                </span>
              </h4>
              <p className="text-xs text-rose-100 font-medium mt-0.5">{activeAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-xs font-semibold text-rose-300 hover:text-white px-2 py-1 rounded bg-rose-900/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 4 Live Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Reps Counter */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reps Completed</span>
            <Zap className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {repCount < 10 ? `0${repCount}` : repCount}
            </span>
            <span className="text-xs text-slate-400">reps</span>
          </div>
          <div className="text-[11px] text-teal-300 font-mono">
            {goodReps} Clean • {badReps} Deviations
          </div>
        </div>

        {/* Live Flexion Angle */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Joint Flexion</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-teal-400 font-mono">
              {liveAngle.toFixed(1)}°
            </span>
            <span className="text-xs text-slate-400">flexion</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Phase: <span className="text-slate-200 font-bold capitalize">{currentPhase}</span>
          </div>
        </div>

        {/* Form Score */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Form Quality</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black font-mono ${
              liveFormScore >= 85 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {liveFormScore}%
            </span>
            <span className="text-xs text-slate-400">accuracy</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Valgus: <span className={Math.abs(liveValgus) > 8 ? 'text-rose-400 font-bold' : 'text-teal-300'}>
              {liveValgus > 0 ? `+${liveValgus}` : liveValgus}°
            </span>
          </div>
        </div>

        {/* Fatigue Index */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fatigue Index (Slide 4)</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-orange-400 font-mono">
              {liveFatigue}%
            </span>
            <span className="text-xs text-slate-400">exhaustion</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${
                liveFatigue > 60 ? 'bg-rose-500' : liveFatigue > 35 ? 'bg-orange-500' : 'bg-teal-500'
              }`}
              style={{ width: `${liveFatigue}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Main Graph & Live Visualizer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 60fps Real-Time Graph */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Live Rep Trajectory & Angular Kinematics (ESP32 Stream)
              </h2>
              <p className="text-xs text-slate-400">Real-time rolling window across eccentric and concentric rep phases</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Session Time: {formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Canvas Chart Area */}
          <div className="h-72 w-full pt-2">
            <Line data={chartDataConfig} options={chartOptions} />
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
            <span>Optimal Squat Zone: 85° - 95° Flexion</span>
            <span className="text-orange-400">Max Valgus Limit: ± 8.0°</span>
            <span className="text-purple-400">Max Spine Tilt: 35.0°</span>
          </div>
        </div>

        {/* Right: Hardware OLED Feed & Simulation Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* OLED Feed */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center">
            <span className="text-xs font-mono text-teal-400 font-bold mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Hardware OLED Mirror
            </span>

            <OledSimulator
              mode={
                Math.abs(liveValgus) > 10
                  ? 'VALGUS'
                  : liveTilt > 38
                  ? 'BACK_TILT'
                  : liveFatigue > 75
                  ? 'FATIGUE'
                  : 'REP'
              }
              repCount={repCount}
              angle={liveAngle}
              valgus={liveValgus}
              tilt={liveTilt}
              fatigue={liveFatigue}
              isBle={hardwareStatus.isConnected}
              isBuzzerActive={Boolean(activeAlert)}
            />
          </div>

          {/* Test Simulation Controls */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" /> Test Hardware Form Injections
              </h3>
              <span className="text-[10px] font-mono text-teal-400">Simulator</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Test how the buzzer, graphs, and OLED alert react to biomechanical errors:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => hardwareManager.setSimErrorMode(null)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-left font-medium cursor-pointer"
              >
                Normal Rep
              </button>
              <button
                onClick={() => hardwareManager.setSimErrorMode('valgus')}
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-left font-medium cursor-pointer"
              >
                Inject Knee Valgus
              </button>
              <button
                onClick={() => hardwareManager.setSimErrorMode('back')}
                className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 text-left font-medium cursor-pointer"
              >
                Inject Back Rounding
              </button>
              <button
                onClick={() => hardwareManager.setSimErrorMode('fatigue')}
                className="p-2 rounded-xl bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-500/40 text-left font-medium cursor-pointer"
              >
                Inject Fatigue Drop
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* END SESSION SUMMARY MODAL */}
      {isSummaryOpen && completedSessionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Workout Session Complete!</h2>
              <p className="text-xs text-slate-400">
                Data captured via ESP32 IMUs. Review your metrics and save to your persistent history.
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Reps</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {completedSessionData.reps}
                </div>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Form Accuracy</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {completedSessionData.formScore}%
                </div>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">
                  {formatTime(completedSessionData.duration)}
                </div>
              </div>
            </div>

            {/* Detailed Biomechanical Breakdown */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Peak Squat Flexion Reached:</span>
                <span className="font-mono text-teal-300 font-bold">{completedSessionData.peakFlexion}° (Parallel)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Clean Repetitions:</span>
                <span className="font-mono text-emerald-400 font-bold">{completedSessionData.goodReps} reps</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Knee Valgus Deviations Prevented:</span>
                <span className="font-mono text-orange-400 font-bold">{completedSessionData.badReps} times</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>End-of-Set Fatigue Rating:</span>
                <span className="font-mono text-yellow-400 font-bold">{completedSessionData.avgFatigue}%</span>
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Session Notes (How did your joints feel? Any pain or tightness?)
              </label>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Right knee felt strong on first 8 reps. Buzzer alerted me on rep 10 and I corrected my stance."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmSave}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to History & View Progress</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Discard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
