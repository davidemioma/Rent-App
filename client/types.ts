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

type StringValid = {
  String: string;
  Valid: boolean;
};

type IntValid = {
  Int32: string;
  Valid: boolean;
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
  averageRating: StringValid;
  numberOfReviews: IntValid;
  locationId: string;
  managerId: string;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  location: Location;
};

export type FavoriteProperty = {
  id: string;
  propertyId: string;
  tenantId: string;
  property: FilteredProperty;
};

export type LeaseType = {
  id: string;
  propertyId: string;
  tenantId: string;
  rent: string;
  deposit: string;
  startDate: Date;
  endDate: Date;
  property: FilteredProperty;
};

export type PaymentType = {
  id: string;
  leaseId: string;
  amountDue: string;
  amountPaid: string;
  dueDate: Date;
  paymentDate: Date;
  paymentStatus: string;
};

export type ManagerLeaseType = {
  id: string;
  propertyId: string;
  tenantId: string;
  rent: string;
  deposit: string;
  startDate: Date;
  endDate: Date;
  tenant: Tenant;
  payments: PaymentType[];
};

export type PropertyApplication = {
  lease: {
    id: string;
    propertyId: string;
    tenantId: string;
    rent: string;
    deposit: string;
    startDate: Date;
    endDate: Date;
    nextPaymentDate: Date;
  };
  details: {
    application_id: string;
    leaseId: string | null;
    applicationName: string;
    applicationEmail: string;
    applicationPhoneNumber: string;
    applicationMessage: string | null;
    applicationStatus: string;
    applicationApplicationDate: Date;
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
    tenantId: string | null;
    managerId: string;
    createdAt: Date;
    updatedAt: Date;
    propertyLocationId: string;
    locationAddress: string;
    locationCity: string;
    locationState: string;
    locationCountry: string;
    locationPostalCode: string;
    managerUserId: string;
    managerCognitoId: string;
    managerName: string;
    managerEmail: string;
    managerPhonenumber: string;
    tenantUserId: string;
    tenantCognitoId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhonenumber: string;
  };
};
