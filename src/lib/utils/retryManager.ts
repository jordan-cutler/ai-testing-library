export interface RetryOptions<T> {
  retryLimit: number;
  initialValue?: T;
  onError?: (error: unknown, attempt: number) => void;
  shouldRetry?: (result: T) => boolean;
  onRetry?: (lastResult: T, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result: T;
  attempts: number;
}

// Overload for when initialValue is provided
export async function withRetry<T>(
  operation: (previousResult: T) => Promise<T>,
  options: Required<Pick<RetryOptions<T>, 'initialValue'>> & RetryOptions<T>
): Promise<RetryResult<T>>;

// Overload for when initialValue is not provided
export async function withRetry<T>(
  operation: (previousResult: T | undefined) => Promise<T>,
  options: Omit<RetryOptions<T>, 'initialValue'> & { initialValue?: undefined }
): Promise<RetryResult<T>>;

// Implementation
export async function withRetry<T>(
  operation: (previousResult: T | undefined) => Promise<T>,
  options: RetryOptions<T>
): Promise<RetryResult<T>> {
  const { retryLimit, initialValue, onError, shouldRetry, onRetry } = options;
  let currentTry = 0;
  let lastResult = initialValue;

  while (currentTry < retryLimit) {
    try {
      const result = await operation(lastResult);
      lastResult = result;

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

  // At this point lastResult is guaranteed to be of type T because
  // either initialValue was provided, or operation succeeded at least once
  return {
    success: false,
    result: lastResult as T,
    attempts: currentTry,
  };
}