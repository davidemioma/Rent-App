"use client";

import { redirect } from "next/navigation";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import Card from "@/components/property/Card";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { getCurrentResidences } from "@/lib/data/properties";

export default function ResidencesPage() {
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
    data: properties,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["get-current-residences", authUser?.data?.userInfo.cognitoID],
    queryFn: async () => {
      const data = await getCurrentResidences(
        authUser?.data?.userInfo.cognitoID as string
      );

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

  if (isError || (properties && properties.length < 1)) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        {isError
          ? "Something went wrong! Unable to get current residences"
          : "You do not have any current residences!"}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <Headings
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties?.map((property) => (
          <Card
            key={property.id}
            property={property}
            showFavoriteBtn={false}
            propertyLink={`/tenants/residences/${property.id}`}
            cognitoId={authUser.data?.userInfo.cognitoID}
            isPending={false}
            handleToggleFavorite={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
