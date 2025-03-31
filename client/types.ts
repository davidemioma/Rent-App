export type Manager = {
  id: string;
  cognitoID: string;
  name: string;
  email: string;
  phonenumber: string;
};

export type Tenant = {
  id: string;
  cognitoID: string;
  name: string;
  email: string;
  phonenumber: string;
};

export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type Location = {
  id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: Coordinates;
};

export type FilteredProperty = {
  id: string;
  name: string;
  description: string;
  pricePerMonth: string;
  securityDeposit: string;
  applicationFee: string;
  photoUrls: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: string;
  squareFeet: number;
  propertyType: string;
  averageRating: string | null;
  numberOfReviews: number | null;
  locationId: string;
  managerId: string;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  location: Location;
};
