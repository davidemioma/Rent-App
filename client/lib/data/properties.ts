import axiosInstance from "../axios";
import { cleanParams } from "../utils";
import { FiltersState } from "@/hooks/use-filters-state";
import {
  FavoriteProperty,
  FilteredProperty,
  LeaseType,
  ManagerLeaseType,
  PaymentType,
} from "@/types";

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
      `/tenants/${cognitoId}/check-favorite/${propertyId}`
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

export const getCurrentResidences = async (cognitoId: string) => {
  try {
    const res = await axiosInstance.get(`/tenants/${cognitoId}/residences`);

    if (res.status !== 200) {
      return [];
    }

    return res.data as FilteredProperty[];
  } catch (err) {
    console.log("getCurrentResidences err: ", err);

    return [];
  }
};

type ReturnType = {
  property: FilteredProperty | null;
  lease: LeaseType | null;
  payments: PaymentType[];
};

export const getLease = async (propertyId: string) => {
  try {
    const res = await axiosInstance.get(`/leases/${propertyId}`);

    if (res.status !== 200) {
      return null;
    }

    return res.data as LeaseType;
  } catch (err) {
    console.log("getLease err: ", err);

    return null;
  }
};

export const getPayments = async (leaseId: string) => {
  try {
    const res = await axiosInstance.get(`/leases/${leaseId}/payments`);

    if (res.status !== 200) {
      return [];
    }

    return res.data as PaymentType[];
  } catch (err) {
    console.log("getLease err: ", err);

    return [];
  }
};

export const getResidenceDetails = async ({
  propertyId,
}: {
  propertyId: string;
}): Promise<ReturnType> => {
  try {
    const property = await getProperty(propertyId);

    if (!property) {
      return {
        property: null,
        lease: null,
        payments: [],
      };
    }

    const lease = await getLease(propertyId);

    if (!lease) {
      return {
        property,
        lease: null,
        payments: [],
      };
    }

    const payments = await getPayments(lease?.id);

    return {
      property,
      lease,
      payments,
    };
  } catch (err) {
    console.log("getResidenceDetails err: ", err);

    return {
      property: null,
      lease: null,
      payments: [],
    };
  }
};

export const getManagerProperties = async (cognitoId: string) => {
  try {
    const res = await axiosInstance.get(`/managers/${cognitoId}/properties`);

    if (res.status !== 200) {
      return [];
    }

    console.log("Manager Properties: ", res.data);

    return res.data as FilteredProperty[];
  } catch (err) {
    console.log("getManagerProperties err: ", err);

    return [];
  }
};

type ManageReturnType = {
  property: FilteredProperty | null;
  leases: ManagerLeaseType[];
};

export const getLeases = async ({
  propertyId,
  cognitoId,
}: {
  propertyId: string;
  cognitoId: string;
}) => {
  try {
    const res = await axiosInstance.get(
      `/managers/${cognitoId}/properties/${propertyId}/leases`
    );

    if (res.status !== 200) {
      return [];
    }

    return res.data as ManagerLeaseType[];
  } catch (err) {
    console.log("getLease err: ", err);

    return [];
  }
};

export const getPropertyDetails = async ({
  propertyId,
  cognitoId,
}: {
  propertyId: string;
  cognitoId: string;
}): Promise<ManageReturnType> => {
  try {
    const property = await getProperty(propertyId);

    if (!property) {
      return {
        property: null,
        leases: [],
      };
    }

    const leases = await getLeases({ propertyId, cognitoId });

    return {
      property,
      leases,
    };
  } catch (err) {
    console.log("getResidenceDetails err: ", err);

    return {
      property: null,
      leases: [],
    };
  }
};
