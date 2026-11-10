/**
 * Reliance Pay - Structured API Service & Error Logger (365-Day Monitoring)
 * Catches all network errors, timeouts, and 4xx/5xx responses, logging them to backend audit logs.
 * Implements exponential backoff retry logic for intermittent connection issues (max 3 retries).
 */

export interface ApiCallOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  userId?: number;
}

export async function logApiErrorToBackend(errorDetails: string, userId?: number, action = 'api_failure') {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId || null,
        action,
        details: errorDetails,
        actor: 'frontend_structured_logger'
      }),
      // Keep timeout short so logging doesn't block UI
      signal: AbortSignal.timeout(3000)
    });
  } catch {
    // Fail silently if log endpoint is unreachable
  }
}

export async function apiCall<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
  const { timeoutMs = 15000, retries = 3, userId, ...fetchOptions } = options;
  const maxRetries = Math.min(Math.max(0, retries), 3);
  
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors (4xx / 5xx)
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status} (${response.statusText}) on ${endpoint}`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errorMsg = errJson.error;
          }
        } catch (_) {}

        const err = new Error(errorMsg);
        (err as any).status = response.status;
        
        // Log critical 5xx server errors to backend
        if (response.status >= 500) {
          logApiErrorToBackend(`Server Error ${response.status} on ${endpoint}: ${errorMsg}`, userId, 'server_error');
        }

        // Only retry on 5xx server errors or transient gateway issues, not client 4xx errors
        const isServerError = response.status >= 500 && response.status <= 504;
        if (!isServerError || attempt === maxRetries) {
          throw err;
        }

        // Retry with exponential backoff on 5xx
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 250, 6000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }

      const data = await response.json();
      return data;

    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      // Do not retry client validation errors (HTTP 4xx)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }

      const isNetworkOrTimeout = err.name === 'AbortError' || err.message === 'Failed to fetch' || !navigator.onLine;
      
      if (attempt === maxRetries) {
        // Final attempt failed -> log to backend
        const failReason = isNetworkOrTimeout 
          ? `Network or Timeout failure on ${endpoint} after ${maxRetries} retries` 
          : err.message;
        logApiErrorToBackend(failReason, userId, isNetworkOrTimeout ? 'network_failure' : 'client_api_error');
        throw err;
      }

      // Exponential backoff: attempt 0: ~1s, attempt 1: ~2s, attempt 2: ~4s (+ jitter)
      const backoffDelay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 250, 6000);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}
