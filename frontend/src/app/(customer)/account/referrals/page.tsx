/**
 * Referrals Page
 * Display referral code and statistics
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Copy, Share2, Gift, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  
  const { data: referralData, isLoading } = trpc.referral.getCode.useQuery();
  const { data: stats } = trpc.referral.getStats.useQuery();

  const referralCode = referralData?.referralCode || '';
  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${referralCode}`
    : '';

  const handleCopy = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && referralUrl) {
      try {
        await navigator.share({
          title: 'Join LaraibCreative and get Rs.500 off!',
          text: 'Use my referral code to get Rs.500 off your first order',
          url: referralUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Refer & Earn</h1>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Referral Code</h2>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono bg-white/20 px-4 py-2 rounded">
                {referralCode}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Copy link"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm mt-3 opacity-90">
              Share this code with friends. Both of you get Rs.500 off!
            </p>
          </div>
          <Gift className="w-16 h-16 opacity-80" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalReferrals || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats?.completedReferrals || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earned</p>
              <p className="text-3xl font-bold mt-1">Rs. {stats?.totalEarned || 0}</p>
            </div>
            <Gift className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">How It Works</h3>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold">
              1
            </span>
            <span>Share your referral code with friends and family</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold">
              2
            </span>
            <span>They sign up using your code and place their first order</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold">
              3
            </span>
            <span>Both of you get Rs.500 off your next order!</span>
          </li>
        </ol>
      </div>

      {/* Referral History */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mt-6">
          <h3 className="text-xl font-semibold mb-4">Referral History</h3>
          <div className="space-y-3">
            {stats.referrals.map((referral: any) => (
              <div
                key={referral._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {referral.refereeId?.fullName || 'Friend'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    Rs. {referral.referrerReward?.amount || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {referral.status === 'completed' ? 'Credited' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

