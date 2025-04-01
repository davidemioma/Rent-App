import axiosInstance from "../axios";
import { cleanParams } from "../utils";
import { FiltersState } from "@/hooks/use-filters-state";
import { FavoriteProperty, FilteredProperty } from "@/types";

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

export const checkFavorite = async ({
  propertyId,
  cognitoId,
}: {
  propertyId: string;
  cognitoId: string;
}) => {
  try {
    const res = await axiosInstance.get(
      `/${cognitoId}/check-favorite/${propertyId}`
    );

    if (res.status !== 200) {
      return { isFavorite: false };
    }

    return { isFavorite: res.data.isFavorite };
  } catch (err) {
    console.log("checkFavorite err: ", err);

    return { isFavorite: false };
  }
};

export const getProperty = async (propertyId: string) => {
  try {
    const res = await axiosInstance.get(`/properties/${propertyId}`);

    if (res.status !== 200) {
      return null;
    }

    return res.data as FilteredProperty;
  } catch (err) {
    console.log("getProperty err: ", err);

    return null;
  }
};

export const getFavoriteProperties = async (cognitoId: string) => {
  try {
    const res = await axiosInstance.get(`/tenants/${cognitoId}/favorites`);

    if (res.status !== 200) {
      return [];
    }

    return res.data as FavoriteProperty[];
  } catch (err) {
    console.log("getFavoriteProperties err: ", err);

    return [];
  }
};
