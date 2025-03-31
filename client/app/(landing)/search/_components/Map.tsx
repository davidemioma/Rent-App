"use client";

import React, { useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useFiltersState from "@/hooks/use-filters-state";
import { useQuery } from "@tanstack/react-query";
import { getFilteredProperties } from "@/lib/actions/properties";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const Map = () => {
  const mapContainerRef = useRef(null);

  const { isFiltersOpen, filters } = useFiltersState();

  const {
    data: properties,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-filtered-properties"],
    queryFn: async () => {
      const data = await getFilteredProperties({ filters });

      return data;
    },
  });

  return (
    <div>
      <div>{JSON.stringify(properties)}</div>
    </div>
  );
};

export default Map;
