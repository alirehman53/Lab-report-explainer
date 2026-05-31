const HF_MODEL   = 'moonshotai/Kimi-K2-Instruct-0905'
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions'

// Hard ceiling on how long we wait for the (optional) AI enrichment. The full
// offline result is already computed before this is called, so when the AI is
// slow or unreachable we simply stop waiting and return the offline result.
const DEFAULT_TIMEOUT_MS = 15_000
// One retry for transient failures (network blips, 429/5xx). Kept small so a
// genuinely-down AI doesn't multiply the user's wait.
const MAX_ATTEMPTS = 2

export interface LLMResponse {
  reply: string
  error?: string
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

export async function callLLM(
  prompt: string,
  apiKey: string,
  maxTokens: number = 2048,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<LLMResponse> {
  let lastError = 'Unknown error'

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Abort the request if it exceeds the timeout, so a hanging AI can never
    // block the user's response.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

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
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        lastError = `Hugging Face API error ${res.status}: ${JSON.stringify(errData)}`
        console.error('[HF] HTTP error:', res.status, errData)
        // Retry transient errors; give up immediately on auth/4xx (e.g. a bad
        // token won't fix itself on retry).
        if (attempt < MAX_ATTEMPTS && isRetryable(res.status)) continue
        return { reply: '', error: lastError }
      }

      const data = await res.json()
      const reply: string = data?.choices?.[0]?.message?.content?.trim() ?? ''

      if (!reply) {
        console.warn('[HF] Empty reply. Full response:', JSON.stringify(data))
        return { reply: '', error: 'Model returned an empty response.' }
      }

      return { reply }
    } catch (err) {
      const aborted = err instanceof Error && err.name === 'AbortError'
      lastError = aborted
        ? `Hugging Face request timed out after ${timeoutMs}ms`
        : 'Failed to reach Hugging Face API.'
      console.error('[HF] Request error:', lastError, err)
      if (attempt < MAX_ATTEMPTS && !aborted) continue
      return { reply: '', error: lastError }
    } finally {
      clearTimeout(timer)
    }
  }

  return { reply: '', error: lastError }
}
