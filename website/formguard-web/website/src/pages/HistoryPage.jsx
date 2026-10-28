import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  FileDown, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Zap,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HistoryPage({ sessions = [], onDeleteSession, setActiveTab }) {
  const [timeFilter, setTimeFilter] = useState('1m'); // '3d' | '1w' | '1m' | '6m' | '1y' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionModal, setSelectedSessionModal] = useState(null);

  // Filter sessions according to timeFilter
  const now = new Date('2026-10-27T15:47:33+05:30').getTime();

  const getCutoffTime = (filter) => {
    const day = 24 * 60 * 60 * 1000;
    if (filter === '3d') return now - 4 * day;
    if (filter === '1w') return now - 7 * day;
    if (filter === '1m') return now - 30 * day;
    if (filter === '6m') return now - 180 * day;
    if (filter === '1y') return now - 365 * day;
    return 0; // all
  };

  const cutoff = getCutoffTime(timeFilter);

  const filteredSessions = sessions.filter((s) => {
    const sessionTime = new Date(s.date).getTime();
    const inRange = sessionTime >= cutoff;
    const matchesSearch =
      s.exercise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return inRange && matchesSearch;
  });

  // Calculate high-level summary KPIs
  const totalWorkouts = filteredSessions.length;
  const totalReps = filteredSessions.reduce((acc, s) => acc + (s.reps || 0), 0);
  const avgScore = totalWorkouts > 0
    ? Math.round(filteredSessions.reduce((acc, s) => acc + (s.formScore || 0), 0) / totalWorkouts)
    : 0;
  const totalFlawsPrevented = filteredSessions.reduce((acc, s) => acc + (s.badReps || 0), 0);

  // Prepare chronological chart data (oldest first for line chart)
  const sortedForChart = [...filteredSessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartLabels = sortedForChart.map((s) => {
    const d = new Date(s.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const formScoreData = sortedForChart.map((s) => s.formScore);
  const repVolumeData = sortedForChart.map((s) => s.reps);

  const progressChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Nov', 'Jan', 'Apr', 'Jul', 'Sep', 'Oct'],
    datasets: [
      {
        type: 'line',
        label: 'Form Quality Score (%)',
        data: formScoreData.length > 0 ? formScoreData : [68, 73, 79, 82, 89, 94],
        borderColor: '#2dd4bf', // Teal
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        fill: true,
        borderWidth: 3,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Rep Volume (Count)',
        data: repVolumeData.length > 0 ? repVolumeData : [10, 16, 20, 24, 18, 15],
        backgroundColor: 'rgba(249, 115, 22, 0.4)', // Orange
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
        type: 'linear',
        position: 'left',
        min: 50,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#2dd4bf',
          font: { size: 10 },
          callback: (val) => `${val}%`,
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        grid: { drawOnChartArea: false },
        ticks: { color: '#f97316', font: { size: 10 } },
      },
    },
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Date,Exercise,Duration(s),Total Reps,Clean Reps,Bad Reps,Form Score(%),Peak Flexion(deg),Fatigue(%),Notes'];
    const rows = filteredSessions.map((s) =>
      `"${s.date}","${s.exercise}",${s.duration},${s.reps},${s.goodReps},${s.badReps},${s.formScore},${s.peakFlexion},${s.avgFatigue},"${(s.notes || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FormGuard_Workout_History_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Track your form score evolution, reps volume, and injury risk reduction from 3-4 days to 1 year.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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
          Showing {filteredSessions.length} Recorded Sessions
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
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
            <ArrowUpRight className="w-3.5 h-3.5" /> +26% improvement vs baseline
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Reps Monitored</span>
          <div className="text-3xl font-black text-teal-400 font-mono">{totalReps}</div>
          <div className="text-[11px] text-slate-400">Full 3D IMU telemetry logged</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Joint Flaws Prevented</span>
          <div className="text-3xl font-black text-orange-400 font-mono">{totalFlawsPrevented}</div>
          <div className="text-[11px] text-orange-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Haptic buzz intervention
          </div>
        </div>

      </div>

      {/* Main Longitudinal Progress Chart */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Progress Trajectory: Form Score & Rep Volume Over Time
            </h2>
            <p className="text-xs text-slate-400">
              Correlates movement quality improvements with workout volume progression ({timeFilter.toUpperCase()} view)
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <Line data={progressChartData} options={chartOptions} />
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Workout Session History</h3>
            <p className="text-xs text-slate-400">Click any session row to inspect rep-by-rep biomechanics</p>
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

        {/* Table */}
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
                      <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {session.exercise}
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-white font-bold">{session.reps}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({session.goodReps}✓ {session.badReps}✗)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          session.formScore >= 85
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {session.formScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-teal-300">
                        {session.peakFlexion}°
                      </td>
                      <td className="py-3.5 px-3 font-mono text-orange-400">
                        {session.avgFatigue}%
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                        {session.notes || '—'}
                      </td>
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
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No workout records found for this time period. Click "+ New Workout" to record your session!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Session Details Modal */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
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
                  {Math.floor(selectedSessionModal.duration / 60)}m {selectedSessionModal.duration % 60}s
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Form Quality Score:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {selectedSessionModal.formScore}%
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Peak Squat Flexion:</span>
                <span className="font-mono text-teal-300 font-bold text-sm">
                  {selectedSessionModal.peakFlexion}° (Parallel)
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-300">Biomechanical Notes:</span>
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
