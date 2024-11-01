import { createServerFn } from "@tanstack/start";
import { getEvent } from "vinxi/http";
import type { Auth } from "./auth";

export const getAuth = createServerFn("GET", async (): Promise<Auth> => {
  const event = getEvent();

  return event.context.auth;
});
