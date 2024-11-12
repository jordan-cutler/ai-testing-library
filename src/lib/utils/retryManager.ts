export interface RetryOptions<T> {
  retryLimit: number;
  onError?: (error: unknown, attempt: number) => void;
  shouldRetry?: (result: T) => boolean;
  onRetry?: (lastResult: T, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result: T;
  attempts: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions<T>
): Promise<RetryResult<T>> {
  const { retryLimit, onError, shouldRetry, onRetry } = options;
  let currentTry = 0;
  let lastResult: T;

  while (currentTry < retryLimit) {
    try {
      const result = await operation();
      lastResult = result;

      // If no shouldRetry function is provided, or if it returns false,
      // consider the operation successful
      if (!shouldRetry || !shouldRetry(result)) {
        return {
          success: true,
          result,
          attempts: currentTry + 1,
        };
      }

      if (onRetry) {
        onRetry(result, currentTry);
      }

      currentTry++;
    } catch (error) {
      if (onError) {
        onError(error, currentTry);
      }
      currentTry++;
    }
  }

  // Return the last result with success: false if we've exhausted all retries
  return {
    success: false,
    result: lastResult!,
    attempts: currentTry,
  };
}