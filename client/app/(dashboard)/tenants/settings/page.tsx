"use client";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import SettingsForm from "@/components/forms/SettingsForm";

export default function SettingsPage() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  if (isLoading) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!isLoading && !authUser) {
    redirect("/signin");
  }

  if (authUser?.data?.role.toLowerCase() !== "tenant") {
    redirect("/");
  }

  return (
    <SettingsForm
      initialData={{
        name: authUser?.data?.userInfo.name || "",
        email: authUser?.data?.userInfo.email || "",
        phonenumber: authUser?.data?.userInfo.phonenumber || "",
      }}
      role={authUser?.data?.role as "manager" | "tenant"}
      cognitoId={authUser?.data?.userInfo.cognitoID || ""}
    />
  );
}
