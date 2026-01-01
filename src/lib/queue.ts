import redis from './redis';

const ANALYTICS_QUEUE_KEY = 'queue:analytics';

export interface AnalyticsEvent {
  linkId: string;
  referrer: string;
  country: string;
  timestamp: number;
}

/**
 * Enqueue an analytics event for async processing
 */
export async function enqueueAnalytics(event: AnalyticsEvent): Promise<void> {
  try {
    await redis.rpush(ANALYTICS_QUEUE_KEY, JSON.stringify(event));
  } catch (error) {
    console.error('Failed to enqueue analytics:', error);
    // Analytics are best-effort, don't throw
  }
}

/**
 * Dequeue a batch of analytics events for processing
 * Returns up to `batchSize` events
 */
export async function dequeueAnalytics(
  batchSize: number = 100
): Promise<AnalyticsEvent[]> {
  const events: AnalyticsEvent[] = [];

  try {
    // Use LPOP in a loop (Redis 6.2+ supports LPOP with count, but we stay compatible)
    for (let i = 0; i < batchSize; i++) {
      const item = await redis.lpop(ANALYTICS_QUEUE_KEY);
      if (!item) break;
      events.push(JSON.parse(item));
    }
  } catch (error) {
    console.error('Failed to dequeue analytics:', error);
  }

  return events;
}

/**
 * Get the current queue length
 */
export async function getQueueLength(): Promise<number> {
  try {
    return await redis.llen(ANALYTICS_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to get queue length:', error);
    return 0;
  }
}
