import axiosInstance from "../axios";
import { cleanParams } from "../utils";
import { FilteredProperty } from "@/types";
import { FiltersState } from "@/hooks/use-filters-state";

export const getFilteredProperties = async ({
  filters,
  favoriteIds,
}: {
  filters: Partial<FiltersState>;
  favoriteIds?: string[];
}) => {
  try {
    const params = cleanParams({
      location: filters.location,
      priceMin: filters.priceRange?.[0],
      priceMax: filters.priceRange?.[1],
      beds: filters.beds,
      baths: filters.baths,
      squareFeetMin: filters.squareFeet?.[0],
      squareFeetMax: filters.squareFeet?.[1],
      propertyType: filters.propertyType,
      amenities: filters.amenities?.join(","),
      availableFrom: filters.availableFrom,
      latitude: filters.coordinates?.[0],
      favoriteIds: favoriteIds?.join(","),
      longitude: filters.coordinates?.[1],
    });

    const res = await axiosInstance.get(`/properties`, {
      params,
    });

    return res.data as FilteredProperty[];
  } catch (err) {
    console.log("getFilteredProperties err: ", err);

    return [];
  }
};
