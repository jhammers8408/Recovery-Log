import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { callClaude } from '../claude'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

const GOALS = [
  { key: 'lose_weight', label: 'Lose Weight', icon: '📉', description: 'Calorie deficit to shed fat' },
  { key: 'maintain', label: 'Maintain', icon: '⚖️', description: 'Stay at current weight' },
  { key: 'build_muscle', label: 'Build Muscle', icon: '💪', description: 'Calorie surplus for gains' },
  { key: 'improve_performance', label: 'Performance', icon: '⚡', description: 'Fuel for athletic output' },
]

const calculateTargets = (bodyweight, goalType) => {
  const bw = parseFloat(bodyweight) || 160
  const multipliers = {
    lose_weight: 12,
    maintain: 15,
    build_muscle: 18,
    improve_performance: 16,
  }
  const proteinMultipliers = {
    lose_weight: 1.0,
    maintain: 0.8,
    build_muscle: 1.2,
    improve_performance: 1.0,
  }
  const carbPct = {
    lose_weight: 0.30,
    maintain: 0.45,
    build_muscle: 0.45,
    improve_performance: 0.50,
  }
  const calories = Math.round(bw * (multipliers[goalType] || 15))
  const protein = Math.round(bw * (proteinMultipliers[goalType] || 0.8))
  const carbs = Math.round((calories * (carbPct[goalType] || 0.45)) / 4)
  const fat = Math.round((calories * 0.25) / 9)
  return { calories, protein, carbs, fat, fiber: 30, sugar: 50, sodium: 2300 }
}

const analyzeFood = async (prompt, imageBase64) => {
  const messages = imageBase64
    ? [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: prompt }
      ]}]
    : [{ role: 'user', content: prompt }]
  const data = await callClaude(messages)
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

function MacroBar({ label, value, target, color }) {
  const pct = target ? Math.min((value / target) * 100, 100) : 0
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: '#f0f6ff', fontSize: '13px' }}>{label}</span>
        <span style={{ color, fontSize: '13px', fontWeight: '600' }}>
          {Math.round(value)}<span style={{ color: '#4a6080', fontWeight: '400' }}>/{target}</span>
        </span>
      </div>
      <div style={{ background: '#1e2a3a', borderRadius: '4px', height: '6px' }}>
        <div style={{ background: color, borderRadius: '4px', height: '6px', width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function FoodCard({ food, onDelete }) {
  return (
    <div style={{ background: '#111820', borderRadius: '12px', padding: '14px', marginBottom: '8px', border: '0.5px solid #1e2a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>{food.food_name}</p>
        <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>
          {food.portion_size} · {Math.round(food.calories)} cal · P: {Math.round(food.protein)}g · C: {Math.round(food.carbs)}g · F: {Math.round(food.fat)}g
        </p>
        <span style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: '#0ea5e9', marginTop: '6px', display: 'inline-block', textTransform: 'capitalize' }}>{food.meal_type}</span>
      </div>
      <button onClick={() => onDelete(food.id)} style={{ background: 'transparent', border: 'none', color: '#4a6080', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}>×</button>
    </div>
  )
}

export default function Nutrition({ user }) {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('log')
  const [scanning, setScanning] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scannedResult, setScannedResult] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [bodyweight, setBodyweight] = useState(null)
  const [goals, setGoals] = useState(null)
  const [goalType, setGoalType] = useState('maintain')
  const [customTargets, setCustomTargets] = useState(null)
  const [savingGoals, setSavingGoals] = useState(false)
  const [suggestedTargets, setSuggestedTargets] = useState(null)
  const fileRef = useRef()

  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  const fetchData = async () => {
    const [{ data: foodData }, { data: logData }, { data: goalData }] = await Promise.all([
      supabase.from('nutrition_logs').select('*').eq('user_id', user.id).eq('log_date', today).order('created_at', { ascending: true }),
      supabase.from('daily_logs').select('bodyweight').eq('user_id', user.id).order('log_date', { ascending: false }).limit(1),
      supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    ])

    if (foodData) setFoods(foodData)
    if (logData && logData[0]?.bodyweight) setBodyweight(logData[0].bodyweight)
    if (goalData) {
      setGoals(goalData)
      setGoalType(goalData.goal_type || 'maintain')
      setCustomTargets({
        calories: goalData.calories,
        protein: goalData.protein,
        carbs: goalData.carbs,
        fat: goalData.fat,
        fiber: goalData.fiber || 30,
        sugar: goalData.sugar || 50,
        sodium: goalData.sodium || 2300,
      })
    }
    setLoading(false)
  }

  const targets = customTargets || calculateTargets(bodyweight, goalType)

  const totalNutrition = foods.reduce((acc, food) => ({
    calories: acc.calories + (food.calories || 0),
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0),
    fiber: acc.fiber + (food.fiber || 0),
    sugar: acc.sugar + (food.sugar || 0),
    sodium: acc.sodium + (food.sodium || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 })

  const handleGoalSelect = (key) => {
    setGoalType(key)
    const suggested = calculateTargets(bodyweight, key)
    setSuggestedTargets(suggested)
    setCustomTargets(suggested)
  }

  const handleTargetChange = (key, value) => {
    setCustomTargets(prev => ({ ...prev, [key]: parseInt(value) || 0 }))
  }

  const saveGoals = async () => {
    setSavingGoals(true)
    const upsertData = {
      user_id: user.id,
      goal_type: goalType,
      ...customTargets,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('nutrition_goals')
      .upsert(upsertData, { onConflict: 'user_id' })

    if (!error) {
      setGoals(upsertData)
      setView('log')
    } else {
      alert('Something went wrong saving your goals.')
    }
    setSavingGoals(false)
  }

  const handlePhotoScan = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    setView('add')
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(file)
      })
      const result = await analyzeFood(
        `Analyze this food image and return ONLY a JSON object with these exact fields:
{
  "food_name": "specific food name",
  "portion_size": "estimated portion (e.g. 1 cup, 200g, 1 medium)",
  "calories": number,
  "protein": number in grams,
  "carbs": number in grams,
  "fat": number in grams,
  "fiber": number in grams,
  "sugar": number in grams,
  "sodium": number in mg,
  "vitamins": { "vitamin_a": "percent daily value", "vitamin_c": "percent daily value", "vitamin_d": "percent daily value", "calcium": "percent daily value", "iron": "percent daily value" }
}
Return only the JSON, no other text.`,
        base64
      )
      setScannedResult({ ...result, scan_method: 'photo' })
    } catch (err) {
      alert('Could not identify food. Try again or use text search.')
    }
    setScanning(false)
  }

  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const result = await analyzeFood(
        `Return nutrition data for "${searchQuery}" as ONLY a JSON object with these exact fields:
{
  "food_name": "specific food name",
  "portion_size": "standard serving size",
  "calories": number,
  "protein": number in grams,
  "carbs": number in grams,
  "fat": number in grams,
  "fiber": number in grams,
  "sugar": number in grams,
  "sodium": number in mg,
  "vitamins": { "vitamin_a": "percent daily value", "vitamin_c": "percent daily value", "vitamin_d": "percent daily value", "calcium": "percent daily value", "iron": "percent daily value" }
}
Return only the JSON, no other text.`
      )
      setScannedResult({ ...result, scan_method: 'text' })
    } catch (err) {
      alert('Could not find nutrition data. Try a more specific food name.')
    }
    setSearching(false)
  }

  const saveFood = async () => {
    if (!scannedResult) return
    const { error } = await supabase.from('nutrition_logs').insert([{
      user_id: user.id,
      log_date: today,
      meal_type: selectedMeal,
      ...scannedResult,
    }])
    if (!error) {
      setScannedResult(null)
      setSearchQuery('')
      setView('log')
      fetchData()
    } else {
      alert('Something went wrong saving.')
    }
  }

  const deleteFood = async (id) => {
    await supabase.from('nutrition_logs').delete().eq('id', id)
    fetchData()
  }

  const mealGroups = MEAL_TYPES.reduce((acc, meal) => {
    acc[meal] = foods.filter(f => f.meal_type === meal)
    return acc
  }, {})

  const caloriePct = Math.min((totalNutrition.calories / targets.calories) * 100, 100)
  const calorieColor = caloriePct > 100 ? '#e74c3c' : caloriePct > 85 ? '#f59e0b' : '#2ecc71'

  const currentGoal = GOALS.find(g => g.key === goalType)

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Nutrition</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>AI-powered food tracking</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'log', label: 'Today' },
          { key: 'add', label: 'Add Food' },
          { key: 'goals', label: 'Goals' },
          { key: 'summary', label: 'Summary' },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setView(tab.key); setScannedResult(null) }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', backgroundColor: view === tab.key ? '#0ea5e9' : '#0d1520', color: view === tab.key ? 'white' : '#4a6080', transition: 'all 0.2s' }}>{tab.label}</button>
        ))}
      </div>

      {view === 'log' && (
        <div>
          {/* Current Goal Badge */}
          {currentGoal && (
            <div onClick={() => setView('goals')} style={{ background: '#0d1520', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', border: '0.5px solid #0ea5e930', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{currentGoal.icon}</span>
                <div>
                  <p style={{ color: '#f0f6ff', fontSize: '13px', fontWeight: '500', margin: '0' }}>Goal: {currentGoal.label}</p>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{currentGoal.description}</p>
                </div>
              </div>
              <p style={{ color: '#0ea5e9', fontSize: '12px', margin: '0' }}>Edit →</p>
            </div>
          )}

          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Calories Today</p>
                <p style={{ color: calorieColor, fontSize: '36px', fontWeight: '800', margin: '0', lineHeight: '1' }}>{Math.round(totalNutrition.calories)}</p>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '4px 0 0' }}>of {targets.calories} target</p>
              </div>
              <div style={{ width: '80px', height: '80px', position: 'relative' }}>
                <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2a3a" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke={calorieColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${caloriePct * 2.01} 201`}/>
                </svg>
                <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#f0f6ff', fontSize: '13px', fontWeight: '700', margin: '0' }}>{Math.round(caloriePct)}%</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Protein', value: totalNutrition.protein, target: targets.protein, color: '#0ea5e9' },
                { label: 'Carbs', value: totalNutrition.carbs, target: targets.carbs, color: '#f59e0b' },
                { label: 'Fat', value: totalNutrition.fat, target: targets.fat, color: '#e74c3c' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#111820', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ color: m.color, fontSize: '18px', fontWeight: '700', margin: '0' }}>{Math.round(m.value)}g</p>
                  <p style={{ color: '#4a6080', fontSize: '10px', margin: '2px 0 0' }}>{m.label}</p>
                  <p style={{ color: '#2a3a4a', fontSize: '10px', margin: '0' }}>/{m.target}g</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setView('add')} style={{ width: '100%', padding: '14px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
            + Add Food
          </button>

          {loading ? (
            <p style={{ color: '#4a6080', textAlign: 'center', padding: '20px' }}>Loading...</p>
          ) : foods.length === 0 ? (
            <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
              <p style={{ fontSize: '36px', marginBottom: '12px' }}>🍽️</p>
              <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>No food logged yet</p>
              <p style={{ color: '#4a6080', fontSize: '14px' }}>Scan a photo or search a food to get started</p>
            </div>
          ) : (
            MEAL_TYPES.map(meal => mealGroups[meal].length > 0 && (
              <div key={meal} style={{ marginBottom: '16px' }}>
                <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>{meal}</p>
                {mealGroups[meal].map(food => (
                  <FoodCard key={food.id} food={food} onDelete={deleteFood} />
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {view === 'add' && (
        <div>
          <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Meal</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {MEAL_TYPES.map(meal => (
                <div key={meal} onClick={() => setSelectedMeal(meal)} style={{ flex: 1, padding: '8px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: selectedMeal === meal ? '#0ea5e915' : '#111820', border: `1px solid ${selectedMeal === meal ? '#0ea5e9' : '#1e2a3a'}`, transition: 'all 0.15s' }}>
                  <p style={{ color: selectedMeal === meal ? '#0ea5e9' : '#4a6080', fontSize: '11px', fontWeight: '600', margin: '0', textTransform: 'capitalize' }}>{meal}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Scan Food Photo</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoScan} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current.click()} disabled={scanning} style={{ width: '100%', padding: '14px', background: scanning ? '#1e2a3a' : '#0ea5e915', border: '1px dashed #0ea5e9', borderRadius: '12px', color: scanning ? '#4a6080' : '#0ea5e9', fontSize: '15px', fontWeight: '600', cursor: scanning ? 'not-allowed' : 'pointer' }}>
              {scanning ? 'Analyzing photo...' : '📷 Take Photo or Upload'}
            </button>
          </div>

          <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Search Food</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextSearch()}
                placeholder="e.g. grilled chicken breast, Big Mac..."
                style={{ flex: 1, background: '#111820', border: '1px solid #1e2a3a', borderRadius: '10px', padding: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
              />
              <button onClick={handleTextSearch} disabled={searching} style={{ padding: '12px 16px', background: '#0ea5e9', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                {searching ? '...' : 'Search'}
              </button>
            </div>
          </div>

          {scannedResult && (
            <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '0.5px solid #2ecc7140' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <p style={{ color: '#f0f6ff', fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>{scannedResult.food_name}</p>
                  <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>{scannedResult.portion_size}</p>
                </div>
                <div style={{ background: '#2ecc7115', border: '1px solid #2ecc7140', borderRadius: '8px', padding: '4px 10px' }}>
                  <p style={{ color: '#2ecc71', fontSize: '11px', fontWeight: '600', margin: '0' }}>AI Identified</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Calories', value: `${Math.round(scannedResult.calories)} kcal`, color: '#f0f6ff' },
                  { label: 'Protein', value: `${Math.round(scannedResult.protein)}g`, color: '#0ea5e9' },
                  { label: 'Carbs', value: `${Math.round(scannedResult.carbs)}g`, color: '#f59e0b' },
                  { label: 'Fat', value: `${Math.round(scannedResult.fat)}g`, color: '#e74c3c' },
                  { label: 'Fiber', value: `${Math.round(scannedResult.fiber)}g`, color: '#2ecc71' },
                  { label: 'Sugar', value: `${Math.round(scannedResult.sugar)}g`, color: '#9b59b6' },
                  { label: 'Sodium', value: `${Math.round(scannedResult.sodium)}mg`, color: '#4a6080' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#111820', borderRadius: '10px', padding: '10px' }}>
                    <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ color: item.color, fontSize: '15px', fontWeight: '600', margin: '0' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {scannedResult.vitamins && (
                <div style={{ background: '#111820', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Vitamins & Minerals</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.entries(scannedResult.vitamins).map(([key, val]) => (
                      <div key={key} style={{ background: '#0ea5e910', border: '1px solid #0ea5e920', borderRadius: '6px', padding: '3px 8px' }}>
                        <p style={{ color: '#0ea5e9', fontSize: '11px', margin: '0' }}>{key.replace(/_/g, ' ')}: {val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setScannedResult(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #1e2a3a', borderRadius: '10px', color: '#4a6080', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={saveFood} style={{ flex: 2, padding: '12px', background: '#0ea5e9', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Add to {selectedMeal}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'goals' && (
        <div>
          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Your Goal</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {GOALS.map(goal => (
                <div key={goal.key} onClick={() => handleGoalSelect(goal.key)} style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${goalType === goal.key ? '#0ea5e9' : '#1e2a3a'}`, background: goalType === goal.key ? '#0ea5e915' : '#111820', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <p style={{ fontSize: '22px', margin: '0 0 6px' }}>{goal.icon}</p>
                  <p style={{ color: goalType === goal.key ? '#0ea5e9' : '#f0f6ff', fontSize: '13px', fontWeight: '600', margin: '0 0 2px' }}>{goal.label}</p>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{goal.description}</p>
                </div>
              ))}
            </div>

            {!bodyweight && (
              <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#f59e0b', fontSize: '13px', margin: '0' }}>Log your bodyweight in check-in for more accurate targets</p>
              </div>
            )}
          </div>

          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Daily Targets</p>
            <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 16px' }}>AI suggested based on your goal — adjust as needed</p>

            {[
              { key: 'calories', label: 'Calories', unit: 'kcal', color: '#f0f6ff' },
              { key: 'protein', label: 'Protein', unit: 'g', color: '#0ea5e9' },
              { key: 'carbs', label: 'Carbs', unit: 'g', color: '#f59e0b' },
              { key: 'fat', label: 'Fat', unit: 'g', color: '#e74c3c' },
              { key: 'fiber', label: 'Fiber', unit: 'g', color: '#2ecc71' },
              { key: 'sugar', label: 'Sugar', unit: 'g', color: '#9b59b6' },
              { key: 'sodium', label: 'Sodium', unit: 'mg', color: '#4a6080' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ color: '#f0f6ff', fontSize: '14px', margin: '0' }}>{item.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={customTargets?.[item.key] || targets[item.key]}
                    onChange={e => handleTargetChange(item.key, e.target.value)}
                    style={{ width: '80px', background: '#111820', border: '1px solid #1e2a3a', borderRadius: '8px', padding: '8px', color: item.color, fontSize: '14px', fontWeight: '600', outline: 'none', textAlign: 'right' }}
                  />
                  <span style={{ color: '#4a6080', fontSize: '12px', minWidth: '24px' }}>{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveGoals}
            disabled={savingGoals}
            style={{ width: '100%', padding: '16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: savingGoals ? 'not-allowed' : 'pointer', opacity: savingGoals ? 0.7 : 1 }}>
            {savingGoals ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      )}

      {view === 'summary' && (
        <div>
          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Daily Targets</p>
            <MacroBar label="Calories" value={totalNutrition.calories} target={targets.calories} color="#f0f6ff" />
            <MacroBar label="Protein" value={totalNutrition.protein} target={targets.protein} color="#0ea5e9" />
            <MacroBar label="Carbs" value={totalNutrition.carbs} target={targets.carbs} color="#f59e0b" />
            <MacroBar label="Fat" value={totalNutrition.fat} target={targets.fat} color="#e74c3c" />
          </div>

          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Additional Nutrients</p>
            {[
              { label: 'Fiber', value: `${Math.round(totalNutrition.fiber)}g`, target: `${targets.fiber}g`, color: '#2ecc71' },
              { label: 'Sugar', value: `${Math.round(totalNutrition.sugar)}g`, target: `<${targets.sugar}g`, color: '#9b59b6' },
              { label: 'Sodium', value: `${Math.round(totalNutrition.sodium)}mg`, target: `<${targets.sodium}mg`, color: '#e74c3c' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '0.5px solid #1e2a3a' : 'none' }}>
                <p style={{ color: '#f0f6ff', fontSize: '14px', margin: '0' }}>{item.label}</p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: item.color, fontSize: '14px', fontWeight: '600', margin: '0' }}>{item.value}</p>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>target: {item.target}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', border: '0.5px solid #1e2a3a' }}>
            <p style={{ color: '#4a6080', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Meal Breakdown</p>
            {MEAL_TYPES.map(meal => {
              const mealFoods = mealGroups[meal]
              const mealCals = mealFoods.reduce((s, f) => s + (f.calories || 0), 0)
              if (mealFoods.length === 0) return null
              return (
                <div key={meal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #1e2a3a' }}>
                  <div>
                    <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 2px', textTransform: 'capitalize' }}>{meal}</p>
                    <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>{mealFoods.length} item{mealFoods.length > 1 ? 's' : ''}</p>
                  </div>
                  <p style={{ color: '#0ea5e9', fontSize: '15px', fontWeight: '600', margin: '0' }}>{Math.round(mealCals)} cal</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
