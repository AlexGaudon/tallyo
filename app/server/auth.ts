import { betterAuth } from "better-auth";
import { dbPool } from "./db";

export const auth = betterAuth({
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
