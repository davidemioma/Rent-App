"use client";

import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { redirect, useParams } from "next/navigation";
import ResidenceCard from "./_components/ResidenceCard";
import PaymentMethod from "./_components/PaymentMethod";
import BillingHistory from "./_components/BillingHistory";
import { getResidenceDetails } from "@/lib/data/properties";

export default function ResidencePage() {
  const { id } = useParams();

  const {
    data: authUser,
    isLoading,
    isError: authErr,
  } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  const {
    data,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["get-residence-details", id],
    queryFn: async () => {
      const data = await getResidenceDetails({ propertyId: id as string });

      return data;
    },
  });

  if (isLoading || isFetching) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!isLoading && !authErr && !authUser) {
    redirect("/signin");
  }

  if (authUser?.data?.role.toLowerCase() !== "tenant") {
    redirect("/");
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        Something went wrong! Unable to get current residence
      </div>
    );
  }

  if (!isFetching && !isError && !data?.property) {
    redirect(`/tenants/residences`);
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="w-full mx-auto">
        <div className="md:flex gap-10">
          {data?.lease && (
            <ResidenceCard property={data.property!} lease={data.lease} />
          )}

          {/* Just Design */}
          <PaymentMethod />
        </div>

        {data?.payments && data.payments.length > 0 && (
          <BillingHistory payments={data?.payments || []} />
        )}
      </div>
    </div>
  );
}
