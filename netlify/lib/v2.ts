import type { Context, HandlerEvent, HandlerResponse } from '@netlify/functions';

/**
 * Adapter used while the application is migrated to Netlify Functions API v2.
 *
 * Netlify Blobs automatic runtime credentials are injected for Functions v2
 * (default-export Request/Response handlers). The original app was using the
 * legacy named `handler` export (Functions v1), which is why Blobs failed in
 * production with MissingBlobsEnvironmentError.
 *
 * The rest of the application can keep its existing HandlerEvent/HandlerResponse
 * helpers for now; this adapter converts the v2 Request into the legacy shape
 * and converts the legacy response back to a web Response.
 */
export function v2Adapter(
  handler: (event: HandlerEvent) => Promise<HandlerResponse> | HandlerResponse,
) {
  return async function netlifyV2Handler(request: Request, _context: Context): Promise<Response> {
    const url = new URL(request.url);
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const queryStringParameters: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryStringParameters[key] = value;
    });

    const method = request.method.toUpperCase();
    let body: string | null = null;
    let isBase64Encoded = false;

    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        const bytes = Buffer.from(await request.arrayBuffer());
        body = bytes.toString('base64');
        isBase64Encoded = true;
      } else {
        body = await request.text();
      }
    }

    // Only fields used by this application are populated. The cast keeps the
    // existing, well-tested business logic unchanged during the v2 migration.
    const event = {
      rawUrl: request.url,
      rawQuery: url.search.startsWith('?') ? url.search.slice(1) : url.search,
      path: url.pathname,
      httpMethod: method,
      headers,
      multiValueHeaders: {},
      queryStringParameters,
      multiValueQueryStringParameters: {},
      body,
      isBase64Encoded,
    } as unknown as HandlerEvent;

    const result = await handler(event);
    const responseHeaders = new Headers();

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        if (value !== undefined && value !== null) responseHeaders.set(key, String(value));
      }
    }
    if (result.multiValueHeaders) {
      for (const [key, values] of Object.entries(result.multiValueHeaders)) {
        for (const value of values || []) responseHeaders.append(key, String(value));
      }
    }

    let responseBody: BodyInit | null = result.body ?? null;
    if (result.isBase64Encoded && typeof result.body === 'string') {
      responseBody = Buffer.from(result.body, 'base64');
    }

    return new Response(responseBody, {
      status: result.statusCode,
      headers: responseHeaders,
    });
  };
}
