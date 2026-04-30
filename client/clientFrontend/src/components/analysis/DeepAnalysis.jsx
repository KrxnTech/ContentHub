import { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, Target, Clock, Zap, Hash, Music, Scissors, X, Loader2, BarChart3, Copy, Check, Sparkles, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function DeepAnalysis({ clip, transcript, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchDeepAnalysis();
  }, [clip, transcript]);

  const fetchDeepAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clip_data: clip,
          transcript_segments: transcript || []
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError('Failed to load analysis');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0a0a0f',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00ff88',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0a0a0f',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00ff88',
        borderWidth: 1
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false
        },
        grid: {
          color: '#2a2a3a'
        },
        angleLines: {
          color: '#2a2a3a'
        },
        pointLabels: {
          color: '#fff',
          font: {
            size: 10
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00ff88] animate-spin mx-auto mb-4" />
          <p className="text-white font-mono text-sm">Analyzing clip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-red-500 font-mono text-sm mb-4">Error: {error}</p>
          <button onClick={onClose} className="text-white font-mono text-sm border border-[#00ff88] px-4 py-2 hover:bg-[#00ff88]/10">
            Close
          </button>
        </div>
      </div>
    );
  }

  const visualData = analysis?.visual_data || {};
  const retentionCurve = analysis?.retention_curve || [];
  const clipInfo = analysis?.clip_data || clip;

  // Chart data
  const radarData = {
    labels: ['Engagement', 'Retention', 'Emotion', 'Virality'],
    datasets: [{
      data: [
        visualData.engagement || 0,
        visualData.retention || 0,
        visualData.emotion || 0,
        visualData.virality || 0
      ],
      backgroundColor: 'rgba(0, 255, 136, 0.2)',
      borderColor: '#00ff88',
      borderWidth: 2,
      pointBackgroundColor: '#00ff88',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#00ff88'
    }]
  };

  const retentionData = {
    labels: retentionCurve.map(p => p.time + 's'),
    datasets: [{
      label: 'Retention',
      data: retentionCurve.map(p => p.retention),
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00ff88',
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const retentionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0a0a0f',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00ff88',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: '#2a2a3a'
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10
          }
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#2a2a3a'
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10
          },
          callback: (value) => value + '%'
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-2">
      <div className="w-full max-w-7xl max-h-[98vh] flex flex-col bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a] shrink-0">
          <div>
            <h1 className="text-xl font-mono text-white mb-1">Deep Clip Analysis</h1>
            <p className="text-gray-400 text-xs font-mono">{clipInfo.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Video Player + Transcript */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Video Player */}
            <div className="card p-3">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#2a2a3a]">
                <video
                  ref={videoRef}
                  src={clip?.clipUrl || clipInfo?.clipUrl}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            </div>

            {/* Transcript/Lyrics Box */}
            <div className="card p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="text-[#00ff88]" size={14} />
                  <h3 className="text-xs font-mono text-white">Transcript</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{formatTime(currentTime)}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 max-h-48">
                {!transcript || transcript.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-[10px] font-mono py-4">
                    No transcript available
                  </div>
                ) : (
                  transcript
                    .filter(item =>
                      item.start >= (clip?.startTime || 0) &&
                      item.end <= (clip?.endTime || 60)
                    )
                    .map((item, i) => {
                      const isCurrent = currentTime >= item.start && currentTime <= item.end;
                      return (
                        <div
                          key={i}
                          className={`flex gap-2 p-1.5 rounded transition-all ${
                            isCurrent
                              ? 'bg-[#00ff88]/20 border border-[#00ff88]/40'
                              : 'bg-[#12121a] border border-[#2a2a3a] opacity-60'
                          }`}
                        >
                          <div className="shrink-0 text-[10px] font-mono text-gray-500">
                            {formatTime(item.start)}
                          </div>
                          <div className={`text-[11px] leading-tight ${isCurrent ? 'text-[#00ff88]' : 'text-gray-400'}`}>
                            {item.text}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Visual Scores - Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="text-[#00ff88]" size={16} />
                <h2 className="text-sm font-mono text-white">Performance Metrics</h2>
              </div>
              <div className="h-48">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* Score Cards with Reasoning */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Engagement', value: visualData.engagement, color: '#00ff88', key: 'engagement' },
                { label: 'Retention', value: visualData.retention, color: '#3b82f6', key: 'retention' },
                { label: 'Emotion', value: visualData.emotion, color: '#a855f7', key: 'emotion' },
                { label: 'Virality', value: visualData.virality, color: '#ec4899', key: 'virality' }
              ].map((item) => (
                <div key={item.label} className="card p-3">
                  <div className="text-gray-400 text-[10px] font-mono mb-1">{item.label}</div>
                  <div className="text-2xl font-mono text-white mb-1">{item.value || 0}</div>
                  <div className="w-full bg-[#2a2a3a] rounded-full h-1.5 mb-1">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${item.value || 0}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <p className="text-gray-500 text-[9px] leading-tight line-clamp-2">
                    {analysis?.metrics_reasoning?.[item.key]?.reasoning || ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Score — 5-Factor Weighted Breakdown */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-[#00ff88]" size={16} />
              <h2 className="text-sm font-mono text-white">AI Confidence Score</h2>
              <span className="ml-auto text-3xl font-mono font-black text-[#00ff88]">
                {analysis?.confidence || 0}%
              </span>
            </div>

            {/* Formula label */}
            <p className="text-[10px] font-mono text-gray-500 mb-3">
              = (0.30×Clarity) + (0.25×Engagement) + (0.20×Retention) + (0.15×Audio) + (0.10×Emotion)
            </p>

            <div className="space-y-2">
              {[
                { key: 'clarity',    label: 'Content Clarity',         weight: 0.30, color: '#00ff88' },
                { key: 'engagement', label: 'Engagement Strength',     weight: 0.25, color: '#3b82f6' },
                { key: 'retention',  label: 'Retention Stability',     weight: 0.20, color: '#a855f7' },
                { key: 'audio',      label: 'Audio Quality',           weight: 0.15, color: '#f59e0b' },
                { key: 'emotion',    label: 'Emotional Signal Strength', weight: 0.10, color: '#ec4899' },
              ].map(({ key, label, weight, color }) => {
                const raw   = analysis?.confidence_breakdown?.[key] ?? 0;
                const wtd   = (raw * weight).toFixed(1);
                const pct   = `${(weight * 100).toFixed(0)}%`;
                const grade = raw >= 75 ? 'High' : raw >= 50 ? 'Mid' : 'Low';
                return (
                  <div key={key} className="bg-[#12121a] border border-[#2a2a3a] rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">w={pct}</span>
                        <span className="text-[10px] font-mono" style={{ color }}>
                          {raw} → +{wtd}
                        </span>
                        <span className={`text-[9px] font-mono px-1 rounded ${
                          grade === 'High' ? 'bg-green-500/20 text-green-400'
                          : grade === 'Mid' ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                        }`}>{grade}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#2a2a3a] rounded-full h-1">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{ width: `${raw}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] font-mono text-gray-500 mt-3 leading-relaxed">
              {analysis?.confidence_reasoning || ''}
            </p>
          </div>

          {/* Retention Curve - Line Chart */}
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-[#00ff88]" size={16} />
              <h2 className="text-sm font-mono text-white">Retention Curve</h2>
            </div>
            <div className="h-36 mb-3">
              <Line data={retentionData} options={retentionOptions} />
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3a]">
              <p className="text-gray-400 text-[10px] mb-1">{analysis?.retention_analysis?.explanation || ''}</p>
              {analysis?.retention_analysis?.drop_points?.length > 0 && (
                <div className="mb-1">
                  <span className="text-red-400 text-[10px] font-mono">Drop Points:</span>
                  <ul className="text-gray-500 text-[10px] mt-0.5 space-y-0.5">
                    {analysis.retention_analysis.drop_points.map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis?.retention_analysis?.peak_points?.length > 0 && (
                <div>
                  <span className="text-[#00ff88] text-[10px] font-mono">Peak Points:</span>
                  <ul className="text-gray-500 text-[10px] mt-0.5 space-y-0.5">
                    {analysis.retention_analysis.peak_points.map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Hook Analysis */}
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-[#00ff88]" size={16} />
              <h2 className="text-sm font-mono text-white">Hook Analysis (First 3-5s)</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${analysis?.hook_analysis?.is_scroll_stopping ? 'text-[#00ff88]' : 'text-red-400'}`}>
                  {analysis?.hook_analysis?.is_scroll_stopping ? '✓ SCROLL-STOPPING' : '✗ NOT SCROLL-STOPPING'}
                </span>
                <span className="text-gray-500 text-[10px] font-mono">
                  ({analysis?.hook_analysis?.strength?.toUpperCase() || 'UNKNOWN'} hook)
                </span>
              </div>
              <p className="text-gray-300 text-xs">{analysis?.hook_analysis?.description || ''}</p>
              {!analysis?.hook_analysis?.is_scroll_stopping && (
                <div className="bg-red-500/10 border border-red-500/30 p-2 rounded">
                  <p className="text-red-400 text-[10px] font-mono">FIX REQUIRED:</p>
                  <p className="text-gray-300 text-[10px] mt-1">{analysis?.hook_analysis?.fix || ''}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Clip Summary */}
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-[#00ff88]" size={14} />
                <h2 className="text-xs font-mono text-white">Clip Summary</h2>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{analysis?.clip_summary || 'No summary available'}</p>
            </div>

            {/* Virality Breakdown */}
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-[#00ff88]" size={14} />
                <h2 className="text-xs font-mono text-white">Virality Breakdown</h2>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Emotional Trigger', value: analysis?.virality_breakdown?.emotional_trigger },
                  { label: 'Relatability', value: analysis?.virality_breakdown?.relatability },
                  { label: 'Surprise Factor', value: analysis?.virality_breakdown?.surprise_factor },
                  { label: 'Trend Compatibility', value: analysis?.virality_breakdown?.trend_compatibility }
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-1">
                    <span className="text-gray-400 text-[10px] font-mono w-24 shrink-0">{item.label}:</span>
                    <span className="text-gray-300 text-[10px]">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Psychology */}
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-[#00ff88]" size={14} />
                <h2 className="text-xs font-mono text-white">Audience Psychology</h2>
              </div>
              <div className="space-y-1">
                <div className="flex items-start gap-1">
                  <span className="text-gray-400 text-[10px] font-mono w-28 shrink-0">Target Audience:</span>
                  <span className="text-gray-300 text-[10px]">{analysis?.audience_psychology?.target_audience || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-400 text-[10px] font-mono w-28 shrink-0">Stop Scrolling:</span>
                  <span className="text-gray-300 text-[10px]">{analysis?.audience_psychology?.stop_scrolling_reason || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-400 text-[10px] font-mono w-28 shrink-0">Triggered Emotion:</span>
                  <span className="text-gray-300 text-[10px]">{analysis?.audience_psychology?.triggered_emotion || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Shorts Ready Content */}
          <div className="card p-3 border-2 border-[#00ff88]/30">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="text-[#00ff88]" size={16} />
              <h2 className="text-sm font-mono text-white">YouTube Shorts Ready Content</h2>
            </div>
            <div className="space-y-2">
              {/* Title Options */}
              <div>
                <h3 className="text-gray-400 text-[10px] font-mono mb-1">Title Options (3)</h3>
                <div className="space-y-1">
                  {(analysis?.youtube_shorts?.titles || [analysis?.youtube_shorts?.title]).map((title, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="text-white text-xs font-mono bg-[#12121a] p-1.5 rounded border border-[#2a2a3a] flex-1">
                        {title || 'N/A'}
                      </p>
                      <button
                        onClick={() => copyToClipboard(title || '', `title${i}`)}
                        className="ml-2 text-[#00ff88] hover:text-white transition-colors"
                      >
                        {copied === `title${i}` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-gray-400 text-[10px] font-mono">Description</h3>
                  <button
                    onClick={() => copyToClipboard(analysis?.youtube_shorts?.description || '', 'description')}
                    className="text-[#00ff88] hover:text-white transition-colors"
                  >
                    {copied === 'description' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-gray-300 text-xs bg-[#12121a] p-2 rounded border border-[#2a2a3a]">
                  {analysis?.youtube_shorts?.description || 'N/A'}
                </p>
              </div>
              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-gray-400 text-[10px] font-mono">Hashtags (10-15)</h3>
                  <button
                    onClick={() => copyToClipboard((analysis?.youtube_shorts?.hashtags || []).map(t => `#${t}`).join(' '), 'hashtags')}
                    className="text-[#00ff88] hover:text-white transition-colors"
                  >
                    {copied === 'hashtags' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(analysis?.youtube_shorts?.hashtags || []).map((tag, i) => (
                    <span key={i} className="text-[#00ff88] text-[10px] font-mono border border-[#00ff88]/30 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Improvements */}
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-3">
              <Scissors className="text-[#00ff88]" size={16} />
              <h2 className="text-sm font-mono text-white">Actionable Improvements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { label: 'Hook Fix', value: analysis?.improvements?.hook_fix, icon: <Zap size={12} /> },
                { label: 'Cut Optimization', value: analysis?.improvements?.cut_optimization, icon: <Scissors size={12} /> },
                { label: 'Subtitles', value: analysis?.improvements?.subtitles, icon: <Hash size={12} /> },
                { label: 'Visual Effects', value: analysis?.improvements?.visual_effects, icon: <Sparkles size={12} /> },
                { label: 'Audio/Music', value: analysis?.improvements?.audio_music, icon: <Music size={12} /> }
              ].map((item) => (
                <div key={item.label} className="bg-[#12121a] border border-[#2a2a3a] p-2 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[#00ff88]">{item.icon}</span>
                    <span className="text-gray-400 text-[10px] font-mono">{item.label}</span>
                  </div>
                  <p className="text-gray-300 text-[10px]">{item.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
