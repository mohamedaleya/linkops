import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dequeueAnalytics, getQueueLength } from '@/lib/queue';

/**
 * Background worker endpoint to process analytics queue
 * Can be called by a cron job or external scheduler
 *
 * Authorization: Uses a simple secret token for protection
 */
export async function POST(request: Request) {
  // Simple authorization check
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.ANALYTICS_WORKER_SECRET;

  // If secret is set, require it; otherwise allow (dev mode)
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const events = await dequeueAnalytics(100);

    if (events.length === 0) {
      return NextResponse.json({
        processed: 0,
        queueLength: await getQueueLength(),
        message: 'No events to process',
      });
    }

    // Group events by linkId for batch processing
    const eventsByLink = new Map<
      string,
      {
        referrers: Map<string, number>;
        countries: Map<string, number>;
        count: number;
      }
    >();

    for (const event of events) {
      if (!eventsByLink.has(event.linkId)) {
        eventsByLink.set(event.linkId, {
          referrers: new Map(),
          countries: new Map(),
          count: 0,
        });
      }

      const linkData = eventsByLink.get(event.linkId)!;
      linkData.count++;
      linkData.referrers.set(
        event.referrer,
        (linkData.referrers.get(event.referrer) || 0) + 1
      );
      linkData.countries.set(
        event.country,
        (linkData.countries.get(event.country) || 0) + 1
      );
    }

    // Process each link's aggregated data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promises: Promise<unknown>[] = [];

    for (const [linkId, data] of eventsByLink) {
      // Update visit count
      promises.push(
        prisma.shortLink.update({
          where: { id: linkId },
          data: { visits: { increment: data.count } },
        })
      );

      // Update daily clicks
      promises.push(
        prisma.linkClickDaily.upsert({
          where: { linkId_date: { linkId, date: today } },
          update: { clicks: { increment: data.count } },
          create: { linkId, date: today, clicks: data.count },
        })
      );

      // Update referrer stats
      for (const [referrer, clicks] of data.referrers) {
        promises.push(
          prisma.linkReferrerDaily.upsert({
            where: { linkId_date_referrer: { linkId, date: today, referrer } },
            update: { clicks: { increment: clicks } },
            create: { linkId, date: today, referrer, clicks },
          })
        );
      }

      // Update geo stats
      for (const [country, clicks] of data.countries) {
        promises.push(
          prisma.linkGeoDaily.upsert({
            where: { linkId_date_country: { linkId, date: today, country } },
            update: { clicks: { increment: clicks } },
            create: { linkId, date: today, country, clicks },
          })
        );
      }
    }

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    const queueLength = await getQueueLength();

    return NextResponse.json({
      processed: events.length,
      linksAffected: eventsByLink.size,
      queueLength,
      durationMs: duration,
      message: `Processed ${events.length} events in ${duration}ms`,
    });
  } catch (error) {
    console.error('Analytics worker error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check queue status
 */
export async function GET() {
  try {
    const queueLength = await getQueueLength();
    return NextResponse.json({ queueLength });
  } catch (error) {
    console.error('Failed to get queue status:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}
