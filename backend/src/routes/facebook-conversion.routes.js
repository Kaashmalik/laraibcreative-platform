/**
 * Facebook Conversion API Route
 * Server-side event tracking endpoint
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * Hash data for Facebook (SHA-256)
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * POST /api/v1/facebook/conversion
 * Send event to Facebook Conversion API
 */
router.post('/conversion', async (req, res) => {
  try {
    const pixelId = process.env.FB_PIXEL_ID;
    const accessToken = process.env.FB_CONVERSION_API_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Facebook Conversion API not configured'
      });
    }

    const {
      eventName,
      eventId,
      userData,
      customData,
      eventSourceUrl
    } = req.body;

    // Hash user data
    const hashedUserData = userData ? {
      ...(userData.email && { em: hashData(userData.email) }),
      ...(userData.phone && { ph: hashData(userData.phone) }),
      ...(userData.firstName && { fn: hashData(userData.firstName) }),
      ...(userData.lastName && { ln: hashData(userData.lastName) }),
      ...(userData.externalId && { external_id: hashData(userData.externalId) }),
    } : {};

    // Send to Facebook
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
              event_name: eventName,
              event_id: eventId || `${Date.now()}-${Math.random()}`,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              user_data: hashedUserData,
              custom_data: customData,
              event_source_url: eventSourceUrl,
            },
          ],
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send event to Facebook',
        error: data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event sent successfully',
      data: data
    });
  } catch (error) {
    console.error('Facebook Conversion API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

