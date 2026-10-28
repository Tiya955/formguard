import React, { useState } from 'react';
import { 
  Tv, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Search, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import OledSimulator from '../components/OledSimulator';
import { OLED_DICTIONARY } from '../data/mockData';
import { playHapticSound } from '../services/audioService';

export default function OledGuidePage({ setActiveTab }) {
  const [selectedTerm, setSelectedTerm] = useState(OLED_DICTIONARY[2]); // Default to Knee Valgus
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filteredTerms = OLED_DICTIONARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      filterSeverity === 'all' || item.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleTestSound = (term) => {
    if (term.severity === 'danger') {
      playHapticSound('warning');
    } else if (term.term.includes('CALIB')) {
      playHapticSound('calibration');
    } else if (term.term.includes('REP')) {
      playHapticSound('rep');
    } else {
      playHapticSound('warning');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold uppercase">
          <Tv className="w-3.5 h-3.5" /> Hardware OLED Display Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          What The OLED Screen Means & How To React
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          The FormGuard wearable features a 0.96" I2C SSD1306 OLED screen attached to your waistband or sensor housing. Here is how each term words, what physical biomechanical flaw it detects, and exactly how you should correct your posture.
        </p>
      </div>

      {/* Interactive OLED Playground & Inspector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Active Screen Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono text-teal-400 font-bold mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Live Interactive Hardware Renderer
            </span>
            
            <OledSimulator
              mode={
                selectedTerm.term.includes('CALIB')
                  ? 'CALIB'
                  : selectedTerm.term.includes('VALGUS')
                  ? 'VALGUS'
                  : selectedTerm.term.includes('TILT')
                  ? 'BACK_TILT'
                  : selectedTerm.term.includes('FATIGUE')
                  ? 'FATIGUE'
                  : 'REP'
              }
              repCount={12}
              angle={91}
              valgus={selectedTerm.term.includes('VALGUS') ? 14.2 : 1.8}
              tilt={selectedTerm.term.includes('TILT') ? 42 : 15}
              fatigue={selectedTerm.term.includes('FATIGUE') ? 82 : 24}
              isBuzzerActive={selectedTerm.severity === 'danger'}
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleTestSound(selectedTerm)}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Physical Buzzer Sound
              </button>
            </div>
          </div>

          {/* Right: Selected Term Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedTerm.severity === 'danger'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : selectedTerm.severity === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}>
                  {selectedTerm.badge}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  "{selectedTerm.term}" — {selectedTerm.fullTitle}
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">What It Means:</span>
                <p className="text-slate-300">{selectedTerm.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-orange-400 font-bold block mb-1">What The Hardware Indicates:</span>
                <p className="text-slate-300">{selectedTerm.indication}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30">
                <span className="text-teal-300 font-bold block mb-1">How You Should React (Form Correction):</span>
                <p className="text-white font-medium">{selectedTerm.userAction}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Haptic Buzzer Frequency:</span>
                  <span className="text-slate-200 font-mono text-xs">{selectedTerm.hapticPattern}</span>
                </div>
                <button
                  onClick={() => handleTestSound(selectedTerm)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Full Glossary Table & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search OLED term (e.g. valgus, calib, fatigue)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            {['all', 'danger', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Glossary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map((item, idx) => {
            const isSelected = selectedTerm.term === item.term;
            return (
              <div
                key={idx}
                onClick={() => setSelectedTerm(item)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.term}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      item.severity === 'danger'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : item.severity === 'warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-teal-950 text-teal-300 border border-teal-800'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{item.fullTitle}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-3">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-teal-400 font-semibold flex items-center gap-1">
                    Click to load in OLED
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(item);
                    }}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Play buzzer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Step Call To Action */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Understand the terms? Now learn how to strap the sensors</h3>
          <p className="text-xs text-slate-300 mt-1">
            Check the sensor placement guide for squatting: thigh strap + shank/back positioning, and 3-rep calibration.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('wear-guide')}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shadow-lg cursor-pointer"
        >
          <span>Wear & Setup Instructions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
