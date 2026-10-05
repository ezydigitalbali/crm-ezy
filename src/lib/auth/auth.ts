import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const SESSION_COOKIE_NAME = "ezy_session_token";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

  await prisma.session.create({
    data: {
      session_token: token,
      user_id: userId,
      expires_at: expiresAt,
    },
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch (e) {
    // If called in a context where cookies() is immutable, response will set it directly
  }

  return { token, expiresAt };
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { session_token: token },
      include: { user: true },
    });

    if (!session) return null;

    if (new Date() > session.expires_at) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return session.user;
  } catch (err) {
    console.error("Session lookup error:", err);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await prisma.session.deleteMany({
        where: { session_token: token },
      });
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (err) {
    console.error("Session delete error:", err);
  }
}
