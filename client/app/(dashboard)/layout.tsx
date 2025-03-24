"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getAuthUser } from "@/lib/data/auth";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import AppSidebar from "@/components/AppSidebar";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
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
        (userRole === "manager" && pathname.startsWith("/tenants")) ||
        (userRole === "tenant" && pathname.startsWith("/managers"))
      ) {
        router.push(
          userRole === "manager"
            ? "/managers/properties"
            : "/tenants/favorites",
          { scroll: false }
        );
      } else {
        setIsLoading(false);
      }
    }
  }, [authUser, router, pathname]);

  if (isLoading || authLoading) {
    return <LoadingPage />;
  }

  return (
    <SidebarProvider>
      <div className="bg-[#f1f1f2] min-h-full w-full">
        <Navbar />

        <div
          className="w-full h-full flex"
          style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
        >
          <AppSidebar userRole={authUser?.data?.role || ""} />

          <main className="flex-1 transition-all duration-300">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
