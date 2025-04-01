"use client";

import { useParams } from "next/navigation";
import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";

export default function PropertyPage() {
  const { propertyId } = useParams();

  const { isLoading } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  if (isLoading) {
    return <LoadingPage className="w-full h-full" />;
  }

  return <div>PropertyPage {propertyId}</div>;
}
