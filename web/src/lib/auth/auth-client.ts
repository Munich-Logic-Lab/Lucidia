import env from "@/env";
import { createAuthClient } from "better-auth/react";

// Extend the user type to include role
declare module "better-auth/react" {
  interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    role?: string;
  }
}

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  forgetPassword,
  resetPassword,
} = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
