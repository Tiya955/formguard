import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Volume2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import OledSimulator from '../components/OledSimulator';
import { hardwareManager } from '../services/bleService';
import { playHapticSound } from '../services/audioService';

export default function CalibrationPage({ 
  hardwareStatus, 
  onOpenHardwareModal, 
  setActiveTab,
  onCalibrationComplete 
}) {
  const [calibState, setCalibState] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [currentRep, setCurrentRep] = useState(0); // 0, 1, 2, 3
  const [liveAngle, setLiveAngle] = useState(0);
  const [liveValgus, setLiveValgus] = useState(0);
  const [liveTilt, setLiveTilt] = useState(0);
  const [lockedBaseline, setLockedBaseline] = useState(null);

  // Subscribe to hardware manager
  useEffect(() => {
    hardwareManager.onData((data) => {
      setLiveAngle(data.angle);
      setLiveValgus(data.valgus);
      setLiveTilt(data.tilt);

      if (calibState === 'running') {
        // If simulated or hardware rep triggered
        if (data.rep > currentRep && currentRep < 3) {
          const nextRep = Math.min(3, currentRep + 1);
          setCurrentRep(nextRep);
          playHapticSound('calibration');

          if (nextRep === 3) {
            completeCalibration(data.angle);
          }
        }
      }
    });
  }, [calibState, currentRep]);

  const handleStartCalibration = () => {
    setCalibState('running');
    setCurrentRep(0);
    setLockedBaseline(null);
    playHapticSound('calibration');

    // If no hardware is connected, auto start simulator for seamless user experience!
    if (!hardwareStatus.isConnected) {
      hardwareManager.startSimulator();
    }
  };

  const handleManualRepStep = () => {
    if (calibState !== 'running') {
      setCalibState('running');
    }
    const next = currentRep + 1;
    setCurrentRep(next);
    playHapticSound('calibration');

    if (next >= 3) {
      completeCalibration(liveAngle || 90);
    }
  };

  const completeCalibration = (depth) => {
    setCalibState('completed');
    setCurrentRep(3);
    const baseline = {
      neutral: 0.0,
      depth: depth > 60 ? depth : 90.5,
      timestamp: Date.now(),
    };
    setLockedBaseline(baseline);
    playHapticSound('fanfare');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#2dd4bf', '#f97316', '#38bdf8']
    });

    if (onCalibrationComplete) {
      onCalibrationComplete(baseline);
    }
  };

  const handleReset = () => {
    setCalibState('idle');
    setCurrentRep(0);
    setLockedBaseline(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-mono font-bold uppercase">
          <Activity className="w-4 h-4" /> Biomechanical Calibration
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Start 3-Rep Calibration
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Stand upright with neutral posture. Perform 3 controlled squats to establish your personalized zero-tare, natural squat depth and sagittal thigh-to-back ratio.
        </p>
      </div>

      {/* Main Calibration Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Hardware OLED Viewport */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <span className="text-sm font-mono text-teal-400 font-bold mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5" /> OLED Hardware Screen Feed
          </span>

          <OledSimulator
            mode="CALIBRATING"
            repCount={currentRep}
            angle={liveAngle || 0}
            valgus={liveValgus || 0}
            tilt={liveTilt || 0}
            battery={88}
            isBle={hardwareStatus.isConnected}
          />

          <div className="mt-4 text-center">
            <p className="text-sm font-mono text-slate-400">
              Status: <span className="text-teal-300 font-bold uppercase">{calibState}</span>
            </p>
          </div>
        </div>

        {/* Right: Stepper & Controls */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Calibration Sequence</h2>
              <p className="text-sm text-slate-400">Reps Completed: {currentRep} / 3</p>
            </div>
            {calibState === 'running' && (
              <span className="flex items-center gap-1.5 text-sm font-mono text-yellow-400 font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> RECORDING
              </span>
            )}
          </div>

          {/* Stepper Visual */}
          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className={`p-5 rounded-2xl border transition ${
              currentRep >= 1
                ? 'bg-teal-950/40 border-teal-500/50 text-white'
                : calibState === 'running' && currentRep === 0
                ? 'bg-slate-950 border-yellow-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentRep >= 1 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {currentRep >= 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-200">Rep 1: Upright Neutral Reference</h4>
                    <p className="text-sm text-slate-400">Zeroes out sensor tilt against your back and thigh.</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-teal-400 font-bold">
                  {currentRep >= 1 ? '0.0° Locked' : 'Waiting'}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-5 rounded-2xl border transition ${
              currentRep >= 2
                ? 'bg-teal-950/40 border-teal-500/50 text-white'
                : calibState === 'running' && currentRep === 1
                ? 'bg-slate-950 border-yellow-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentRep >= 2 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {currentRep >= 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-200">Rep 2: Natural Squat Depth</h4>
                    <p className="text-sm text-slate-400">Learns your comfortable anatomical bottom flexion.</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-teal-400 font-bold">
                  {currentRep >= 2 ? 'Depth: ~90°' : 'Waiting'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-5 rounded-2xl border transition ${
              currentRep >= 3
                ? 'bg-teal-950/40 border-teal-500/50 text-white'
                : calibState === 'running' && currentRep === 2
                ? 'bg-slate-950 border-yellow-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentRep >= 3 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {currentRep >= 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-200">Rep 3: Sagittal Ratio Lock</h4>
                    <p className="text-sm text-slate-400">Records your ideal thigh-to-back ratio and locks thresholds.</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-teal-400 font-bold">
                  {currentRep >= 3 ? 'Baseline Set' : 'Waiting'}
                </span>
              </div>
            </div>

          </div>

          {/* Action Button Bar */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            {calibState === 'idle' && (
              <button
                onClick={handleStartCalibration}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-extrabold rounded-xl text-base flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 transition cursor-pointer"
              >
                <Play className="w-5 h-5" />
                <span>Start Calibration</span>
              </button>
            )}

            {calibState === 'running' && (
              <>
                <button
                  onClick={handleManualRepStep}
                  className="flex-1 py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Activity className="w-5 h-5" />
                  <span>Register Rep {currentRep + 1} Step</span>
                </button>
                <button
                  onClick={handleReset}
                  className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}

            {calibState === 'completed' && (
              <>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold rounded-xl text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
                >
                  <span>Baseline Locked! Proceed to Live Workout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm flex items-center gap-1 cursor-pointer"
                  title="Recalibrate"
                >
                  <RotateCcw className="w-5 h-5" /> Recalibrate
                </button>
              </>
            )}
          </div>

          {/* Hint */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              If you have your ESP32 connected, performing squats physically will automatically advance each rep. You can also use the step button to test.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}