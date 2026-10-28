import React from 'react';
import { Wifi, Bluetooth, Battery, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function OledSimulator({
  mode = 'REP', // 'CALIB' | 'REP' | 'VALGUS' | 'BACK_TILT' | 'FATIGUE' | 'CUSTOM'
  title = 'FORMGUARD v2.0',
  lines = ['REP: 12   SET: 02', 'DEPTH: 91° [GOOD]', 'VALGUS:  +2.1° OK'],
  repCount = 12,
  angle = 91,
  valgus = 2.1,
  tilt = 14,
  fatigue = 28,
  battery = 84,
  isBle = true,
  isBuzzerActive = false,
}) {
  return (
    <div className="relative inline-block p-4 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl">
      {/* ESP32 / PCB Mounting Holes and Screws */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600"></div>
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600"></div>
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600"></div>
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600"></div>

      {/* Hardware Screen Bezel */}
      <div className="w-72 sm:w-80 h-44 bg-black rounded-lg p-3 oled-screen flex flex-col justify-between select-none">
        {/* Top 16px Yellow OLED Status Bar */}
        <div className="border-b border-yellow-500/30 pb-1 flex items-center justify-between font-mono text-xs oled-text-yellow tracking-wider">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping inline-block"></span>
            <span>{mode}</span>
          </div>
          <div className="flex items-center gap-2">
            {isBle && <Bluetooth className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="text-[10px]">{battery}%</span>
            <div className="w-5 h-2.5 border border-yellow-400 rounded-xs flex items-center p-0.5">
              <div
                className="h-full bg-yellow-400 rounded-xs"
                style={{ width: `${Math.max(10, battery)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main 48px Cyan OLED Body */}
        <div className="flex-1 py-1.5 flex flex-col justify-center font-mono text-sm leading-tight oled-text-teal">
          {mode === 'CALIB' ? (
            <div className="space-y-1">
              <div className="text-xs text-teal-300/80 font-bold tracking-widest">[ CALIBRATION 2/3 ]</div>
              <div className="text-base font-bold text-white tracking-wide">HOLD PARALLEL</div>
              <div className="flex justify-between text-xs pt-1 border-t border-teal-800/60">
                <span>ANGLE: {angle}°</span>
                <span className="text-yellow-400">BASE: LOCKED</span>
              </div>
            </div>
          ) : mode === 'VALGUS' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-950/60 px-1 py-0.5 rounded">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>! KNEE CAVING IN !</span>
              </div>
              <div className="text-xs text-red-300">VALGUS: +{Math.abs(valgus).toFixed(1)}° (MAX 8°)</div>
              <div className="text-[11px] text-yellow-300 font-bold animate-pulse">&gt;&gt; PUSH KNEES OUT &lt;&lt;</div>
            </div>
          ) : mode === 'BACK_TILT' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-950/60 px-1 py-0.5 rounded">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>! BACK ROUNDING !</span>
              </div>
              <div className="text-xs text-red-300">TILT: {tilt}° (CHEST DROP)</div>
              <div className="text-[11px] text-yellow-300 font-bold animate-pulse">&gt;&gt; LIFT CHEST UP &lt;&lt;</div>
            </div>
          ) : mode === 'FATIGUE' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-yellow-400 font-bold">
                <span>FATIGUE: HIGH</span>
                <span>{fatigue}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-yellow-500/40">
                <div className="bg-yellow-400 h-full" style={{ width: `${fatigue}%` }}></div>
              </div>
              <div className="text-[11px] text-teal-200">VELOCITY: -38% | RACK BAR</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">REP {repCount < 10 ? `0${repCount}` : repCount}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-500/40">
                  {valgus > 10 ? 'VALGUS' : tilt > 35 ? 'TILT' : 'FORM: OK'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-teal-300/90 pt-0.5">
                <span>FLEX: {angle}°</span>
                <span>VALG: {valgus > 0 ? `+${valgus}` : valgus}°</span>
                <span>TLT: {tilt}°</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Hardware Micro-Bar */}
        <div className="pt-1 border-t border-teal-900/40 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>SSD1306 I2C: 0x3C</span>
          {isBuzzerActive && (
            <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> BUZZER ON
            </span>
          )}
          <span>ESP32 240MHz</span>
        </div>
      </div>

      <div className="mt-2 text-center text-xs font-mono text-slate-400">
        0.96" OLED I2C Display (128×64)
      </div>
    </div>
  );
}
