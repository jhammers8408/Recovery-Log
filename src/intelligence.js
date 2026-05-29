export function analyzeMetrics(logs, perfLogs, recoveryActions) {
  if (!logs || logs.length === 0) return null

  const recent = logs.slice(0, 7)
  const today = logs[0]
  const yesterday = logs[1]

  const avg = (arr, key) => arr.length > 0
    ? arr.reduce((s, l) => s + (l[key] || 0), 0) / arr.length
    : null

  const avgEnergy = avg(recent, 'energy')
  const avgSleep = avg(recent, 'sleep_hours')
  const avgSoreness = avg(recent, 'soreness')
  const avgStress = avg(recent, 'stress')
  const avgMotivation = avg(recent, 'motivation')

  const recoveryScore = today ? Math.round(
    (today.sleep_quality * 0.3 +
    today.energy * 0.25 +
    (10 - today.soreness) * 0.2 +
    today.hydration * 0.15 +
    today.motivation * 0.1) * 10
  ) : null

  const insights = []
  const recoveryPriorities = []
  let performanceExpectation = null
  let performanceContext = null

  // --- Coaching Messages ---

  // Sleep-based coaching
  if (today?.sleep_hours >= 8) {
    insights.push({ type: 'positive', message: `You slept ${today.sleep_hours} hours last night — your body is primed. Push hard today.` })
  } else if (today?.sleep_hours < 6.5) {
    insights.push({ type: 'warning', message: `Only ${today.sleep_hours} hours of sleep last night. Keep intensity moderate and focus on technique today.` })
  }

  // Energy trend
  const energyTrend = recent.length >= 3
    ? recent.slice(0, 3).every((l, i, arr) => i === 0 || l.energy <= arr[i - 1].energy)
    : false
  if (energyTrend && today?.energy < 6) {
    insights.push({ type: 'warning', message: `Your energy has dropped for 3+ days in a row. A rest or recovery day today could prevent burnout.` })
  }

  // Soreness + stress combo
  if (today?.soreness >= 7 && today?.stress >= 7) {
    insights.push({ type: 'warning', message: `High soreness and high stress together is a red flag. Prioritize mobility and avoid heavy loading today.` })
  }

  // High motivation day
  if (today?.motivation >= 9) {
    insights.push({ type: 'positive', message: `Your motivation is at ${today.motivation}/10 today — one of your highest. Great day to tackle a challenge.` })
  }

  // Hydration warning
  if (today?.hydration <= 4) {
    insights.push({ type: 'warning', message: `Your hydration was low yesterday. Start today with 16oz of water and electrolytes before training.` })
  }

  // Sleep trend correlation
  const highSleepDays = logs.filter(l => l.sleep_hours >= 8)
  const lowSleepDays = logs.filter(l => l.sleep_hours < 7)
  if (highSleepDays.length >= 3 && lowSleepDays.length >= 3) {
    const highEnergy = avg(highSleepDays, 'energy')
    const lowEnergy = avg(lowSleepDays, 'energy')
    if (highEnergy - lowEnergy > 1.5) {
      insights.push({ type: 'insight', message: `Your data shows ${Math.round((highEnergy - lowEnergy) / lowEnergy * 100)}% higher energy on 8+ hour sleep nights. Tonight's sleep matters.` })
    }
  }

  // Stress and performance
  const highStressDays = logs.filter(l => l.stress >= 7)
  if (highStressDays.length >= 3) {
    insights.push({ type: 'insight', message: `You've had ${highStressDays.length} high-stress days recently. Consider adding meditation or breathing work to your routine.` })
  }

  // --- Recovery Priorities ---
  const actionCounts = {}
  if (recoveryActions && recoveryActions.length > 0) {
    recoveryActions.forEach(session => {
      if (session.actions) {
        session.actions.forEach(action => {
          actionCounts[action] = (actionCounts[action] || 0) + 1
        })
      }
    })
  }

  if (today?.soreness >= 7) {
    recoveryPriorities.push({ action: 'foam_roll', label: 'Foam Roll', emoji: '🎯', reason: 'High soreness detected' })
    recoveryPriorities.push({ action: 'stretching', label: 'Stretching', emoji: '🧘', reason: 'Helps with your soreness levels' })
  }

  if (today?.sleep_quality <= 5) {
    recoveryPriorities.push({ action: 'magnesium', label: 'Magnesium', emoji: '💊', reason: 'Your sleep quality was low' })
    recoveryPriorities.push({ action: 'sleep_early', label: 'Early Sleep', emoji: '🌙', reason: 'Prioritize sleep tonight' })
  }

  if (today?.stress >= 7) {
    recoveryPriorities.push({ action: 'meditation', label: 'Meditation', emoji: '🧠', reason: 'High stress detected' })
  }

  if (today?.hydration <= 5) {
    recoveryPriorities.push({ action: 'electrolytes', label: 'Electrolytes', emoji: '⚡', reason: 'Low hydration yesterday' })
  }

  if (avgSoreness > 6) {
    recoveryPriorities.push({ action: 'ice_bath', label: 'Ice Bath', emoji: '🧊', reason: 'Consistently high soreness this week' })
  }

  // --- Performance Expectation ---
  if (recoveryScore !== null && perfLogs && perfLogs.length >= 3) {
    const personalAvg = avg(perfLogs, 'performance_rating')
    if (recoveryScore >= 80) {
      performanceExpectation = 'Strong'
      performanceContext = `Based on your history, high recovery days average ${(personalAvg + 1.2).toFixed(1)}/10 performance`
    } else if (recoveryScore >= 60) {
      performanceExpectation = 'Moderate'
      performanceContext = `Your average performance is ${personalAvg?.toFixed(1)}/10 — expect similar today`
    } else {
      performanceExpectation = 'Below average'
      performanceContext = `Your data shows lower output on low recovery days — adjust your training intensity`
    }
  }

  return {
    recoveryScore,
    insights,
    recoveryPriorities,
    performanceExpectation,
    performanceContext,
    averages: { energy: avgEnergy, sleep: avgSleep, soreness: avgSoreness, stress: avgStress, motivation: avgMotivation },
  }
}
