const HF_MODEL   = 'moonshotai/Kimi-K2-Instruct-0905'
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions'

export interface LLMResponse {
  reply: string
  error?: string
}

export async function callLLM(
  prompt: string,
  apiKey: string,
  maxTokens: number = 2048
): Promise<LLMResponse> {
  try {
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens:  maxTokens,
        temperature: 0.3, // lower = more factual for medical context
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('[HF] HTTP error:', res.status, errData)
      return {
        reply: '',
        error: `Hugging Face API error ${res.status}: ${JSON.stringify(errData)}`,
      }
    }

    const data = await res.json()
    const reply: string = data?.choices?.[0]?.message?.content?.trim() ?? ''

    if (!reply) {
      console.warn('[HF] Empty reply. Full response:', JSON.stringify(data))
      return { reply: '', error: 'Model returned an empty response.' }
    }

    return { reply }
  } catch (err) {
    console.error('[HF] Network/fetch error:', err)
    return {
      reply: '',
      error: 'Failed to reach Hugging Face API. Check your internet connection.',
    }
  }
}
