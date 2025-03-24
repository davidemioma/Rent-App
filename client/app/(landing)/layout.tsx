"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/data/auth";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { usePathname, useRouter } from "next/navigation";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);

  const { data: authUser, isLoading: authLoading } = useQuery({
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
      } else {
        setIsLoading(false);
      }
    }
  }, [authUser, router, pathname]);

  if (isLoading || authLoading) {
    return <LoadingPage />;
  }

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
