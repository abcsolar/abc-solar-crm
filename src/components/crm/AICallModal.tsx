import { useState, useEffect, useRef } from 'react';
import {
  PhoneCall, PhoneOff, Mic, Play, Pause, RotateCcw, Volume2,
  Calendar, CheckCircle2, Clock, Sparkles, Bot, User, ShieldCheck,
  ChevronRight, ArrowRight, Zap, Check, AlertCircle, FileText,
} from 'lucide-react';
import type { Lead, AICallLog, AICallTranscriptEntry } from '@/types';
import { useStore, completeAICallAndQualify } from '@/store';
import { formatINR } from '@/utils';
import { generateCallScript } from '@/services/aiCalling';

interface AICallModalProps {
  lead: Lead;
  callLog?: AICallLog | null;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function AICallModal({ lead, callLog, onClose, onNavigate }: AICallModalProps) {
  const store = useStore();
  const config = store.aiCallingConfig;

  // View state: 'preview' | 'calling' | 'completed'
  const [viewState, setViewState] = useState<'preview' | 'calling' | 'completed'>(
    callLog ? 'completed' : 'preview'
  );

  // Active call data
  const [activeCallLog, setActiveCallLog] = useState<AICallLog | null>(callLog || null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState('Initiating AI Call...');
  const [revealedTranscriptCount, setRevealedTranscriptCount] = useState(1);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5>(1);
  const playerTimerRef = useRef<any>(null);

  // Script generated for this lead
  const scriptData = useRef(generateCallScript(lead, config.persona));

  // Handle calling simulation
  useEffect(() => {
    let timer: any = null;
    let transcriptTimer: any = null;

    if (viewState === 'calling') {
      setCallStatusText('Dialing +91 ' + lead.phone + ' via ' + config.provider.toUpperCase() + '...');

      const t1 = setTimeout(() => {
        setCallStatusText('Customer Phone Ringing...');
      }, 1500);

      const t2 = setTimeout(() => {
        setCallStatusText('Call Connected · AI Voice Agent Speaking');
        // Start duration counter
        timer = setInterval(() => {
          setCallDuration(d => d + 1);
        }, 1000);

        // Progressively reveal transcript dialogues
        let step = 1;
        transcriptTimer = setInterval(() => {
          step++;
          setRevealedTranscriptCount(step);
          if (step >= scriptData.current.transcript.length) {
            clearInterval(transcriptTimer);
          }
        }, 3200);
      }, 3500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        if (timer) clearInterval(timer);
        if (transcriptTimer) clearInterval(transcriptTimer);
      };
    }
  }, [viewState, lead.phone, config.provider]);

  function handleStartCall() {
    setViewState('calling');
    setCallDuration(0);
    setRevealedTranscriptCount(1);
  }

  function handleEndAndQualify(surveyConfirmed = true) {
    const finalLog: AICallLog = {
      id: `CALL-${Date.now().toString(36).toUpperCase()}`,
      leadId: lead.id,
      customerName: lead.name,
      customerPhone: lead.phone,
      district: lead.district,
      provider: config.provider,
      status: 'COMPLETED',
      durationSeconds: Math.max(callDuration, 65),
      startedAt: new Date(Date.now() - (callDuration || 65) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      summary: scriptData.current.summary,
      surveyConfirmed,
      confirmedDate: scriptData.current.confirmedDate,
      confirmedKw: lead.recommendedKw,
      confirmedRoofType: lead.roofType || 'RCC_FLAT',
      transcript: scriptData.current.transcript,
      recordingUrl: 'https://telephony.abcsolar.in/recordings/call_demo.mp3',
      sentiment: 'POSITIVE',
    };

    completeAICallAndQualify(finalLog, surveyConfirmed);
    setActiveCallLog(finalLog);
    setViewState('completed');
  }

  // Audio Player timer simulation
  const totalDuration = activeCallLog ? activeCallLog.durationSeconds : (scriptData.current.durationSeconds || 105);

  useEffect(() => {
    if (isPlaying) {
      playerTimerRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    }
    return () => {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    };
  }, [isPlaying, totalDuration, playbackSpeed]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg">AI Voice Calling Agent</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {config.provider.toUpperCase()} API
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Persona: <strong className="text-white">{config.persona}</strong> · Caller ID: {config.callerId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── 1. PREVIEW STATE ── */}
        {viewState === 'preview' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Customer Details Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Recipient</span>
                <p className="text-lg font-display font-bold text-slate-900">{lead.name}</p>
                <p className="text-xs text-slate-600 font-medium">📞 +91 {lead.phone} • 📍 {lead.district}, UP</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">System / Bill</span>
                  <span className="text-sm font-bold text-amber-600">{lead.recommendedKw} kW · {formatINR(lead.monthlyBill)}/mo</span>
                </div>
              </div>
            </div>

            {/* Calling Objective & Script Outline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Call Objectives & Script Flow</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">1</span>
                    Hinglish Greeting & Subsidy
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Politely greet on behalf of ABC Solar. Reassure up to ₹1,08,000 combined central + UPNEDA subsidy.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">2</span>
                    Technical Verification
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Verify monthly bill (₹{lead.monthlyBill}), recommend {lead.recommendedKw} kW on-grid, and verify roof type.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">3</span>
                    Free Site Survey Offer
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Offer complimentary site survey in {lead.district} with certified technician Vikas Yadav.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
                    Automated CRM Promotion
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    On positive confirmation, automatically upgrades lead to "Site Visit Scheduled" & creates Survey task.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCall}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-md transition-all active:scale-98"
              >
                <PhoneCall size={18} /> Start AI Call Now
              </button>
            </div>
          </div>
        )}

        {/* ── 2. IN-CALL LIVE SIMULATION ── */}
        {viewState === 'calling' && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1 flex flex-col justify-between">
            {/* Live Call Telephony Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Bot size={24} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-100">{lead.name}</p>
                  <p className="text-xs text-amber-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {callStatusText}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Call Duration</span>
                <span className="text-xl font-bold font-mono text-white tracking-wider">{formatTime(callDuration)}</span>
              </div>
            </div>

            {/* Audio Waveform Visualizer Mock */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-1 h-14">
              {[40, 65, 30, 85, 95, 50, 75, 40, 90, 60, 45, 80, 100, 70, 35, 85, 60, 90, 40, 70, 50, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(15, (h * (0.6 + 0.4 * Math.sin((callDuration * 3 + i) * 0.5))))}%`,
                  }}
                />
              ))}
            </div>

            {/* Live Streaming Dialogue Bubbles */}
            <div className="space-y-3 max-h-64 overflow-y-auto p-1 pr-2">
              {scriptData.current.transcript.slice(0, revealedTranscriptCount).map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 animate-fade-in ${
                    msg.speaker === 'ai' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {msg.speaker === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.speaker === 'ai'
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                        : 'bg-amber-600 text-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                      <span>{msg.speaker === 'ai' ? config.persona : lead.name}</span>
                      <span>{msg.timeOffsetSeconds}s</span>
                    </div>
                    {msg.text}
                  </div>
                  {msg.speaker === 'customer' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {lead.name.slice(0, 1)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* In-Call Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleEndAndQualify(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                <PhoneOff size={16} /> End Call (No Survey)
              </button>

              <button
                type="button"
                onClick={() => handleEndAndQualify(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <CheckCircle2 size={16} /> Customer Confirmed · Schedule Survey
              </button>
            </div>
          </div>
        )}

        {/* ── 3. COMPLETED STATE (Audio Player, Summary, Transcript) ── */}
        {viewState === 'completed' && activeCallLog && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Status & Outcome Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">AI Qualification Completed</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Answered &amp; Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Lead auto-promoted to <strong className="text-emerald-700 font-semibold">Site Visit Scheduled</strong>.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Duration</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{formatTime(activeCallLog.durationSeconds)}</span>
              </div>
            </div>

            {/* Audio Waveform Player Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Volume2 size={15} className="text-amber-400" />
                  <span>Call Recording Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlaybackSpeed(s => (s === 1 ? 1.5 : 1))}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {playbackSpeed}x Speed
                  </button>
                  <span className="font-mono text-slate-300 text-xs">
                    {formatTime(playbackTime)} / {formatTime(totalDuration)}
                  </span>
                </div>
              </div>

              {/* Scrubber + Waveform */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 transition-all shadow-md active:scale-95"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>

                <div
                  className="flex-1 h-8 bg-slate-800/80 rounded-xl px-2 flex items-center gap-1 cursor-pointer overflow-hidden relative"
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setPlaybackTime(Math.round(ratio * totalDuration));
                  }}
                >
                  {/* Progress background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-500/20 pointer-events-none transition-all"
                    style={{ width: `${(playbackTime / totalDuration) * 100}%` }}
                  />

                  {/* Waveform bars */}
                  {[35, 60, 45, 80, 95, 55, 70, 40, 85, 60, 50, 75, 90, 65, 40, 80, 60, 85, 50, 70, 45, 90, 65, 45, 75, 90, 55, 70].map((h, i) => {
                    const barPercent = (i / 28) * 100;
                    const isPassed = (playbackTime / totalDuration) * 100 >= barPercent;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${
                          isPassed ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Generated Call Summary Card */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Sparkles size={16} className="text-amber-600" />
                AI Generated Executive Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeCallLog.summary}
              </p>
              {activeCallLog.confirmedDate && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  <Calendar size={14} /> Site Survey Date: {activeCallLog.confirmedDate}
                </div>
              )}
            </div>

            {/* Full Conversation Transcript */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Call Transcript</h4>
              <div className="space-y-3 max-h-56 overflow-y-auto p-1 pr-2">
                {activeCallLog.transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.speaker === 'ai' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {msg.speaker === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                        msg.speaker === 'ai'
                          ? 'bg-slate-50 border border-slate-200 text-slate-800'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1 font-semibold">
                        <span>{msg.speaker === 'ai' ? config.persona : lead.name}</span>
                        <span>{msg.timeOffsetSeconds ? `${msg.timeOffsetSeconds}s` : ''}</span>
                      </div>
                      {msg.text}
                    </div>
                    {msg.speaker === 'customer' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {lead.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('surveys');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <FileText size={15} /> View in Site Surveys →
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs ml-auto"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

