/**
 * Loyalty Points Page
 * Display points balance, transactions, and redemption
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Coins, TrendingUp, History, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoyaltyPage() {
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const { data: account, isLoading: accountLoading } = trpc.loyalty.getAccount.useQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = trpc.loyalty.getTransactions.useQuery({
    page: 1,
    limit: 20,
  });

  const redeemMutation = trpc.loyalty.redeemPoints.useMutation({
    onSuccess: () => {
      toast.success('Points redeemed successfully!');
      setShowRedeemModal(false);
      setRedeemAmount('');
      // Refetch account data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to redeem points');
    },
  });

  const handleRedeem = () => {
    const points = parseInt(redeemAmount);
    if (!points || points < 1) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (points > (account?.currentBalance || 0)) {
      toast.error('Insufficient points');
      return;
    }
    redeemMutation.mutate({ points });
  };

  if (accountLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentBalance = account?.currentBalance || 0;
  const totalEarned = account?.totalPointsEarned || 0;
  const totalRedeemed = account?.totalPointsRedeemed || 0;
  const tier = account?.tier || 'bronze';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Loyalty Points</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Current Balance</p>
            <p className="text-4xl font-bold mb-2">
              {currentBalance.toLocaleString()} <span className="text-2xl">points</span>
            </p>
            <p className="text-lg opacity-90">
              = Rs. {currentBalance.toLocaleString()}
            </p>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                tier === 'platinum' ? 'bg-yellow-500' :
                tier === 'gold' ? 'bg-yellow-400' :
                tier === 'silver' ? 'bg-gray-300 text-gray-800' :
                'bg-orange-300 text-orange-900'
              }`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
              </span>
            </div>
          </div>
          <Coins className="w-20 h-20 opacity-80" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earned</p>
              <p className="text-2xl font-bold mt-1">{totalEarned.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Redeemed</p>
              <p className="text-2xl font-bold mt-1">{totalRedeemed.toLocaleString()}</p>
            </div>
            <Gift className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-2xl font-bold mt-1">Rs. {currentBalance.toLocaleString()}</p>
            </div>
            <Coins className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Redeem Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Redeem Points</h3>
            <p className="text-gray-600 text-sm">
              1 point = Rs. 1. Redeem your points for discounts on your next order.
            </p>
          </div>
          <button
            onClick={() => setShowRedeemModal(true)}
            disabled={currentBalance === 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Redeem Points
          </button>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Redeem Points</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Points to Redeem
                </label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="Enter points"
                  className="w-full px-4 py-2 border rounded-lg"
                  max={currentBalance}
                  min={1}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Available: {currentBalance.toLocaleString()} points
                </p>
                {redeemAmount && (
                  <p className="text-sm text-purple-600 mt-1">
                    = Rs. {parseInt(redeemAmount) || 0}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending || !redeemAmount || parseInt(redeemAmount) < 1}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {redeemMutation.isPending ? 'Processing...' : 'Redeem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </h3>
        </div>
        {transactionsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading transactions...</div>
        ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
          <div className="space-y-3">
            {transactionsData.transactions.map((transaction: any) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{transaction.source}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'earned' ? '+' : '-'}
                    {transaction.points} pts
                  </p>
                  <p className="text-xs text-gray-500">
                    Rs. {transaction.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Start earning points with your first order!
          </div>
        )}
      </div>
    </div>
  );
}

