import { useState, useEffect } from 'react';
import { Trash2, Circle, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../lib/config';
import { getTimeAgo, formatDateGroup, round2 } from '../lib/utils';

export default function HistoryPage() {
  const { showError, showToast, setActivePage } = useApp();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      let mergedHistory = data.history || [];

      // Merge barcode scans from localStorage
      const localHistoryStr = localStorage.getItem('food_history');
      if (localHistoryStr) {
        try {
          const localHistory = JSON.parse(localHistoryStr);
          mergedHistory = mergedHistory.concat(localHistory);
        } catch (e) {}
      }

      // Sort descending
      mergedHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(mergedHistory);
    } catch (err) {
      console.error('History error:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id) => {
    try {
      if (id.toString().startsWith('scan_')) {
        let historyStr = localStorage.getItem('food_history');
        if (historyStr) {
          let localHistory = JSON.parse(historyStr);
          localHistory = localHistory.filter(item => item.id !== id);
          localStorage.setItem('food_history', JSON.stringify(localHistory));
        }
      } else {
        const res = await fetch(`${API_URL}/history/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
      }
      loadHistory();
    } catch (err) {
      console.error('Delete error:', err);
      showError('Could not delete scan.');
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Clear all scan history? This cannot be undone.')) return;
    try {
      localStorage.removeItem('food_history');
      await fetch(`${API_URL}/history`, { method: 'DELETE' });
      loadHistory();
      showToast('History cleared.', 'success');
    } catch (err) {
      console.error('Clear error:', err);
      showError('Could not clear history.');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Group by date
  const groups = {};
  history.forEach(item => {
    const dateKey = formatDateGroup(item.created_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  });

  // Stats
  const total = history.length;
  const totalCal = history.reduce((sum, s) => sum + (s.calories || 0), 0);
  const topFood = total > 0 ? Object.entries(history.reduce((acc, s) => { acc[s.food] = (acc[s.food] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0][0] : '—';
  const avgConf = total > 0 ? (history.reduce((sum, s) => sum + (s.confidence || 0), 0) / total).toFixed(1) : '—';

  return (
    <div id="page-history">
      <section className="history-section">
        <div className="history-hero">
          <h2 className="history-title">
            Your Scan <span className="gradient-text">History</span>
          </h2>
          <p className="history-subtitle">
            Track your food discoveries, nutrition logs, and barcode scans over time.
          </p>
        </div>

        {loading ? (
          <div className="history-loading">Loading...</div>
        ) : history.length === 0 ? (
          <div id="history-empty" className="history-empty">
            <div className="empty-icon"><Globe className="icon-inline" /></div>
            <h3>No scans yet</h3>
            <p>Start by classifying a food item or scanning a barcode.</p>
            <button className="btn-go-classify" onClick={() => setActivePage('classify')}>
              Start Scanning
            </button>
          </div>
        ) : (
          <>
            <div className="history-toolbar">
              <div className="history-stats">
                <div className="stat-item">
                  <span className="stat-val">{total}</span>
                  <span className="stat-lbl">Total Scans</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{Math.round(totalCal).toLocaleString()}</span>
                  <span className="stat-lbl">Total Calories</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{topFood}</span>
                  <span className="stat-lbl">Top Food</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{avgConf}%</span>
                  <span className="stat-lbl">Avg Confidence</span>
                </div>
              </div>
              <button className="btn-clear-history" onClick={clearAllHistory}>
                <Trash2 className="icon-inline" /> Clear All
              </button>
            </div>

            <div id="history-timeline" className="history-timeline">
              {Object.entries(groups).map(([dateLabel, scans]) => (
                <div key={dateLabel}>
                  <div className="history-date-group">{dateLabel}</div>
                  {scans.map((scan, i) => {
                    const conf = scan.confidence != null ? scan.confidence.toFixed(1) : '-';
                    const confDisplay = scan.isBarcode ? 'Barcode' : `${conf}%`;
                    const timeAgo = getTimeAgo(scan.created_at);

                    return (
                      <div key={scan.id} className="history-card" style={{ animationDelay: `${Math.min(i * 0.06, 0.6)}s` }}>
                        <button
                          className="history-delete-btn"
                          title="Delete scan"
                          onClick={() => deleteScan(scan.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="history-card-top">
                          <div className="history-card-food">
                            <div className="history-food-emoji">
                              <Circle size={18} />
                            </div>
                            <div className="history-food-info">
                              <div className="history-food-name">{scan.food}</div>
                              <div className="history-food-meta">
                                <span className="history-confidence-chip">{confDisplay}</span>
                                {scan.grade && (
                                  <span className={`history-grade-chip grade-${scan.grade.toLowerCase()}`}>
                                    Grade {scan.grade.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="history-time-badge">{timeAgo}</div>
                        </div>
                        <div className="history-nutrients">
                          {scan.weight_g != null && <span className="history-nut-chip chip-weight">{Math.round(scan.weight_g)}g</span>}
                          {scan.calories != null && <span className="history-nut-chip chip-cal">{Math.round(scan.calories)} kcal</span>}
                          {scan.protein != null && <span className="history-nut-chip chip-pro">{round2(scan.protein)}g pro</span>}
                          {scan.carbs != null && <span className="history-nut-chip chip-carb">{round2(scan.carbs)}g carb</span>}
                          {scan.fat != null && <span className="history-nut-chip chip-fat">{round2(scan.fat)}g fat</span>}
                          {scan.fiber != null && <span className="history-nut-chip chip-fiber">{round2(scan.fiber)}g fiber</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}