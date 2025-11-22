/**
 * Facebook Conversion API
 * Server-side event tracking for better attribution
 */

interface ConversionEvent {
  eventName: string;
  eventId?: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    contentIds?: string[];
    contentName?: string;
    contentType?: string;
  };
  eventSourceUrl?: string;
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'other';
}

/**
 * Send event to Facebook Conversion API
 */
export async function sendConversionEvent(event: ConversionEvent) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.FB_CONVERSION_API_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('Facebook Conversion API not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              event_name: event.eventName,
              event_id: event.eventId || `${Date.now()}-${Math.random()}`,
              event_time: Math.floor(Date.now() / 1000),
              action_source: event.actionSource || 'website',
              user_data: event.userData
                ? {
                    ...(event.userData.email && {
                      em: hashData(event.userData.email),
                    }),
                    ...(event.userData.phone && {
                      ph: hashData(event.userData.phone),
                    }),
                    ...(event.userData.firstName && {
                      fn: hashData(event.userData.firstName),
                    }),
                    ...(event.userData.lastName && {
                      ln: hashData(event.userData.lastName),
                    }),
                    ...(event.userData.externalId && {
                      external_id: hashData(event.userData.externalId),
                    }),
                  }
                : undefined,
              custom_data: event.customData,
              event_source_url: event.eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
            },
          ],
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      console.error('Facebook Conversion API error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send conversion event:', error);
  }
}

/**
 * Hash data for Facebook (SHA-256)
 */
function hashData(data: string): string {
  // In production, use crypto.subtle.digest or a server-side hash
  // For now, return a placeholder (should be hashed server-side)
  return data; // TODO: Implement proper hashing
}

/**
 * Track purchase event
 */
export async function trackPurchase(
  value: number,
  currency: string = 'PKR',
  contentIds?: string[],
  userData?: ConversionEvent['userData']
) {
  await sendConversionEvent({
    eventName: 'Purchase',
    customData: {
      currency,
      value,
      contentIds,
      contentType: 'product',
    },
    userData,
    actionSource: 'website',
  });
}

/**
 * Track add to cart event
 */
export async function trackAddToCart(
  value: number,
  currency: string = 'PKR',
  contentIds?: string[],
  userData?: ConversionEvent['userData']
) {
  await sendConversionEvent({
    eventName: 'AddToCart',
    customData: {
      currency,
      value,
      contentIds,
      contentType: 'product',
    },
    userData,
    actionSource: 'website',
  });
}

/**
 * Track initiate checkout event
 */
export async function trackInitiateCheckout(
  value: number,
  currency: string = 'PKR',
  contentIds?: string[],
  userData?: ConversionEvent['userData']
) {
  await sendConversionEvent({
    eventName: 'InitiateCheckout',
    customData: {
      currency,
      value,
      contentIds,
      contentType: 'product',
    },
    userData,
    actionSource: 'website',
  });
}

/**
 * Track page view event
 */
export async function trackPageView(
  userData?: ConversionEvent['userData']
) {
  await sendConversionEvent({
    eventName: 'PageView',
    userData,
    actionSource: 'website',
  });
}

