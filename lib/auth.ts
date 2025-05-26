import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Interface for user data returned from the database
 */
interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          console.log(
            "NextAuth: authorize called with credentials",
            credentials ? credentials.email : "none"
          );

          if (!credentials || !credentials.email || !credentials.password) {
            console.log("NextAuth: Missing credentials");
            return null;
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("NextAuth: User not found");
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.log("NextAuth: Invalid password");
            return null;
          }

          console.log("NextAuth: Authentication successful for user:", user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("NextAuth: Authentication error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Authentication failed: ${errorMessage}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("NextAuth: Setting JWT token with user data", user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log("NextAuth: Setting session with token data", token.email);

        // Always fetch the latest user data from database to ensure ID is correct
        try {
          const user = await db.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, email: true, name: true, role: true },
          });

          if (user) {
            session.user.id = user.id;
            session.user.email = user.email;
            session.user.name = user.name;
            session.user.role = user.role;
            console.log("NextAuth: Updated session with fresh user data", user.email, user.id);
          } else {
            // Fallback to token data if user not found
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.role = token.role as string;
          }
        } catch (error) {
          console.error("NextAuth: Error fetching user data for session:", error);
          // Fallback to token data
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
