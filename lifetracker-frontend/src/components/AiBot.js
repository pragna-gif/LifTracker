import { useState } from 'react';
import api from '../api/axios';
import './AiBot.css';

export default function AiBot({ pageType, getData }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const handleAsk = async () => {
    setOpen(true);
    if (asked) return;
    setLoading(true);
    try {
      const dataContext = getData ? JSON.stringify(getData()) : '{}';
      const res = await api.post('/ai/suggest', { pageType, dataContext });
      setSuggestions(res.data.suggestions);
      setAsked(true);
    } catch {
      setSuggestions('Could not load suggestions. Make sure the backend is running and your Gemini API key is set in application-local.yml.');
    } finally {
      setLoading(false);
    }
  };

  const PAGE_LABELS = {
    expenses:  { emoji: '💸', label: 'Finance Tips'    },
    dsa:       { emoji: '🧠', label: 'DSA Tips'        },
    gym:       { emoji: '💪', label: 'Workout Tips'    },
    content:   { emoji: '✍️', label: 'Content Tips'    },
    food:      { emoji: '🍕', label: 'Nutrition Tips'  },
    cafe:      { emoji: '☕', label: 'Café Tips'       },
    dashboard: { emoji: '🤖', label: 'Life Coach'      },
  };

  const { emoji, label } = PAGE_LABELS[pageType] || { emoji: '🤖', label: 'AI Tips' };

  // Format numbered suggestions nicely
  const formatSuggestions = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const isNumbered = /^\d+[\.\)]/.test(trimmed);
      return (
        <div key={i} className={`ai-line ${isNumbered ? 'ai-tip' : 'ai-text'}`}>
          {isNumbered && <span className="ai-bullet">✦</span>}
          <span>{trimmed.replace(/^\d+[\.\)]\s*/, '')}</span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="aibot-wrapper">
      {open && (
        <div className="aibot-panel">
          <div className="aibot-header">
            <span>{emoji} AI {label}</span>
            <button className="aibot-close" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="aibot-body">
            {loading ? (
              <div className="aibot-loading">
                <div className="aibot-spinner" />
                <span>Thinking...</span>
              </div>
            ) : (
              <div className="aibot-suggestions">
                {formatSuggestions(suggestions)}
              </div>
            )}
          </div>
          {asked && !loading && (
            <button className="aibot-refresh" onClick={() => { setAsked(false); handleAsk(); }}>
              ↻ Refresh suggestions
            </button>
          )}
        </div>
      )}

      <button className="aibot-fab" onClick={handleAsk} title={`Get ${label}`}>
        <span className="fab-emoji">{emoji}</span>
        <span className="fab-label">AI Tips</span>
      </button>
    </div>
  );
}
