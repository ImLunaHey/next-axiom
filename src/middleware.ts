import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as axiomConfig } from './config';
import { EndpointType } from './shared';
import { Logger } from './logger';

export async function middleware(request: NextRequest): Promise<NextResponse<unknown> | void> {
  // If the request is not for axiom, do nothing
  if (!request.nextUrl.pathname.startsWith('/_axiom')) return;

  const webVitalsEndpoint = axiomConfig.getIngestURL(EndpointType.webVitals);
  const logsEndpoint = axiomConfig.getIngestURL(EndpointType.logs);
  const headers = {
    authorization: 'Bearer ' + axiomConfig.token,
    'Content-Type': 'application/json',
  };

  if (!webVitalsEndpoint && !logsEndpoint) {
    const log = new Logger();
    log.warn(
      'axiom: Envvars not detected. If this is production please see https://github.com/axiomhq/next-axiom for help'
    );
    log.warn('axiom: Sending Web Vitals to /dev/null');
    log.warn('axiom: Sending logs to console');
    return;
  }

  // Web vitals
  if (request.nextUrl.pathname.startsWith('/_axiom/web-vitals')) {
    // Forward the request to the axiom ingest endpoint
    await fetch(webVitalsEndpoint, {
      body: request.body,
      method: 'POST',
      headers,
    }).catch(console.error);

    // Return a 204 to the client
    return new NextResponse(null, { status: 204 });
  }

  // Logs
  if (request.nextUrl.pathname.startsWith('/_axiom/logs')) {
    // Forward the request to the axiom ingest endpoint
    await fetch(logsEndpoint, {
      body: request.body,
      method: 'POST',
      headers,
    }).catch(console.error);

    // Return a 204 to the client
    return new NextResponse(null, { status: 204 });
  }
}

export const config = {
  matcher: '/_axiom/:path*',
};
