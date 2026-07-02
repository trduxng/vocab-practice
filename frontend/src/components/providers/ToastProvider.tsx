'use client';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <Toaster position="top-right" richColors closeButton />;
}
