import { db } from "@/server/db";
import { authToken, transaction } from "@/server/db/schema";

import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

async function getUserIdFromAuthToken(token: string): Promise<string | null> {
  const dbToken = await db
    .select()
    .from(authToken)
    .where(eq(authToken.token, token));
  if (dbToken.length === 0) {
    return null;
  }

  return dbToken[0].userId;
}

const requestSchema = z.array(
  z.object({
    date: z.coerce.date(),
    vendor: z.string(),
    amount: z.number(),
    externalId: z.string(),
  }),
);

const getUnauthorized = () => {
  return json(
    { ok: false, message: "Unauthorized" },
    {
      status: 401,
    },
  );
};

export const Route = createAPIFileRoute("/api/new-transactions")({
  POST: async ({ request }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (token == undefined) {
      return getUnauthorized();
    }

    const user = await getUserIdFromAuthToken(token);

    if (user === null) {
      return getUnauthorized();
    }

    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (parseResult.error) {
      return json(parseResult.error, {
        status: 500,
      });
    }

    try {
      const res = await db
        .insert(transaction)
        .values(
          parseResult.data.map((data) => ({
            ...data,
            id: uuidv7(),
            userId: user,
          })),
        )
        .onConflictDoNothing()
        .execute();
      return json({ ok: true, message: res.rowCount });
    } catch (e) {
      return json({
        ok: false,
        message: (e as Error).message,
      });
    }
  },
});
