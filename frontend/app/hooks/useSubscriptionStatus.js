/**
 * useSubscriptionStatus - Hook to check user's subscription tier and feature access
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchSubscriptionStatus } from '../utils/api';

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState({
    general_finnish: { available: true, limit: 10 },
    workplace: { available: false, limit: 0 },
    yki: { available: false, limit: 0 },
  });

  useEffect(() => {
    let mounted = true;
    
    const loadSubscriptionStatus = async () => {
      if (!user?.id && !user?.email) {
        if (mounted) {
          setTier('free');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const status = await fetchSubscriptionStatus(user?.id || user?.email);
        
        if (mounted) {
          const userTier = status?.tier || 'free';
          setTier(userTier);
          
          // Map tier to feature availability
          // Note: FREE tier has limited access to all features
          // GENERAL_PREMIUM has unlimited general_finnish but no workplace/yki
          // PROFESSIONAL_PREMIUM has unlimited everything
          const featureMap = {
            free: {
              general_finnish: { available: true, limit: 10, message: 'Limited to 10 conversations/week' },
              workplace: { available: true, limit: 3, message: 'Limited to 3 lessons total' },
              yki: { available: true, limit: 1, message: 'Limited to 1 attempt/month' },
            },
            general_premium: {
              general_finnish: { available: true, limit: -1, message: 'Unlimited' },
              workplace: { available: false, limit: 0, message: 'Requires Professional Premium' },
              yki: { available: false, limit: 0, message: 'Requires Professional Premium' },
            },
            professional_premium: {
              general_finnish: { available: true, limit: -1, message: 'Unlimited' },
              workplace: { available: true, limit: -1, message: 'Unlimited' },
              yki: { available: true, limit: -1, message: 'Unlimited' },
            },
          };
          
          setFeatures(featureMap[userTier] || featureMap.free);
        }
      } catch (error) {
        console.error('Failed to load subscription status:', error);
        if (mounted) {
          setTier('free');
          setFeatures({
            general_finnish: { available: true, limit: 10 },
            workplace: { available: true, limit: 3 },
            yki: { available: true, limit: 1 },
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSubscriptionStatus();
    
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.email]);

  const hasAccess = useCallback((feature) => {
    if (!features || !feature) return false;
    return features[feature]?.available !== false;
  }, [features]);

  const requiresUpgrade = useCallback((feature) => {
    if (!features || !feature) return false;
    return features[feature]?.available === false;
  }, [features]);

  const getUpgradeTier = useCallback((feature) => {
    if (tier === 'free') {
      if (feature === 'workplace' || feature === 'yki') {
        return 'professional_premium';
      }
      return 'general_premium';
    }
    if (tier === 'general_premium') {
      return 'professional_premium';
    }
    return null; // Already has highest tier
  }, [tier]);

  return {
    tier,
    features,
    loading,
    hasAccess,
    requiresUpgrade,
    getUpgradeTier,
    isFree: tier === 'free',
    isGeneralPremium: tier === 'general_premium',
    isProfessionalPremium: tier === 'professional_premium',
  };
}



















