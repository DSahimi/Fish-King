import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'danger' | 'warning';
  visible: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, visible }) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  if (!show) return null;

  // Styles optimized for cinematic look
  const styles = {
    info: 'text-white bg-black/40 border-white/10',
    success: 'text-green-400 bg-black/80 border-green-500/50',
    danger: 'text-red-500 bg-black/80 border-red-500/50',
    warning: 'text-yellow-400 bg-black/80 border-yellow-500/50'
  };

  return (
    <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full text-center">
      <div className={`inline-block px-12 py-6 ${styles[type]} backdrop-blur-md border-y-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200`}>
        <h1 className="text-4xl font-cinzel font-bold uppercase tracking-[0.2em] drop-shadow-lg">
            {message}
        </h1>
      </div>
    </div>
  );
};