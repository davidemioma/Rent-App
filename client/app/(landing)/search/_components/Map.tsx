"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Loader } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { FilteredProperty } from "@/types";
import { useQuery } from "@tanstack/react-query";
import useFiltersState from "@/hooks/use-filters-state";
import { getFilteredProperties } from "@/lib/data/properties";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const createPropertyMarker = (
  property: FilteredProperty,
  map: mapboxgl.Map
) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);
  return marker;
};

const Map = () => {
  const mapContainerRef = useRef(null);

  const { filters } = useFiltersState();

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

  useEffect(() => {
    if (isLoading || isError) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/davidemioma/cl4735p1v001p14pk249txty5",
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    properties?.forEach((property) => {
      const marker = createPropertyMarker(property, map);

      const markerElement = marker.getElement();

      const path = markerElement.querySelector("path[fill='#3FB1CE']");

      if (path) path.setAttribute("fill", "#000000");
    });

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 300);
    };

    resizeMap();

    return () => {
      map.remove();
    };
  }, [isLoading, isError, properties, filters.coordinates]);

  return (
    <div className="relative basis-5/12 grow rounded-xl">
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="w-full h-full flex items-center justify-center px-5 text-center">
          Failed to fetch properties!
        </div>
      )}

      {!isLoading && !isError && (
        <div
          className="map-container rounded-xl"
          ref={mapContainerRef}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      )}
    </div>
  );
};

export default Map;
