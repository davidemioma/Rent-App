"use client";

import { redirect } from "next/navigation";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import Card from "@/components/property/Card";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { getFavoriteProperties } from "@/lib/data/properties";

export default function FavoritesPage() {
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
    data: favorites,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["get-favorite-properties", authUser?.data?.userInfo.cognitoID],
    queryFn: async () => {
      const data = await getFavoriteProperties(
        authUser?.data?.userInfo.cognitoID || ""
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

  if (!isError || !favorites) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        {isError
          ? "Something went wrong! Unable to get properties"
          : "No properties! Add properties to favorite."}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <Headings
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites?.map((favorite) => (
          <Card
            key={favorite.id}
            property={favorite.property}
            showFavoriteBtn={false}
            propertyLink={`/tenants/residences/${favorite.property.id}`}
            cognitoId={authUser.data?.userInfo.cognitoID}
            isPending={false}
            handleToggleFavorite={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
