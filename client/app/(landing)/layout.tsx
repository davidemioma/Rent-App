"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: authUser } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  return (
    <div className="h-full w-full">
      <Navbar authUser={authUser?.data?.userInfo} />

      <main
        className="w-full h-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
}
