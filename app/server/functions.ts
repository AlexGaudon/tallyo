import { createServerFn, json } from "@tanstack/start";
import { auth } from "./auth";

export const getAuth = createServerFn("GET", async (_, ctx) => {
  const authInfo = await auth.api.getSession({
    headers: ctx.request.headers,
  });

  return json(authInfo);
});
