"use client";
import { useState, useEffect } from "react";
import {
  Mic2,
  Upload,
  LogOut,
  FileAudio,
  History,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Transcript = {
  id: string;
  text: string;
  createdAt?: string;
};

type User = {
  email: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("/api/session");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setUser({ email: data.user });
      fetchTranscripts();
    };
    checkSession();
  }, []);

  const upload = async () => {
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("❌ Audio must be less than 5MB");
      return;
    }

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = async () => {
      if (audio.duration > 60) {
        alert("❌ Audio must be less than 1 minute");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setFile(null);
        fetchTranscripts();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
  };

  const fetchTranscripts = async () => {
    const res = await fetch("/api/transcripts");
    if (res.ok) {
      const data = await res.json();
      setTranscripts(data);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col p-6 lg:h-screen lg:sticky lg:top-0">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Mic2 size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            TranscribeAI
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <History size={18} />
            Dashboard
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {user?.email?.[0].toUpperCase() || "A"}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.email || "admin"}
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-10 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Audio Transcription
          </h1>
          <p className="text-slate-500 mt-1">
            Convert your voice notes into text instantly.
          </p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-10 transition-all hover:border-blue-200">
          <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
              file
                ? "border-blue-400 bg-blue-50/30"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div
              className={`p-4 rounded-full mb-4 ${file ? "bg-blue-100 text-blue-600" : "bg-white shadow-sm text-slate-400"}`}
            >
              <Upload size={32} />
            </div>

            <label className="cursor-pointer text-center">
              <span className="text-blue-600 font-semibold hover:underline">
                Click to upload
              </span>
              <span className="text-slate-500"> or drag and drop</span>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                MP3, WAV, M4A (Max 1 min)
              </p>
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {file && (
              <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-blue-100 shadow-sm">
                <FileAudio size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-slate-700">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-red-500 ml-2"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={upload}
              disabled={!file || loading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Transcribing...
                </>
              ) : (
                "Start Transcription"
              )}
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-slate-400" />
              Recent Transcripts
            </h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {transcripts.length} Files
            </span>
          </div>

          {transcripts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400">
                No transcripts found. Upload an audio to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={14} />
                      Completed
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
