import { auth } from "@/server/auth";
import { createAPIFileRoute } from "@tanstack/start/api";

export const Route = createAPIFileRoute("/api/auth/$")({
  POST: async (request) => {
    return await auth.handler(request.request);
  },
  GET: async (request) => {
    console.log(request.request.url);
    return await auth.handler(request.request);
  },
});
