"use client";

import React from "react";
import { FilteredProperty } from "@/types";
import { MapPin, Star } from "lucide-react";

type Props = {
  property: FilteredProperty | undefined | null;
};

const PropertyOverview = ({ property }: Props) => {
  if (!property) return null;

  return (
    <div>
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          {property.location?.country} / {property.location?.state} /{" "}
          <span className="font-semibold text-gray-600">
            {property.location?.city}
          </span>
        </div>

        <h1 className="text-3xl font-bold my-5">{property.name}</h1>

        <div className="flex justify-between items-center">
          <span className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-gray-700" />
            {property.location?.city}, {property.location?.state},{" "}
            {property.location?.country}
          </span>

          <div className="flex justify-between items-center gap-3">
            <span className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {parseFloat(property.averageRating || "0").toFixed(1)} (
              {property.numberOfReviews} Reviews)
            </span>
            <span className="text-green-600">Verified Listing</span>
          </div>
        </div>
      </div>

      <div className="border border-primary-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center gap-4 px-5">
          <div>
            <div className="text-sm text-gray-500">Monthly Rent</div>

            <div className="font-semibold">
              ${property.pricePerMonth.toLocaleString()}
            </div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Bedrooms</div>

            <div className="font-semibold">{property.beds} bd</div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Bathrooms</div>

            <div className="font-semibold">{property.baths} ba</div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Square Feet</div>

            <div className="font-semibold">
              {property.squareFeet.toLocaleString()} sq ft
            </div>
          </div>
        </div>
      </div>

      <div className="my-16">
        <h2 className="text-xl font-semibold mb-5">About {property.name}</h2>

        <p className="text-gray-500 leading-7">{property.description}</p>
      </div>
    </div>
  );
};

export default PropertyOverview;
