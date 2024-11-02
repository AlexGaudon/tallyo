import { betterAuth, Session, User } from "better-auth";
import { dbPool } from "./db";

export type Auth =
  | { isAuthenticated: false; user: null; session: null }
  | { isAuthenticated: true; user: User; session: Session };

export const auth = betterAuth({
  logger: {
    disabled: false,
  },
  database: dbPool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
});
