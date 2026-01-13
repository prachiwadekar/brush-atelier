import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password required");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// Only add Instagram if credentials are configured
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  providers.push({
    id: "instagram",
    name: "Instagram",
    type: "oauth",
    authorization: {
      url: "https://api.instagram.com/oauth/authorize",
      params: { scope: "user_profile,user_media" },
    },
    token: "https://api.instagram.com/oauth/access_token",
    userinfo: {
      url: "https://graph.instagram.com/me",
      params: { fields: "id,username,account_type" },
    },
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    profile(profile: any) {
      return {
        id: profile.id,
        name: profile.username,
        email: `${profile.username}@instagram.local`,
        image: null,
      };
    },
  } as any);
}

// Only add Pinterest if credentials are configured
if (process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET) {
  providers.push({
    id: "pinterest",
    name: "Pinterest",
    type: "oauth",
    authorization: {
      url: "https://www.pinterest.com/oauth/",
      params: { scope: "user_accounts:read,pins:read,boards:read" },
    },
    token: "https://api.pinterest.com/v5/oauth/token",
    userinfo: "https://api.pinterest.com/v5/user_account",
    clientId: process.env.PINTEREST_CLIENT_ID,
    clientSecret: process.env.PINTEREST_CLIENT_SECRET,
    profile(profile: any) {
      return {
        id: profile.username,
        name: profile.username,
        email: `${profile.username}@pinterest.local`,
        image: profile.profile_image,
      };
    },
  } as any);
}

// Create a custom adapter that sets default role for new users
const customAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(data: any) {
    return prisma.user.create({
      data: {
        ...data,
        role: data.role || "STUDENT", // Default to STUDENT if no role provided
      },
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter as any, // Use custom adapter with default role
  providers,
  session: {
    strategy: "jwt", // Keep JWT for better performance with OAuth
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is trying to sign in with OAuth but already has a password-based account
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { password: true, id: true },
        });

        // If user exists with a password, they signed up with email/password
        // Don't allow Google sign-in for this account
        if (existingUser && existingUser.password) {
          console.error(`User ${user.email} tried to sign in with Google but has a password-based account`);
          return false; // Reject the sign-in
        }
      }

      return true; // Allow sign in
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Fetch user data from database for each request
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, email: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
