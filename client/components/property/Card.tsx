"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FilteredProperty } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { checkFavorite } from "@/lib/data/properties";
import { Bath, Bed, Heart, House, Star } from "lucide-react";

type Props = {
  property: FilteredProperty;
  showFavoriteBtn: boolean;
  propertyLink: string;
  cognitoId: string | undefined | null;
  isPending: boolean;
  handleToggleFavorite: (productId: string) => void;
};

const Card = ({
  property,
  showFavoriteBtn,
  propertyLink,
  cognitoId,
  isPending,
  handleToggleFavorite,
}: Props) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.webp"
  );

  const { data } = useQuery({
    queryKey: ["is-Favorite", property.id, cognitoId],
    queryFn: async () => {
      if (!cognitoId) return { isFavorite: false };

      const res = await checkFavorite({
        propertyId: property.id,
        cognitoId: cognitoId as string,
      });

      return res;
    },
  });

  const isFavorite = data?.isFavorite || false;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full mb-5">
      <div className="relative">
        <div className="w-full h-48 relative">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
        </div>

        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.isPetsAllowed && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              Pets Allowed
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              Parking Included
            </span>
          )}
        </div>

        {showFavoriteBtn && (
          <button
            className="absolute bottom-4 right-4 bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer"
            onClick={() => handleToggleFavorite(property.id)}
            disabled={isPending}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-1 cursor-pointer">
          {propertyLink ? (
            <Link
              href={propertyLink}
              className="hover:underline hover:text-blue-600"
              scroll={false}
            >
              {property.name}
            </Link>
          ) : (
            property.name
          )}
        </h2>

        <p className="text-gray-600 mb-2">
          {property?.location?.address}, {property?.location?.city}
        </p>

        <div className="flex md:flex-col justify-between items-center md:items-start">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />

            <span className="font-semibold">
              {(
                parseFloat(property.averageRating.String) +
                Math.random() * 5
              ).toFixed(1)}
            </span>

            <span className="text-gray-600 ml-1">
              ({property.numberOfReviews.Int32} Reviews)
            </span>
          </div>

          <p className="text-lg font-bold mb-3">
            ${parseFloat(property.pricePerMonth).toFixed(2)}{" "}
            <span className="text-gray-600 text-base font-normal"> /month</span>
          </p>
        </div>

        <hr />

        <div className="flex justify-between items-center gap-4 text-gray-600 mt-5">
          <span className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            {property.beds} Bed
          </span>

          <span className="flex items-center">
            <Bath className="w-5 h-5 mr-2" />
            {property.baths} Bath
          </span>

          <span className="flex items-center">
            <House className="w-5 h-5 mr-2" />
            {property.squareFeet} sq ft
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
