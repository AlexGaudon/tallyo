import { drizzle } from "drizzle-orm/node-postgres";

import pg from 'pg';

import * as schema from "./schema";
export const dbPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL as string
})

export const db = drizzle({ client: dbPool, schema });
