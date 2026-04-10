import React from 'react';
import { Brain, Cpu, Activity, MessageSquare, Zap, Target } from 'lucide-react';

export default function AIThinkingPanel({ clip }) {
  if (!clip) return (
    <div className="card h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10 bg-transparent">
      <Brain size={48} className="text-gray-600 mb-4 animate-pulse" />
      <h3 className="text-lg font-medium text-gray-400">Select a clip to see AI analysis</h3>
      <p className="text-sm text-gray-600 mt-2">See how the AI brain decided this moment was worth clipping.</p>
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
    { label: 'Text Importance', value: analysis.text_importance, icon: MessageSquare, color: 'text-sky-400' },
    { label: 'Emotion Intensity', value: analysis.emotion_intensity, icon: Activity, color: 'text-pink-400' },
    { label: 'Audio Energy', value: analysis.audio_energy, icon: Zap, color: 'text-yellow-400' },
    { label: 'Keyword Density', value: analysis.keyword_density, icon: Target, color: 'text-purple-400' },
    { label: 'Confidence Score', value: clip.confidence || 0.85, icon: Cpu, color: 'text-green-400' },
  ];

  return (
    <div className="card h-full overflow-hidden flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-6 p-4 -m-4 bg-white/5 border-b border-white/10">
        <Brain className="text-purple-400" />
        <h3 className="font-bold text-white uppercase tracking-wider text-sm">AI Analysis Breakdown</h3>
      </div>

      <div className="space-y-6 flex-1 py-4">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <m.icon size={14} className={m.color} />
                <span>{m.label}</span>
              </div>
              <span className="font-mono text-white">{(m.value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ 
                    width: `${m.value * 100}%`,
                    backgroundColor: i === 0 ? '#38bdf8' : i === 1 ? '#f472b6' : i === 2 ? '#fbbf24' : i === 3 ? '#a855f7' : '#4ade80'
                }}
              />
            </div>
          </div>
        ))}
        
        <div className="mt-8 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">
                <Brain size={12} />
                Logic Explanation
            </div>
            <p className="text-xs text-gray-400 italic leading-relaxed">
                "{clip.aiReason || clip.reason}"
            </p>
        </div>
      </div>

      <div className="mt-auto pt-6 text-[10px] text-gray-500 flex items-center justify-between border-t border-white/10 p-4 -m-4 bg-black/20">
        <span className="flex items-center gap-1 uppercase">
            <Cpu size={10} />
            Model: Llama3-70B
        </span>
        <span className="uppercase">Processing State: Finalized</span>
      </div>
    </div>
  );
}
