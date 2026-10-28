import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  HeartPulse, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Save, 
  ArrowRight,
  Stethoscope,
  Info
} from 'lucide-react';
import { MEDICAL_CONDITIONS } from '../data/mockData';

export default function ProfilePage({ currentUser, onUpdateUser, setActiveTab }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Hemakshi Chauhan',
    age: currentUser?.age || 21,
    gender: currentUser?.gender || 'Female',
    height: currentUser?.height || 168,
    weight: currentUser?.weight || 62,
    fitnessLevel: currentUser?.fitnessLevel || 'Intermediate',
    conditions: currentUser?.conditions || ['knee_acl'],
    notes: currentUser?.notes || 'Prior ACL reconstruction. Monitoring knee valgus angle.',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate BMI: weight (kg) / [height (m)]^2
  const heightM = (formData.height || 170) / 100;
  const bmi = (formData.weight / (heightM * heightM)).toFixed(1);

  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (val < 25) return { label: 'Healthy Weight', color: 'text-emerald-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-rose-400' };
  };

  const bmiCat = getBmiCategory(bmi);

  const handleConditionToggle = (condId) => {
    let updated;
    if (condId === 'none_healthy') {
      updated = ['none_healthy'];
    } else {
      updated = formData.conditions.filter((c) => c !== 'none_healthy');
      if (updated.includes(condId)) {
        updated = updated.filter((c) => c !== condId);
      } else {
        updated.push(condId);
      }
      if (updated.length === 0) {
        updated = ['none_healthy'];
      }
    }
    setFormData({ ...formData, conditions: updated });
  };

  // Compile aggregate safe vs avoid lists
  const activeConditionsData = MEDICAL_CONDITIONS.filter((c) => formData.conditions.includes(c.id));
  const safeExercises = Array.from(new Set(activeConditionsData.flatMap((c) => c.safeExercises)));
  const avoidExercises = Array.from(new Set(activeConditionsData.flatMap((c) => c.avoidExercises)));

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-2xl">
            {formData.name ? formData.name[0] : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{formData.name}</h1>
            <p className="text-xs text-slate-400">
              Personalized Biomechanical & Medical Profile • Level: <span className="text-teal-400 font-semibold">{formData.fitnessLevel}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('calibration')}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Proceed to Calibration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Physical Stats & Medical Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-400" /> Physical & Medical Inputs
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Slide 5 Requirement</span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Grid 1: Name, Age, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Non-binary</option>
                </select>
              </div>
            </div>

            {/* Grid 2: Height & Weight with Live BMI */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              {/* BMI Card */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Calculated Body Mass Index (BMI):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">{bmi}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 ${bmiCat.color}`}>
                    {bmiCat.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Fitness Experience</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, fitnessLevel: level })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      formData.fitnessLevel === level
                        ? 'bg-teal-600 text-white shadow-xs border border-teal-400'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Medical / Injury History Checklist */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Medical & Prior Injury History (Select all that apply)
              </label>

              <div className="space-y-2">
                {MEDICAL_CONDITIONS.map((cond) => {
                  const isChecked = formData.conditions.includes(cond.id);
                  return (
                    <div
                      key={cond.id}
                      onClick={() => handleConditionToggle(cond.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-teal-950/40 border-teal-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? 'bg-teal-500 border-teal-400 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{cond.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-teal-400/80">
                        {isChecked ? 'Protected' : 'Tap to add'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Clinical Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Doctor / Physical Therapist Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Focus on keeping left knee outward during descent..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Health Background
              </button>

              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Saved & Tolerance Updated!
                </span>
              )}
            </div>

          </form>
        </div>


        {/* Right Col: Personalized AI Analysis (Slide 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-base font-bold text-white">Slide 5: Personalized Exercise Path</h3>
            </div>

            {/* Safe Exercises */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Safe Exercises For You</span>
              </div>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-1.5">
                {safeExercises.length > 0 ? (
                  safeExercises.map((ex, i) => (
                    <div key={i} className="text-xs text-emerald-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{ex}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Standard bodyweight movements approved.</p>
                )}
              </div>
            </div>

            {/* Exercises to Avoid */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Exercises To Avoid / Modify</span>
              </div>
              <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl space-y-1.5">
                {avoidExercises.length > 0 ? (
                  avoidExercises.map((ex, i) => (
                    <div key={i} className="text-xs text-rose-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>{ex}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No high-risk restrictions detected.</p>
                )}
              </div>
            </div>

            {/* Personalized Hardware Tolerances */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                Adaptive Hardware Sensor Tolerances
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Knee Valgus Max:</div>
                  <div className="text-teal-400 font-bold text-sm">
                    {formData.conditions.includes('knee_acl') ? '± 7.5° (Strict)' : '± 12.0° (Standard)'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Target Squat Depth:</div>
                  <div className="text-teal-400 font-bold text-sm">
                    {formData.conditions.includes('knee_acl') ? '80° - 88°' : '88° - 95°'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Beginner Path Progression Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Beginner Path: Start Safe, Build Up
            </h4>
            <div className="flex items-center justify-between text-center pt-2">
              <div className="flex-1">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center mx-auto mb-1">
                  1
                </div>
                <div className="text-[11px] font-bold text-teal-300">Safe Start</div>
                <div className="text-[9px] text-slate-400">Calibration</div>
              </div>
              <div className="w-6 h-0.5 bg-teal-500/40"></div>
              <div className="flex-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center mx-auto mb-1 border border-slate-700">
                  2
                </div>
                <div className="text-[11px] font-bold text-slate-300">Build</div>
                <div className="text-[9px] text-slate-400">Tempo Sets</div>
              </div>
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center mx-auto mb-1 border border-slate-700">
                  3
                </div>
                <div className="text-[11px] font-bold text-slate-300">Stronger</div>
                <div className="text-[9px] text-slate-400">Load Progress</div>
              </div>
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center mx-auto mb-1 border border-slate-700">
                  4
                </div>
                <div className="text-[11px] font-bold text-slate-300">Advanced</div>
                <div className="text-[9px] text-slate-400">Free Weights</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
