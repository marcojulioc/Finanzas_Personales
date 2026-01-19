import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import prisma from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
