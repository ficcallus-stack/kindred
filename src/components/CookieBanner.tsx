"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('kindredcare_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kindredcare_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('kindredcare_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:max-w-md w-full z-50 p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-2xl md:rounded-[2rem] animate-in slide-in-from-bottom-8 duration-500">
      <h3 className="font-headline text-lg font-bold text-primary mb-2">We respect your privacy</h3>
      <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
        We use extremely strictly necessary cookies to keep our platform secure and functional. We also politely ask to use performance cookies to understand traffic. Check our <Link href="/cookies" className="text-secondary font-bold hover:underline">Cookie Policy</Link>.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleAccept} className="flex-1 bg-primary text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
          Accept All
        </button>
        <button onClick={handleDecline} className="flex-1 bg-surface-container-high text-primary py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-container-highest transition-colors border border-outline-variant/10">
          Essential Only
        </button>
      </div>
    </div>
  );
}
