import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth, custom } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";

// separate prisma client for auth
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // account: {
  //   accountLinking: {
  //     trustedProviders: ["github", "google"],
  //     enabled: true,
  //   },
  // },

  //  credentials login
  emailAndPassword: {
    enabled: true,
  },

  // social login
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,

  // role in custom session
  plugins: [
    customSession(async ({ user, session }) => {
      const userProfile = await prisma.user.findUnique({
        where: { email: user.email },
      });

      return {
        roles: userProfile?.role,
        session,
        user,
      };
    }),
  ],
});
