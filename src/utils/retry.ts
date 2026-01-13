/**
 * Retries an async operation with exponential backoff.
 * @param operation The async function to retry.
 * @param retries Number of retries (default 3).
 * @param delay Initial delay in ms (default 300).
 * @param backoff Multiplier for delay (default 2).
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 300,
    backoff: number = 2
): Promise<T> {
    try {
        // We'll remove the artificial 10s timeout to let Supabase's natural timeout (or lack thereof)
        // reveal the actual error.
        return await operation();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(operation, retries - 1, delay * backoff, backoff);
        } else {
            console.error("Operation failed after max retries:", error);
            throw error;
        }
    }
}
