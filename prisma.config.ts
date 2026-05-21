// prisma.config.ts
// prisma.config.ts
import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "ts-node --project tsconfig.node.json prisma/seed.ts",
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      return new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    },
  },
});