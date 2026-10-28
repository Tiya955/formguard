import React from 'react';
import { ShieldCheck, Heart, Cpu, Code2, Users } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Form<span className="text-teal-400">Guard</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Wearable dual-IMU motion sensors that actively check your joint trajectory and exercise form in real time, preventing chronic injuries before they happen.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-teal-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> ESP32 Dual-Core
              </span>
              <span>•</span>
              <span>MPU6050 6-DOF IMU</span>
              <span>•</span>
              <span>SSD1306 OLED</span>
            </div>
          </div>

          {/* Project Team */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-400" /> FormGuard Team
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {TEAM_MEMBERS.map((m, idx) => (
                <li key={idx} className="flex flex-col">
                  <span className="text-slate-200 font-medium">
                    {m.name} <span className="text-teal-400 text-[10px]">({m.regNo})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Biomechanics Cues */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Core Biomechanics
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• Valgus Angle Detection (&lt; 8° strict)</li>
              <li>• Sagittal Lumbar Spine Tilt Monitor</li>
              <li>• 3-Rep Dynamic ROM Calibration</li>
              <li>• Real-Time Velocity Fatigue Warning</li>
              <li>• Haptic Buzzer Instant Biofeedback</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 FormGuard Wearable Systems. Academic & Clinical Demonstration.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for joint safety & athletic longevity
          </p>
        </div>
      </div>
    </footer>
  );
}
