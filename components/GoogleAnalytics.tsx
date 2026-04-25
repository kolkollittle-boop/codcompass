'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    // Load gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      (window.dataLayer as any[]).push(arguments);
    }
    gtag('js', new Date());
    gtag('config', gaId);
  }, [gaId]);

  return null;
}
