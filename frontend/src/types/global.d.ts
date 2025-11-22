/**
 * Global type declarations
 */

interface Window {
  gtag?: (
    command: string,
    targetId: string | Date,
    config?: Record<string, any>
  ) => void;
  dataLayer?: any[];
  fbq?: (
    command: string,
    eventName: string,
    params?: Record<string, any>
  ) => void;
}

