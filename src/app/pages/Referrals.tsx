import { Users, Copy, Gift, TrendingUp, Check, DollarSign, UserPlus, Sparkles, Info } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Referrals() {
  const { formatCurrency } = useUser();
  const [copied, setCopied] = useState(false);
  const referralCode = 'GAME2024XYZ';
  const referralLink = `https://earnixy.com/ref/${referralCode}`;

  const stats = {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  };

  const recentReferrals: Array<{ id: number; username: string; status: string; earnings: number; date: string }> = [];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      {/* DESKTOP: STRUCTURED LAYOUT - MAX 1320px */}
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-6 lg:px-10 pb-20">
        
        {/* Back Button */}
        <div className="mb-5">
          <BackButton />
        </div>
        
        {/* PAGE HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
          }}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Referral Program
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Invite friends and earn rewards together
            </p>
          </div>
        </div>

        {/* REFERRAL LINK CARD - FULL WIDTH */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl relative overflow-hidden mb-6" 
          style={{ 
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
            padding: '24px',
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))'
          }} />
          
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-4">Your Referral Link</h2>
            
            <div className="flex gap-3 items-stretch mb-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 rounded-xl min-w-0 px-4 py-3 text-sm font-medium"
                style={{ 
                  backgroundColor: '#F1F5F9', 
                  color: '#0F172A',
                  border: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyReferralLink}
                className="rounded-xl font-semibold flex items-center justify-center gap-2 px-6 transition-all"
                style={{ 
                  background: copied 
                    ? 'linear-gradient(135deg, #22C55E, #16A34A)' 
                    : 'linear-gradient(135deg, #FFFFFF, #F1F5F9)',
                  color: copied ? '#FFFFFF' : '#1E3A8A',
                  border: 'none',
                  boxShadow: copied 
                    ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                    : '0 2px 8px rgba(255, 255, 255, 0.2)',
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles className="w-4 h-4" />
              <p className="text-sm">
                Earn {formatCurrency(500)} for every friend who signs up and completes verification!
              </p>
            </div>
          </div>
        </motion.div>

        {/* STATS GRID - 4 COLUMNS ON DESKTOP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-5 text-center" 
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#3B82F6' }}>
              {stats.totalReferrals}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Referrals</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-5 text-center" 
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)'
            }}>
              <UserPlus className="w-5 h-5" style={{ color: '#22C55E' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#22C55E' }}>
              {stats.activeReferrals}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-5 text-center" 
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)'
            }}>
              <DollarSign className="w-5 h-5" style={{ color: '#FFD700' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FFD700' }}>
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Earned</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl p-5 text-center" 
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)'
            }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#F59E0B' }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#F59E0B' }}>
              {formatCurrency(stats.pendingEarnings)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pending</p>
          </motion.div>
        </div>

        {/* DESKTOP: 70/30 SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: 70% - RECENT REFERRALS LIST */}
          <div className="w-full lg:flex-[0.7]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6" 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp className="w-6 h-6" style={{ color: '#3B82F6' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recent Referrals
                </h2>
              </div>

              <div className="space-y-3">
                {recentReferrals.map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ 
                      backgroundColor: 'var(--bg-accent)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {referral.username}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {referral.date}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold mb-2" style={{ 
                        color: referral.status === 'Active' ? '#22C55E' : '#F59E0B'
                      }}>
                        {referral.status === 'Active' ? formatCurrency(referral.earnings) : 'Pending'}
                      </p>
                      <span
                        className="rounded-full inline-flex items-center justify-center px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: referral.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: referral.status === 'Active' ? '#22C55E' : '#F59E0B',
                        }}
                      >
                        {referral.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: 30% - INFO & CTA */}
          <div className="w-full lg:flex-[0.3] flex flex-col gap-5">
            
            {/* Referral Wallet Quick Access */}
            <Link to="/referral-wallet">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-5 cursor-pointer transition-all" 
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                    backgroundColor: '#3B82F6' 
                  }}>
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Referral Wallet
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      View and withdraw earnings
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#3B82F6' }}>
                  {formatCurrency(3500)}
                </p>
              </motion.div>
            </Link>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-5" 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  How It Works
                </h3>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <span>Earn {formatCurrency(500)} when they sign up and verify</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <span>Earnings are added to your Referral Wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <span>Withdraw anytime to your main wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  <span>No limit on referrals!</span>
                </li>
              </ul>
            </motion.div>

            {/* Earnings Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl p-5" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)', 
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.1)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" style={{ color: '#FFD700' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Earnings Tips
                </h3>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>💡 Share on social media for more reach</li>
                <li>🎯 Target active gamers and crypto enthusiasts</li>
                <li>🔥 The more friends you refer, the more you earn</li>
                <li>⭐ VIP members get bonus referral rewards</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
