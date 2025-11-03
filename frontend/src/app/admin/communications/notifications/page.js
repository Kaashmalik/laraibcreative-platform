"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <p className="text-gray-600">Manage system notifications and alerts</p>
    </div>
  );
}