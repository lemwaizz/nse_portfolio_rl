import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(
    {},
    {
      provider: "postgresql",
    },
  ),
  emailAndPassword: {
    enabled: true,
  },
  telemetry: {
    enabled: false,
  },
  plugins: [openAPI({ theme: "kepler" }), admin()],
});

// bunx @better-auth/cli@latest generate --config=./apps/coordinator/src/services/auth/mock_auth.ts --output=./apps/coordinator/src/prisma/schema/schema.prisma
