import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useProStatus(user) {
  const [isPro, setIsPro] = useState(false)
  const [experimentCount, setExperimentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    checkProStatus()
  }, [user]) // eslint-disable-line

  const checkProStatus = async () => {
    const { count } = await supabase
      .from('experiments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setExperimentCount(count || 0)
    setIsPro(false) // Will be true when Stripe is connected
    setLoading(false)
  }

  return { isPro, experimentCount, loading, refetch: checkProStatus }
}
