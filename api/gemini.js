export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    console.log('Gemini API hit')
    console.log('API key exists:', !!process.env.GEMINI_API_KEY)

    const { prompt, imageBase64, mimeType } = req.body

    console.log('Has image:', !!imageBase64)
    console.log('Prompt length:', prompt?.length)

    const parts = []

    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: imageBase64
        }
      })
    }

    parts.push({ text: prompt })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      }
    )

    const data = await response.json()
    console.log('Gemini status:', response.status)
    console.log('Gemini response:', JSON.stringify(data).slice(0, 500))

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return res.status(200).json({ content: [{ type: 'text', text }] })
  } catch (err) {
    console.log('Gemini error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
