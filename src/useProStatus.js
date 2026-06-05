import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const REVENUECAT_API_KEY = 'appl_kbFvYvgXCBvYkQYxRzLPxXCVWhc'

const isNative = () => {
  return window.Capacitor?.isNativePlatform?.() || false
}

export function useProStatus(user) {
  const [isPro, setIsPro] = useState(false)
  const [experimentCount, setExperimentCount] = useState(0)
  const [aiGenerationCount, setAiGenerationCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    checkProStatus()
  }, [user]) // eslint-disable-line

  const checkProStatus = async () => {
    const [{ count: expCount }, { count: aiCount }, { data: subData }] = await Promise.all([
      supabase.from('experiments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('experiment_library').select('*', { count: 'exact', head: true }).eq('is_ai_generated', true),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).maybeSingle(),
    ])

    setExperimentCount(expCount || 0)
    setAiGenerationCount(aiCount || 0)

    // Check Supabase subscription first (web purchases via Stripe)
    if (subData?.status === 'active') {
      setIsPro(true)
      setLoading(false)
      return
    }

    // Check RevenueCat for native iOS purchases
    if (isNative()) {
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor')
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY })
        await Purchases.logIn({ appUserID: user.id })
        const { customerInfo } = await Purchases.getCustomerInfo()
        setIsPro(typeof customerInfo.entitlements.active['pro'] !== 'undefined')
      } catch (err) {
        console.log('RevenueCat error:', err.message)
        setIsPro(false)
      }
    } else {
      setIsPro(false)
    }

    setLoading(false)
  }

  return { isPro, experimentCount, aiGenerationCount, loading, refetch: checkProStatus }
}