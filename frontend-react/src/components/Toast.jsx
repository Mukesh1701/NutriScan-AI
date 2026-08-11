import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ visible: false, message: '', type: 'info' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, setToast]);

  if (!toast.visible) return null;

  return (
    <div className={`error-toast visible ${toast.type === 'success' ? 'success' : toast.type === 'info' ? 'info' : 'error'}`}>
      <span className="error-icon">
        {toast.type === 'error' ? <AlertTriangle className="icon-inline" /> : null}
        {toast.type === 'success' ? <CheckCircle2 className="icon-inline" /> : null}
        {toast.type === 'info' ? <Info className="icon-inline" /> : null}
      </span>
      <span className="error-msg">{toast.message}</span>
      <button className="error-close" onClick={() => setToast({ visible: false, message: '', type: 'info' })}>
        <X size={14} />
      </button>
    </div>
  );
}
