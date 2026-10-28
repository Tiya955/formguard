import React from 'react';
import { 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Activity, 
  Zap, 
  Info,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

export default function WearGuidePage({ setActiveTab }) {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold uppercase">
          <Compass className="w-3.5 h-3.5" /> Sensor Placement Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          How To Wear Your FormGuard Sensors
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Accurate joint angle tracking starts with proper sensor placement. Follow this guide to strap Sensor 1 and Sensor 2 for squats and understand why the first 3 reps are calibrated.
        </p>
      </div>

      {/* Main Placement Cards (Squat Dual IMU) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sensor 1: Thigh / Upper Leg or Back */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-teal-500/30 space-y-5 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg font-mono">
            IMU 1
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
              Primary Reference Sensor (I2C: 0x68)
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">Sensor 1: Thigh (or Upper Back)</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-teal-400 block mb-1">For Squats & Knee Monitoring:</strong>
              Tie Sensor 1 securely with the elastic strap around your <span className="text-white font-bold">lower thigh (quadriceps)</span>, approximately 8-10 cm (3-4 inches) above your kneecap.
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-teal-400 block mb-1">For Spine & Back Posture Monitoring:</strong>
              Clip or tie Sensor 1 directly over your <span className="text-white font-bold">mid/upper back or lumbar harness</span> with orientation arrow pointing toward the head.
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <RotateCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Ensure the printed arrow points directly UPWARD.</span>
            </div>
          </div>
        </div>

        {/* Sensor 2: Lower Leg (Shank / Tibia) */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-orange-500/30 space-y-5 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-lg font-mono">
            IMU 2
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
              Secondary Reference Sensor (I2C: 0x69)
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">Sensor 2: Shank / Lower Leg</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-orange-400 block mb-1">Positioning Below The Knee:</strong>
              Tie Sensor 2 around your <span className="text-white font-bold">shin / upper tibia</span>, approximately 8-10 cm below the kneecap.
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-orange-400 block mb-1">Why Dual Sensors?</strong>
              By subtracting the shank angle from the thigh angle in 3D quaternion space, FormGuard calculates true <span className="text-white font-bold">relative knee flexion angle and lateral valgus deviation</span> independent of body tilt!
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <RotateCw className="w-3.5 h-3.5 text-orange-400" />
              <span>Strap firmly so the sensor does not wobble during movement.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Deep Dive: Why The First 3 Reps Are Calibrated */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Why Your First 3 Reps Are Calibrated</h2>
            <p className="text-xs text-slate-400">Personalized Biomechanical Baseline Calibration</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Unlike generic fitness gadgets that enforce arbitrary 90° numbers, FormGuard recognizes that human bodies are diverse. Your femur-to-torso ratio, hip socket depth (acetabular orientation), and ankle mobility are unique to you. The first 3 repetitions perform vital dynamic calibration:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              Rep 1
            </div>
            <h4 className="text-sm font-bold text-white">Standing Zero Tare</h4>
            <p className="text-xs text-slate-400">
              Establishes neutral upright alignment (0° reference) and zeroes out sensor strap tilt on your skin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              Rep 2
            </div>
            <h4 className="text-sm font-bold text-white">Depth & Range of Motion</h4>
            <p className="text-xs text-slate-400">
              Measures your natural comfortable parallel depth (typically 85°-95°) without forceful straining.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              Rep 3
            </div>
            <h4 className="text-sm font-bold text-white">Lateral Corridor Locked</h4>
            <p className="text-xs text-slate-400">
              Captures your pristine knee-over-toe tracking corridor. Baseline locks into memory, and live coaching starts!
            </p>
          </div>

        </div>

        <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-teal-300">Calibration Rule of Thumb:</strong>
            Perform the first 3 reps with strict focus, moderate tempo (2 seconds down, 1 second hold at bottom, 1 second up), and keep your chest tall.
          </div>
        </div>
      </div>

      {/* Pre-Flight Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h4 className="text-sm font-bold text-white mb-3">Pre-Workout Checklist</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sensors securely strapped (no sliding on leggings/skin)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ESP32 powered on & Bluetooth/Wi-Fi connected</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>OLED displays "FORMGUARD READY"</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Athletic shoes tied & clear squatting space</span>
          </div>
        </div>
      </div>

      {/* Action to Calibration */}
      <div className="text-center pt-4">
        <button
          onClick={() => setActiveTab('calibration')}
          className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl text-base inline-flex items-center gap-3 shadow-2xl shadow-teal-500/30 cursor-pointer transform hover:scale-102 transition"
        >
          <Activity className="w-5 h-5" />
          <span>I've Strapped My Sensors — Start Calibration</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
