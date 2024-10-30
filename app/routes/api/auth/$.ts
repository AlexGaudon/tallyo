import { createAPIFileRoute } from '@tanstack/start/api';
import { auth } from '~/server/auth';

export const Route = createAPIFileRoute('/api/auth/$')({
  POST: async (request) => { return await auth.handler(request.request) },
  GET: async (request) => {
    console.log(request.request.url)
    return await auth.handler(request.request)
  },
})
