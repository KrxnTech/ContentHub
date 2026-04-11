import React from 'react';
import { Brain, Cpu, Activity, MessageSquare, Zap, Target } from 'lucide-react';

export default function AIThinkingPanel({ clip }) {

  if (!clip) return (
    <div className="card h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2a2a3a] bg-transparent">
      <Brain size={40} className="text-gray-600 mb-4 animate-pulse" />
      <h3 className="text-sm font-mono text-gray-400 uppercase">
        Select a clip
      </h3>
      <p className="text-xs text-gray-500 mt-2">
        View AI analysis for selected segment
      </p>
    </div>
  );

  const analysis = clip.analysis || {
    text_importance: 0.7,
    emotion_intensity: 0.6,
    audio_energy: 0.5,
    keyword_density: 0.4,
    topic_shift: false
  };

  const metrics = [
    { label: 'Text Importance', value: analysis.text_importance, icon: MessageSquare },
    { label: 'Emotion Intensity', value: analysis.emotion_intensity, icon: Activity },
    { label: 'Audio Energy', value: analysis.audio_energy, icon: Zap },
    { label: 'Keyword Density', value: analysis.keyword_density, icon: Target },
    { label: 'Confidence Score', value: clip.confidence || 0.85, icon: Cpu },
  ];

  return (
    <div className="card flex flex-col animate-fade-in overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6 p-4 -m-4 border-b border-[#2a2a3a] bg-[#12121a]">
        <Brain size={14} className="text-[#00ff88]" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#00ff88]">
          AI Analysis
        </h3>
      </div>

      {/* METRICS */}
      <div className="space-y-5 flex-1 py-4">

        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">

            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-2 text-gray-400">
                <m.icon size={12} className="text-[#00ff88]" />
                <span>{m.label}</span>
              </div>

              <span className="text-white">
                {(m.value * 100).toFixed(0)}%
              </span>
            </div>

            <div className="h-1 w-full bg-[#12121a] border border-[#2a2a3a] overflow-hidden">

              <div
                className="h-full bg-[#00ff88] transition-all duration-700"
                style={{ width: `${m.value * 100}%` }}
              />

            </div>

          </div>
        ))}

        {/* REASON */}
        <div className="mt-6 p-3 border border-[#2a2a3a] bg-[#12121a] space-y-2">

          <div className="flex items-center gap-2 text-[#00ff88] text-[10px] font-mono uppercase">
            <Brain size={10} />
            Logic
          </div>

          <p className="text-xs text-gray-400 italic leading-relaxed">
            "{clip.aiReason || clip.reason}"
          </p>

        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-[#2a2a3a] p-4 -m-4 text-[10px] font-mono text-gray-500 flex justify-between">

        <span className="flex items-center gap-1">
          <Cpu size={10} />
          Llama3-70B
        </span>

        <span>Finalized</span>

      </div>

    </div>
  );
}