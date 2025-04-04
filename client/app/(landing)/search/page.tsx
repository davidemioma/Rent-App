"use client";

import { cn } from "@/lib/utils";
import Map from "./_components/Map";
import { getAuthUser } from "@/lib/data/auth";
import Listings from "./_components/Listings";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import FiltersBar from "./_components/FiltersBar";
import LoadingPage from "@/components/LoadingPage";
import useFiltersState from "@/hooks/use-filters-state";
import FiltersSidebar from "./_components/FiltersSidebar";

export default function SearchPage() {
  const { isFiltersOpen } = useFiltersState();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div
      className="w-full mx-auto px-5 flex flex-col"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <FiltersBar />

      <div className="flex justify-between flex-1 gap-3 mb-5 overflow-hidden">
        <div
          className={cn(
            "h-full overflow-auto transition-all duration-300 ease-in-out",
            isFiltersOpen
              ? "w-3/12 opacity-100 visible"
              : "w-0 opacity-0 invisible"
          )}
        >
          <FiltersSidebar />
        </div>

        <Map />

        <div className="basis-4/12 overflow-y-auto">
          <Listings authUserId={authUser?.data?.userInfo.cognitoID} />
        </div>
      </div>
    </div>
  );
}
