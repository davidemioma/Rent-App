"use client";

import React from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { FilteredProperty } from "@/types";
import Card from "@/components/property/Card";
import useFiltersState from "@/hooks/use-filters-state";
import { toggleFavorite } from "@/lib/actions/properties";
import CardCompact from "@/components/property/CardCompact";
import { getFilteredProperties } from "@/lib/data/properties";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  authUserId: string | undefined | null;
};

const Listings = ({ authUserId }: Props) => {
  const queryClient = useQueryClient();

  const { filters, viewMode } = useFiltersState();

  const {
    data: properties,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-filtered-properties"],
    queryFn: async () => {
      const data = await getFilteredProperties({ filters });

      return data as FilteredProperty[];
    },
  });

  const {} = useMutation({
    mutationKey: ["toggle-favorite"],
    mutationFn: async ({
      cognitoId,
      propertyId,
    }: {
      cognitoId: string;
      propertyId: string;
    }) => {
      const res = await toggleFavorite({ cognitoId, propertyId });

      return res;
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      }

      toast.success(res.message || "Successful!");

      queryClient.invalidateQueries({
        queryKey: ["get-filtered-properties"],
      });
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center px-5 text-center text-muted-foreground">
        Failed to fetch properties!
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center px-5 text-center text-muted-foreground">
        No properties available!
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>

      <div className="w-full p-4">
        {properties.map((property) =>
          viewMode === "grid" ? (
            <Card
              key={property.id}
              property={property}
              showFavoriteBtn={!!authUserId}
            />
          ) : (
            <CardCompact
              key={property.id}
              property={property}
              showFavoriteBtn={!!authUserId}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Listings;
