import { z } from "zod";
import { PropertyTypeEnum } from "../constants";

export const PropertySchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  address: z.string().min(1, { message: "Address is required." }).trim(),
  city: z.string().min(1, { message: "City is required." }).trim(),
  state: z.string().min(1, { message: "State is required." }).trim(),
  country: z.string().min(1, { message: "Country is required." }).trim(),
  postalCode: z.string().min(1, { message: "Postal code is required." }).trim(),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .trim(),
  price_per_month: z.coerce
    .number()
    .min(1, { message: "Price per month is required." }),
  security_deposit: z.coerce
    .number()
    .min(1, { message: "Security deposit is required." }),
  application_fee: z.coerce
    .number()
    .min(1, { message: "Application fee is required." }),
  photo_urls: z
    .array(
      z.union([
        z.instanceof(File),
        z.string().transform((value) => (value === "" ? "" : value)),
      ])
    )
    .min(1, { message: "At least one image is required." }),
  is_pets_allowed: z.boolean().default(false),
  is_parking_included: z.boolean().default(false),
  beds: z.coerce.number().min(1, { message: "Beds is required." }),
  baths: z.coerce.number().min(1, { message: "Baths is required." }),
  square_feet: z.coerce
    .number()
    .min(1, { message: "Square feet is required." }),
  property_type: z.enum([
    PropertyTypeEnum.Rooms,
    PropertyTypeEnum.Tinyhouse,
    PropertyTypeEnum.Apartment,
    PropertyTypeEnum.Villa,
    PropertyTypeEnum.Townhouse,
    PropertyTypeEnum.Cottage,
  ]),
});

export type PropertyValidator = z.infer<typeof PropertySchema>;
