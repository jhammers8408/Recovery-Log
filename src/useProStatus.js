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
    const { count: expCount } = await supabase
      .from('experiments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: aiCount } = await supabase
      .from('experiment_library')
      .select('*', { count: 'exact', head: true })
      .eq('is_ai_generated', true)

    setExperimentCount(expCount || 0)
    setAiGenerationCount(aiCount || 0)
    setIsPro(false)
    setLoading(false)
  }

  return { isPro, experimentCount, aiGenerationCount, loading, refetch: checkProStatus }
}
