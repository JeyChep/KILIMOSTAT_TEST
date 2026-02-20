import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

const ApiStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;
    fetch('/kilimostat-api/')
      .then(r => {
        if (!cancelled) setStatus(r.ok ? 'online' : 'offline');
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      });
    return () => { cancelled = true; };
  }, []);

  const cfg = {
    checking: { icon: <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600" />, text: 'Connecting…', cls: 'text-blue-600 bg-blue-50 border-blue-200' },
    online:   { icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,  text: 'API Online',   cls: 'text-green-600 bg-green-50 border-green-200' },
    offline:  { icon: <WifiOff className="h-3.5 w-3.5 text-red-500" />,        text: 'API Offline',  cls: 'text-red-600 bg-red-50 border-red-200' },
  }[status];

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${cfg.cls} ${className}`}>
      {cfg.icon}
      <span>{cfg.text}</span>
    </div>
  );
};

export default ApiStatus;
