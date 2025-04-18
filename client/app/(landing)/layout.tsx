"use client";

import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { getAuthUser } from "@/lib/data/auth";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const { data: authUser } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  useEffect(() => {
    if (authUser) {
      const userRole = authUser.data?.role?.toLowerCase();

      if (
        (userRole === "manager" && pathname.startsWith("/search")) ||
        (userRole === "manager" && pathname === "/")
      ) {
        router.push("/managers/properties", { scroll: false });
      }
    }
  }, [authUser, router, pathname]);

  return (
    <div className="h-full w-full">
      <Navbar />

      <main
        className="w-full h-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
}
