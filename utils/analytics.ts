// Analytics utility — wraps GA4 / Plausible events
// Respects cookie consent before firing

export type AnalyticsEvent =
  | { name: 'page_view'; path: string }
  | { name: 'donate_click'; projectId: string }
  | { name: 'create_campaign_click' }
  | { name: 'wallet_connect'; wallet: string }
  | { name: 'donation_complete'; projectId: string; amount: number; asset: string }
  | { name: 'form_submit'; form: string }
  | { name: 'newsletter_signup' };

type AnalyticsFn = (
  command: string,
  eventName: string,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: AnalyticsFn;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('analytics_consent') === 'true';
}

export function trackEvent(event: AnalyticsEvent): void {
  if (!hasConsent()) return;

  // GA4
  if (typeof window !== 'undefined' && window.gtag) {
    const { name, ...params } = event;
    window.gtag('event', name, params);
  }

  // Plausible
  if (typeof window !== 'undefined' && window.plausible) {
    const { name, ...props } = event;
    window.plausible(name, { props });
  }
}

export function setAnalyticsConsent(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('analytics_consent', String(value));
}

export function getAnalyticsConsent(): boolean | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem('analytics_consent');
  if (val === null) return null;
  return val === 'true';
}
