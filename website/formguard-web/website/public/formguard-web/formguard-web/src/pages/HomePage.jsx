import React from 'react';
import { 
  ShieldAlert, 
  Scale, 
  BatteryLow, 
  Zap, 
  TrendingUp, 
  CheckCheck, 
  BellRing, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Wifi, 
  Bluetooth, 
  UserCheck, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import OledSimulator from '../components/OledSimulator';
import { TEAM_MEMBERS } from '../data/mockData';

export default function HomePage({ setActiveTab, onOpenHardwareModal, hardwareStatus }) {
  return (
    <div className="space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Ambient Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Gen Biomechanical Biofeedback Wearable</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Form<span className="text-teal-400">Guard</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 font-medium leading-relaxed">
                Wearable motion sensors that check your exercise form and help prevent injury.
              </p>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Two precision 6-DOF IMUs continuously track joint kinematics around your knee and spine. Get instant haptic buzzing on your body and live telemetry graphs before poor mechanics cause chronic damage.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('calibration')}
                  className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-teal-500/25 transition cursor-pointer"
                >
                  <Activity className="w-4 h-4" /> Start 3-Rep Calibration
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('workout')}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-orange-400" /> Live Workout & Graphs
                </button>

                <button
                  onClick={onOpenHardwareModal}
                  className="px-4 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-teal-300 font-mono text-xs rounded-xl border border-teal-500/30 flex items-center gap-2 transition cursor-pointer"
                >
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                  {hardwareStatus.isConnected ? 'Hardware Connected' : 'Connect ESP32'}
                </button>
              </div>

              {/* Hardware micro badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  <span>Sensor 1: Upper Thigh/Spine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span>Sensor 2: Lower Shank/Leg</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Interactive Live OLED & Sensor Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono text-teal-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> ESP32-WROOM-32 + OLED
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-900/40 text-teal-300 border border-teal-700/50">
                      LIVE DISPLAY
                    </span>
                  </div>

                  <OledSimulator
                    mode="REP"
                    repCount={8}
                    angle={92}
                    valgus={2.4}
                    tilt={12}
                    fatigue={24}
                    battery={88}
                    isBle={true}
                  />

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-teal-300 font-mono">Real-time IMU: 50 Hz</span>
                    <button
                      onClick={() => setActiveTab('oled-guide')}
                      className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                    >
                      Explore OLED Dictionary &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 1: WHY EXERCISE FORM MATTERS (Direct from Slide 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            Slide 2 Core Clinical Rationale
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Exercise Form Matters
          </h2>
          <p className="text-slate-400 text-base">
            Poor movement repeated over time leads to permanent injury — and usually, nobody is watching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Bad Form */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1. Bad Form</h3>
            <p className="text-sm font-semibold text-red-400 mb-3">
              Knee caving in (valgus), back rounding under load
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              When the knee drifts inward during squats or lunges, immense shear stresses hit the ACL and meniscus. Rounding the lumbar spine causes severe anterior disc bulges and degenerative facet inflammation.
            </p>
          </div>

          {/* Card 2: Compensation */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2. Compensation</h3>
            <p className="text-sm font-semibold text-orange-400 mb-3">
              One joint overworks for a weak one
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stiff ankles or weak hips force the lower back or patellar tendon to absorb unnatural torque. FormGuard detects unilateral shifting and kinetic leakage instantly before muscle tears occur.
            </p>
          </div>

          {/* Card 3: Fatigue */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-yellow-500/40 transition group">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <BatteryLow className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3. Fatigue</h3>
            <p className="text-sm font-semibold text-yellow-400 mb-3">
              Tired muscles, sloppy movement
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              As reps progress, concentric ascent velocity drops and neuromuscular tremors begin. Athletes rarely notice fatigue compensation until the rep collapses into an acute joint blowout.
            </p>
          </div>

        </div>
      </section>


      {/* SECTION 2: HOW FORMGUARD WORKS (Direct from Slide 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Slide 3 System Flow
            </span>
            <h2 className="text-3xl font-extrabold text-white">How FormGuard Works</h2>
            <p className="text-sm text-slate-400">
              End-to-end wearable loop: From tiny IMU motion capture to closed-loop haptic biofeedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Wear</h4>
              <p className="text-xs font-semibold text-teal-300 mb-2">2 small sensors around a joint</p>
              <p className="text-xs text-slate-400">
                Strap Sensor 1 above the joint (e.g. thigh or upper back) and Sensor 2 below the joint (shank or leg).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Track</h4>
              <p className="text-xs font-semibold text-teal-300 mb-2">Sensors send joint movement data</p>
              <p className="text-xs text-slate-400">
                Dual 6-DOF IMUs stream 3-axis accelerometer and gyroscope data to the ESP32 at 50Hz via I2C.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Check</h4>
              <p className="text-xs font-semibold text-teal-300 mb-2">Compare with correct form</p>
              <p className="text-xs text-slate-400">
                Onboard algorithms compare trajectory against the calibrated baseline and anatomical safety envelope.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-base mb-4">
                4
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Alert</h4>
              <p className="text-xs font-semibold text-orange-400 mb-2">Buzz or app alert if wrong</p>
              <p className="text-xs text-slate-400">
                Instant haptic vibration on the body and high-contrast OLED warning flash before you finish the repetition.
              </p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="text-xs font-mono text-teal-300 bg-teal-950/60 px-4 py-2 rounded-xl border border-teal-800">
              IMU = A tiny motion sensor (Inertial Measurement Unit) that measures how a body part moves and turns in 3D space
            </span>
          </div>
        </div>
      </section>


      {/* SECTION 3: PERSONALIZED & BEGINNER-FRIENDLY (Direct from Slide 5 & 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Slide 5 & 6 Personalization
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Personalized & Beginner-Friendly
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every body is anatomically distinct. Fill your health background once — height, weight, and prior joint surgeries or sprains — to receive adaptive safety thresholds.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-start gap-3">
                <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Safe Exercises For You</h4>
                  <p className="text-xs text-slate-400">
                    Box squats, isometric wall sits, tempo bodyweight squats matched to your current range of motion.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-red-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Exercises To Avoid or Restrict</h4>
                  <p className="text-xs text-slate-400">
                    High-impact jump squats, deep unassisted ass-to-grass squats if you have past ACL or meniscus trauma.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Setup Your Health & Injury Background
            </button>
          </div>

          {/* Real-Time Biofeedback Spotlight */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-teal-400" /> Real-Time Feedback, Instantly
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Haptic Buzz on Body</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Feel it the exact moment form slips — no need to turn your neck and stare at a screen during heavy reps.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <Tv className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">OLED & App Alert</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  "Knee caving in. Fix your form!" displayed instantly with corrective cues on the high-contrast screen.
                </p>
              </div>
            </div>

            {/* 4 Feature Badges from Slide */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-teal-400 text-xs font-bold">Track</div>
                <div className="text-[10px] text-slate-500">Joint Angles</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-teal-400 text-xs font-bold">Check</div>
                <div className="text-[10px] text-slate-500">Trajectory</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-teal-400 text-xs font-bold">Score</div>
                <div className="text-[10px] text-slate-500">Rep Quality</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-teal-400 text-xs font-bold">Personalise</div>
                <div className="text-[10px] text-slate-500">Health Profile</div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* SECTION 4: TEAM SPOTLIGHT (Slide 1 Presentation Credits) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono uppercase text-teal-400 font-bold">FormGuard Research Team</span>
              <h3 className="text-2xl font-bold text-white">Project Engineers & Contributors</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-300">
              Department of Computer Science & Biomedical Engineering
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm mb-3 border border-teal-500/30">
                  {idx + 1}
                </div>
                <h4 className="text-sm font-bold text-white">{member.name}</h4>
                <div className="text-xs font-mono text-teal-400 mt-0.5">{member.regNo}</div>
                <p className="text-[11px] text-slate-400 mt-2">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function Tv(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
      <polyline points="17 2 12 7 7 2"/>
    </svg>
  );
}
