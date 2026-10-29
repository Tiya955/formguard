import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileDown,
  Search,
  Trash2,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fmtDeg = (v) => (v === undefined || v === null || v === '' ? '—' : `${v}°`);

export default function HistoryPage({ sessions = [], onDeleteSession, onClearAll, setActiveTab }) {
  const [timeFilter, setTimeFilter] = useState('all'); // '3d' | '1w' | '1m' | '6m' | '1y' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionModal, setSelectedSessionModal] = useState(null);

  // ---- Time filter (uses the real current time) ----
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const getCutoffTime = (filter) => {
    if (filter === '3d') return now - 4 * day;
    if (filter === '1w') return now - 7 * day;
    if (filter === '1m') return now - 30 * day;
    if (filter === '6m') return now - 180 * day;
    if (filter === '1y') return now - 365 * day;
    return 0;
  };
  const cutoff = getCutoffTime(timeFilter);
  const q = searchQuery.toLowerCase();

  const filteredSessions = sessions
    .filter((s) => {
      const inRange = new Date(s.date).getTime() >= cutoff;
      const matches =
        (s.exercise || '').toLowerCase().includes(q) || (s.notes || '').toLowerCase().includes(q);
      return inRange && matches;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // newest first

  // ---- Summary numbers (only from saved sessions) ----
  const totalWorkouts = filteredSessions.length;
  const totalReps = filteredSessions.reduce((acc, s) => acc + (s.reps || 0), 0);
  const avgScore =
    totalWorkouts > 0
      ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.formScore || 0), 0) / totalWorkouts)
      : 0;
  const totalFlawsPrevented = filteredSessions.reduce((acc, s) => acc + (s.badReps || 0), 0);

  // ---- Chart data (oldest first) ----
  const sortedForChart = [...filteredSessions].reverse();
  const chartLabels = sortedForChart.map((s) => {
    const d = new Date(s.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  // Real improvement: last saved session vs first saved session in this window
  const trend =
    sortedForChart.length >= 2
      ? (sortedForChart[sortedForChart.length - 1].formScore || 0) - (sortedForChart[0].formScore || 0)
      : null;

  const progressChartData = {
    labels: chartLabels,
    datasets: [
      {
        type: 'line',
        label: 'Form Quality Score (%)',
        data: sortedForChart.map((s) => s.formScore),
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        fill: true,
        borderWidth: 3,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Rep Volume (Count)',
        data: sortedForChart.map((s) => s.reps),
        backgroundColor: 'rgba(249, 115, 22, 0.4)',
        borderColor: '#f97316',
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 12 },
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
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#2dd4bf', font: { size: 10 }, callback: (val) => `${val}%` },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        grid: { drawOnChartArea: false },
        ticks: { color: '#f97316', font: { size: 10 }, precision: 0 },
      },
    },
  };

  // ---- Actions ----
  const handleExportCsv = () => {
    const headers = ['Date,Exercise,Duration(s),Total Reps,Clean Reps,Bad Reps,Form Score(%),Peak Flexion(deg),Fatigue(%),Notes'];
    const rows = filteredSessions.map(
      (s) =>
        `"${s.date}","${s.exercise}",${s.duration ?? ''},${s.reps ?? ''},${s.goodReps ?? ''},${s.badReps ?? ''},${s.formScore ?? ''},${s.peakFlexion ?? ''},${s.avgFatigue ?? ''},"${(s.notes || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `FormGuard_Workout_History_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = () => {
    if (!window.confirm('Delete ALL saved workout history? This cannot be undone.')) return;
    if (onClearAll) onClearAll();
    else if (onDeleteSession) sessions.forEach((s) => onDeleteSession(s.id));
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold uppercase mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Longitudinal Biomechanical Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-white">Your Progress & Workout History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Only workouts you chose to save appear here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-slate-900 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
          <button
            onClick={handleExportCsv}
            disabled={filteredSessions.length === 0}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            + New Workout
          </button>
        </div>
      </div>

      {/* Time Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium px-2 hidden sm:inline">Timeline:</span>
          {[
            { id: '3d', label: '3-4 Days' },
            { id: '1w', label: '1 Week' },
            { id: '1m', label: '1 Month' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
            { id: 'all', label: 'All Time' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTimeFilter(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                timeFilter === btn.id
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono text-teal-400 px-3">
          Showing {filteredSessions.length} Saved Session{filteredSessions.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Workouts</span>
          <div className="text-3xl font-black text-white font-mono">{totalWorkouts}</div>
          <div className="text-[11px] text-teal-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> In selected window
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Average Form Score</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{avgScore}%</div>
          <div className="text-[11px] text-emerald-300 flex items-center gap-1">
            {trend === null ? (
              'Save 2+ workouts to see your trend'
            ) : (
              <>
                <ArrowUpRight className={`w-3.5 h-3.5 ${trend < 0 ? 'rotate-90' : ''}`} />
                {trend >= 0 ? '+' : ''}
                {trend} pts since first saved session
              </>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Reps Monitored</span>
          <div className="text-3xl font-black text-teal-400 font-mono">{totalReps}</div>
          <div className="text-[11px] text-slate-400">From your saved workouts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Joint Flaws Prevented</span>
          <div className="text-3xl font-black text-orange-400 font-mono">{totalFlawsPrevented}</div>
          <div className="text-[11px] text-orange-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Haptic buzz intervention
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            Progress Trajectory: Form Score & Rep Volume Over Time
          </h2>
          <p className="text-xs text-slate-400">
            Built only from your saved workouts ({timeFilter.toUpperCase()} view)
          </p>
        </div>

        {sortedForChart.length > 0 ? (
          <div className="h-80 w-full pt-2">
            <Line data={progressChartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
            <Inbox className="w-8 h-8" />
            <p className="text-sm">No saved workouts yet.</p>
            <p className="text-xs">Finish a session and press “Save & Exit” to see your progress here.</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Workout Session History</h3>
            <p className="text-xs text-slate-400">Click any session row to inspect its details</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise or notes..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Exercise</th>
                <th className="py-3 px-3">Reps</th>
                <th className="py-3 px-3">Form Score</th>
                <th className="py-3 px-3">Peak Depth</th>
                <th className="py-3 px-3">Fatigue</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const d = new Date(session.date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={session.id}
                      onClick={() => setSelectedSessionModal(session)}
                      className="hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">{dateStr}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">{session.exercise}</td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-white font-bold">{session.reps}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({session.goodReps}✓ {session.badReps}✗)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            session.formScore >= 85
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {session.formScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-teal-300">{fmtDeg(session.peakFlexion)}</td>
                      <td className="py-3.5 px-3 font-mono text-orange-400">{session.avgFatigue ?? 0}%</td>
                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">{session.notes || '—'}</td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDeleteSession && onDeleteSession(session.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    {sessions.length === 0
                      ? 'No saved workouts yet. Click “+ New Workout”, finish a session and press Save.'
                      : 'No saved workouts match this time period or search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">Session Inspector</span>
                <h3 className="text-lg font-bold text-white">{selectedSessionModal.exercise}</h3>
              </div>
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Date & Time:</span>
                <span className="font-mono text-white font-medium">
                  {new Date(selectedSessionModal.date).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Duration:</span>
                <span className="font-mono text-teal-300 font-bold">
                  {Math.floor((selectedSessionModal.duration || 0) / 60)}m {(selectedSessionModal.duration || 0) % 60}s
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Form Quality Score:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{selectedSessionModal.formScore}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Peak Flexion:</span>
                <span className="font-mono text-teal-300 font-bold text-sm">
                  {fmtDeg(selectedSessionModal.peakFlexion)}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Reps (good / bad):</span>
                <span className="font-mono text-white font-bold text-sm">
                  {selectedSessionModal.reps} ({selectedSessionModal.goodReps} / {selectedSessionModal.badReps})
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Fatigue:</span>
                <span className="font-mono text-orange-400 font-bold text-sm">
                  {selectedSessionModal.avgFatigue ?? 0}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-300">Notes:</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedSessionModal.notes || 'No notes added for this workout.'}
              </p>
            </div>

            <button
              onClick={() => setSelectedSessionModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
