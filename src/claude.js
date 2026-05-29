export async function callClaude(messages, maxTokens = 1000) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      max_tokens: maxTokens,
      messages,
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data
}
