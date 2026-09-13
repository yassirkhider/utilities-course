import type { HandlerEvent } from '@netlify/functions';
import { uploadsStore } from '../lib/store';
import { getResources } from '../lib/store';
import { badRequest, json, notFound, pathSegments, serverError } from '../lib/http';
import { v2Adapter } from '../lib/v2';

// Streams a previously-uploaded file back to the client for viewing/downloading.
// Access is public (resources are training material, not confidential), but the
// blob key is an unguessable UUID and only resolvable through a known resource id.
const legacyHandler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  const [resourceId] = pathSegments(event, 'file');
  if (!resourceId) return badRequest('Resource id is required');

  try {
    const resources = await getResources();
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource || !resource.blobKey) return notFound('File not found');

    const data = await uploadsStore().get(resource.blobKey, { type: 'arrayBuffer' });
    if (!data) return notFound('File not found in storage');

    const disposition = event.queryStringParameters?.download === '1' ? 'attachment' : 'inline';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': resource.mimeType || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${resource.fileName || 'file'}"`,
        'Cache-Control': 'public, max-age=3600',
      },
      body: Buffer.from(data).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('file.ts error', err);
    return serverError(err);
  }
};

export default v2Adapter(legacyHandler);
