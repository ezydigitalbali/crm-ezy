"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "HEAD" | "SALES";
  specialty?: string;
}

interface UserContextType {
  user: CurrentUser | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refetchUser: async () => {},
});

// Cache in-memory agar navigasi antar halaman instan 0ms
let cachedUser: CurrentUser | null = null;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  const fetchUser = async () => {
    if (pathname === "/login") {
      cachedUser = null;
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          cachedUser = data.user;
          setUser(data.user);
        }
      } else {
        cachedUser = null;
        setUser(null);
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedUser) {
      fetchUser();
    }
  }, [pathname]);

  return (
    <UserContext.Provider value={{ user, loading, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
