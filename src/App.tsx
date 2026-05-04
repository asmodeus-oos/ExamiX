import { useState, useEffect } from "react";

// ---------- Types ----------
interface Exam {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  day: string;
  time: string;
  room: string;
  notes?: string;
}

// ---------- Helpers ----------
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  return daysOfWeek[d.getDay()];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function id(): string {
  return Math.random().toString(36).substring(2, 10);
}

/** Convert a time like "1:45 PM - 3:00 PM" or "9:15 AM" into minutes since midnight (start time). */
function timeToMinutes(t: string): number {
  if (!t) return 0;
  const first = t.split(/-|to|–|—/i)[0].trim();
  const m = first.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!m) return 0;
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function dateAccent(dateStr: string): string {
  const day = new Date(dateStr).getDate();
  const accents = [
    "from-pink-200 to-rose-100 text-pink-700 ring-pink-300/60",
    "from-cyan-200 to-sky-100 text-cyan-700 ring-cyan-300/60",
    "from-violet-200 to-fuchsia-100 text-violet-700 ring-violet-300/60",
    "from-emerald-200 to-teal-100 text-emerald-700 ring-emerald-300/60",
    "from-amber-200 to-orange-100 text-amber-700 ring-amber-300/60",
  ];
  return accents[day % accents.length];
}

// ---------- Main Component ----------
export default function App() {
  const initialExams: Exam[] = [
    {
      id: id(),
      subject: "Oral Pathology 2",
      date: "2026-06-01",
      day: "Monday",
      time: "1:45 PM - 3:00 PM",
      room: "Library",
      notes: "Afternoon lecture",
    },
    {
      id: id(),
      subject: "Pedo I",
      date: "2026-06-01",
      day: "Monday",
      time: "4:45 PM - 6:00 PM",
      room: "Library",
      notes: "Evening lecture",
    },
    {
      id: id(),
      subject: "Endo IV",
      date: "2026-05-18",
      day: "Monday",
      time: "3:15 PM - 4:30 PM",
      room: "Library",
      notes: "Afternoon lecture",
    },
    {
      id: id(),
      subject: "Fixed V",
      date: "2026-06-04",
      day: "Thursday",
      time: "1:45 PM - 3:00 PM",
      room: "Library",
      notes: "Afternoon lecture",
    },
    {
      id: id(),
      subject: "Ortho I",
      date: "2026-05-24",
      day: "Sunday",
      time: "9:15 AM - 10:30 AM",
      room: "Library",
      notes: "Morning lecture",
    },
    {
      id: id(),
      subject: "Operative V",
      date: "2026-06-11",
      day: "Thursday",
      time: "1:45 PM - 3:00 PM",
      room: "Library",
      notes: "Afternoon lecture",
    },
  ];

  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [flying, setFlying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(new Date());

  const [form, setForm] = useState({
    subject: "",
    date: "",
    time: "",
    room: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    date: "",
    time: "",
    room: "",
    notes: "",
  });

  useEffect(() => {
    setLoaded(true);
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const startEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setEditForm({
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      room: exam.room,
      notes: exam.notes || "",
    });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.subject || !editForm.date || !editForm.time || !editForm.room) return;
    setExams((prev) =>
      prev.map((e) =>
        e.id === editingId
          ? { ...e, subject: editForm.subject, date: editForm.date, day: getDayName(editForm.date), time: editForm.time, room: editForm.room, notes: editForm.notes || undefined }
          : e
      )
    );
    setEditingId(null);
    setEditForm({ subject: "", date: "", time: "", room: "", notes: "" });
    setFlying(true);
    setTimeout(() => setFlying(false), 600);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ subject: "", date: "", time: "", room: "", notes: "" });
  };

  const addExam = () => {
    if (!form.subject || !form.date || !form.time || !form.room) return;
    const newExam: Exam = {
      id: id(),
      subject: form.subject,
      date: form.date,
      day: getDayName(form.date),
      time: form.time,
      room: form.room,
      notes: form.notes || undefined,
    };
    setExams((prev) => [...prev, newExam]);
    setForm({ subject: "", date: "", time: "", room: "", notes: "" });
    setShowForm(false);
    setFlying(true);
    setTimeout(() => setFlying(false), 600);
  };

  const removeExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAll = () => {
    if (exams.length === 0) return;
    if (window.confirm("Clear all exams?")) setExams([]);
  };

  const sorted = [...exams].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  // ---- Next Exam Countdown ----
  function getExamDateTime(exam: Exam): Date {
    // parse start time from e.g. "1:45 PM - 3:00 PM"
    const first = exam.time.split(/-|to|–|—/i)[0].trim();
    const m = first.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    let hours = m ? parseInt(m[1], 10) : 0;
    const minutes = m && m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m && m[3] ? m[3].toUpperCase() : null;
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const dt = new Date(`${exam.date}T00:00:00`);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }

  const nextExam = sorted.find((e) => getExamDateTime(e) > now);

  let countdownDays = 0;
  let countdownHours = 0;
  let countdownMinutes = 0;
  let countdownSeconds = 0;
  let totalMsLeft = 0;

  if (nextExam) {
    totalMsLeft = getExamDateTime(nextExam).getTime() - now.getTime();
    countdownDays = Math.floor(totalMsLeft / (1000 * 60 * 60 * 24));
    countdownHours = Math.floor((totalMsLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    countdownMinutes = Math.floor((totalMsLeft % (1000 * 60 * 60)) / (1000 * 60));
    countdownSeconds = Math.floor((totalMsLeft % (1000 * 60)) / 1000);
  }

  const filtered = filterText
    ? sorted.filter(
        (e) =>
          e.subject.toLowerCase().includes(filterText.toLowerCase()) ||
          e.room.toLowerCase().includes(filterText.toLowerCase()) ||
          e.day.toLowerCase().includes(filterText.toLowerCase())
      )
    : sorted;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-rose-50 to-violet-100">
      {/* ====== Animated Pastel Blobs ====== */}
      <div
        className="bg-blob animate-float"
        style={{
          width: "600px",
          height: "600px",
          top: "-10%",
          left: "-5%",
          background:
            "radial-gradient(circle, rgba(244, 114, 182, 0.55), rgba(244, 114, 182, 0))",
        }}
      />
      <div
        className="bg-blob animate-float-slow"
        style={{
          width: "500px",
          height: "500px",
          bottom: "-10%",
          right: "-5%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.55), rgba(56, 189, 248, 0))",
        }}
      />
      <div
        className="bg-blob"
        style={{
          width: "420px",
          height: "420px",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.45), rgba(168, 85, 247, 0))",
          animation: "float 10s ease-in-out infinite",
        }}
      />

      {/* ====== Content ====== */}
      <div
        className={`relative z-10 mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 transition-all duration-700 ${
          loaded ? "opacity-100" : "opacity-0 translate-y-8"
        }`}
      >
        {/* ---------- Header ---------- */}
        <div className="glass-strong mb-6 rounded-2xl p-6 sm:mb-8 sm:rounded-3xl sm:p-8 text-center">
          <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-violet-700 ring-1 ring-violet-200">
            Academic Year 2025-2026
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
            Final Exams Time Table
          </h1>

        </div>

        {/* ---------- Countdown Card ---------- */}
        {nextExam ? (
          <div className="animate-fadeInUp mb-6 rounded-2xl overflow-hidden shadow-xl">
            {/* gradient top bar */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-5 py-3 flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <span className="text-sm font-extrabold uppercase tracking-widest text-white/90">Next Exam Countdown</span>
            </div>

            <div className="glass-strong flex flex-col gap-6 p-5 sm:p-6 rounded-b-2xl text-center">
              {/* Subject + Date info */}
              <div className="flex flex-col items-center">
                <span className="inline-block rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 px-5 py-2 font-extrabold text-purple-800 ring-2 ring-purple-300/80 text-lg sm:text-xl md:text-2xl shadow-sm">
                  {nextExam.subject}
                </span>
                <div className="mt-3 flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-700 bg-white/40 border border-white/50 px-3 py-1.5 rounded-xl shadow-sm">
                    <svg className="h-4.5 w-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold text-sm sm:text-base">{nextExam.day}, {formatDate(nextExam.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-white/40 border border-white/50 px-3 py-1.5 rounded-xl shadow-sm">
                    <svg className="h-4.5 w-4.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-sm sm:text-base">{nextExam.time}</span>
                  </div>
                </div>
              </div>

              {/* Countdown Tiles taking full width */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-2xl mx-auto">
                {[
                  { value: countdownDays, label: "Days" },
                  { value: countdownHours, label: "Hours" },
                  { value: countdownMinutes, label: "Min" },
                  { value: countdownSeconds, label: "Sec" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-white/90 to-white/60 border-2 border-white/90 shadow-xl py-4 sm:py-5 px-1 sm:px-3"
                  >
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-purple-700 to-pink-600 leading-tight">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="mt-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : exams.length > 0 ? (
          <div className="glass-strong mb-6 rounded-2xl p-5 text-center shadow-lg">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-extrabold text-slate-800 text-sm sm:text-base">All exams are done! Congratulations!</p>
          </div>
        ) : null}

        {/* ---------- Controls ---------- */}
        <div className="glass mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl p-4 sm:p-5">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-purple-400/50 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? "Cancel Entry" : "Add New Exam"}
          </button>

          <input
            type="text"
            placeholder="Search exams, subjects, dates..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="glass-input flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
          />

          {exams.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-red-300/50 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* ---------- Add Form ---------- */}
        {showForm && (
          <div className="animate-fadeInUp glass-card mb-6 rounded-2xl p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-extrabold text-slate-900">
              New Exam Entry
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <input
                type="text"
                placeholder="Subject *"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800"
              />
              <input
                type="text"
                placeholder='Time e.g. "1:45 PM - 3" *'
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
              />
              <input
                type="text"
                placeholder="Room *"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
              />
              <button
                onClick={addExam}
                disabled={!form.subject || !form.date || !form.time || !form.room}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Entry
              </button>
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="glass-input mt-4 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
            />
          </div>
        )}

        {/* ---------- Empty State ---------- */}
        {filtered.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center rounded-3xl py-14 sm:py-20 text-center px-4">
            <div className="mb-4 text-5xl sm:text-6xl animate-float">📚</div>
            <h2 className="mb-2 text-xl font-extrabold text-slate-900">
              {exams.length === 0
                ? "No exams scheduled yet"
                : "No matching exams"}
            </h2>
            <p className="mb-6 text-sm font-bold text-slate-700">
              {exams.length === 0
                ? 'Click "Add Exam" to start building your timetable'
                : "Try a different search term"}
            </p>
            {exams.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-purple-400/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                + Add Your First Exam
              </button>
            )}
          </div>
        )}

        {/* ---------- Data Grid / List Views ---------- */}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {/* 🖥️ Desktop / Tablet Layout: Table View */}
            <div className="hidden md:block glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-900 border-collapse">
                  <thead>
                    <tr className="border-b border-white/60 bg-white/40">
                      <Th className="py-4.5 px-5">Subject</Th>
                      <Th className="py-4.5 px-5">Date</Th>
                      <Th className="hidden lg:table-cell py-4.5 px-5">Day</Th>
                      <Th className="py-4.5 px-5">Time</Th>
                      <Th className="py-4.5 px-5">Room</Th>
                    <Th className="hidden lg:table-cell py-4.5 px-5">Notes</Th>
                    <Th className="w-28 py-4.5 px-3 text-right">Actions</Th>
                  </tr>
                  </thead>
                  <tbody>
                    {filtered.map((exam, i) => (
                      <tr
                        key={exam.id}
                        className={`border-b border-white/40 transition-all duration-300 hover:bg-white/40 ${
                          flying ? "animate-pulse-glow" : ""
                        }`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <td className="px-5 py-5 font-bold">
                          <span className="inline-block rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 px-3.5 py-1.5 font-bold text-purple-800 ring-2 ring-purple-300/80">
                            {exam.subject}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-lg bg-gradient-to-r px-3.5 py-1.5 font-bold ring-2 ${dateAccent(
                              exam.date
                            )}`}
                          >
                            {formatDate(exam.date)}
                          </span>
                        </td>
                        <td className="hidden lg:px-5 lg:py-5 font-bold text-slate-700 lg:table-cell">
                          {exam.day}
                        </td>
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-cyan-800 font-bold ring-2 ring-cyan-300/80">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{exam.time}</span>
                          </span>
                        </td>
                        <td className="px-5 py-5 font-bold text-slate-800">{exam.room}</td>
                        <td className="hidden max-w-[180px] truncate px-5 py-5 font-bold text-slate-700 lg:table-cell lg:text-right">
                          {exam.notes || "—"}
                        </td>
                        <td className="px-3 py-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => startEdit(exam)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/50 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                              title="Edit"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeExam(exam.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-300/50 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                              title="Remove"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 💻 Desktop/Tablet Edit Form */}
            {editingId && (
              <div className="hidden md:block animate-fadeInUp glass-card p-6 rounded-2xl border-2 border-blue-300/60 mb-6">
                <h3 className="mb-4 text-lg font-extrabold text-slate-900">Edit Exam</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <input
                    type="text"
                    placeholder="Subject *"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder='Time e.g. "1:45 PM - 3" *'
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Room *"
                    value={editForm.room}
                    onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                    className="glass-input rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editForm.subject || !editForm.date || !editForm.time || !editForm.room}
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-400/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 rounded-xl bg-gradient-to-r from-slate-400 to-slate-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-300/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="glass-input mt-4 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                />
              </div>
            )}

            {/* 📱 Mobile Layout: Dynamic List Card View (Full responsiveness even on small DPI) */}
            <div className="md:hidden space-y-4">
              {/* Edit Form - Mobile */}
              {editingId && (
                <div className="animate-fadeInUp glass-card p-5 rounded-2xl border-2 border-blue-300/60">
                  <h3 className="mb-4 text-lg font-extrabold text-slate-900">Edit Exam</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Subject *"
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="glass-input w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                    />
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="glass-input w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder='Time e.g. "1:45 PM - 3" *'
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                      className="glass-input w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Room *"
                      value={editForm.room}
                      onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                      className="glass-input w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="glass-input w-full rounded-xl border-2 px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-500"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveEdit}
                        disabled={!editForm.subject || !editForm.date || !editForm.time || !editForm.room}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-400/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 rounded-xl bg-gradient-to-r from-slate-400 to-slate-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-300/50 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {filtered.map((exam, i) => (
                <div
                  key={exam.id}
                  className={`glass p-5 rounded-2xl flex flex-col gap-3 shadow-md border-2 border-white/60 transition-all duration-300 ${
                    flying ? "animate-pulse-glow" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Top Row: Subject + Remove button */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-block rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 px-3.5 py-1.5 text-sm font-extrabold text-purple-800 ring-2 ring-purple-300/80">
                      {exam.subject}
                    </span>
                    <button
                      onClick={() => removeExam(exam.id)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-300/50 transition-all duration-300 hover:scale-105 active:scale-90"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Detail list with high-contrast font weights */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-1 border-t border-slate-200/50 pt-3 text-sm">
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Date</span>
                      <span className={`inline-flex mt-1 rounded-lg bg-gradient-to-r px-2.5 py-1 font-bold ring-2 text-xs ${dateAccent(exam.date)}`}>
                        {formatDate(exam.date)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Time</span>
                      <span className="inline-flex mt-1 items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1 text-cyan-800 font-bold ring-2 ring-cyan-300/80 text-xs">
                        {exam.time}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1">
                      <div className="flex justify-between items-center bg-white/40 p-2.5 rounded-xl border border-white/50">
                        <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Day</span>
                          <span className="font-extrabold text-slate-800 text-sm">{exam.day}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Room</span>
                          <span className="font-extrabold text-slate-900 text-sm">{exam.room}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes + Action Buttons row */}
                    <div className="col-span-2 pt-1">
                      <div className="flex items-end justify-between gap-3 bg-white/40 p-2.5 rounded-xl border border-white/50">
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Notes</span>
                          <p className="mt-0.5 font-bold text-slate-700 text-sm truncate">
                            {exam.notes || "—"}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(exam)}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/50 transition-all duration-300 hover:scale-105 active:scale-90"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/50 bg-white/20 px-4 py-3 text-xs font-bold text-slate-700">
              {filtered.length} of {exams.length} exam{exams.length !== 1 ? "s" : ""} shown
            </div>
          </div>
        )}

        {/* ---------- Footer ---------- */}
        <div className="mt-8 text-center text-xs font-extrabold text-slate-700">
          Made by Dr. Mohamed Hegazi ✨
        </div>
      </div>
    </div>
  );
}

// ---------- Table Header Component ----------
function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`select-none px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-700 ${
        className ?? ""
      }`}
    >
      {children}
    </th>
  );
}
