import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
    setIsPro(subData?.status === 'active')
    setLoading(false)
  }

  return { isPro, experimentCount, aiGenerationCount, loading, refetch: checkProStatus }
}
