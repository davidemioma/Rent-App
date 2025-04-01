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

const CardCompact = ({
  property,
  showFavoriteBtn,
  propertyLink,
  cognitoId,
  isPending,
  handleToggleFavorite,
}: Props) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg"
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
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full flex h-40 mb-5">
      <div className="relative w-1/3">
        <Image
          src={imgSrc}
          alt={property.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder.jpg")}
        />

        <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
          {property.isPetsAllowed && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full w-fit">
              Pets
            </span>
          )}

          {property.isParkingIncluded && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              Parking
            </span>
          )}
        </div>
      </div>

      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-1">
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

            {showFavoriteBtn && (
              <button
                className="bg-white rounded-full p-1"
                onClick={() => handleToggleFavorite(property.id)}
                disabled={isPending}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-1 text-sm">
            {property?.location?.address}, {property?.location?.city}
          </p>

          <div className="flex text-sm items-center">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />

            <span className="font-semibold">
              {parseFloat(property.averageRating || "0.0").toFixed(1)}
            </span>

            <span className="text-gray-600 ml-1">
              ({property.numberOfReviews})
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-2 text-gray-600">
            <span className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {property.beds}
            </span>

            <span className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {property.baths}
            </span>

            <span className="flex items-center">
              <House className="w-4 h-4 mr-1" />
              {property.squareFeet}
            </span>
          </div>

          <p className="text-base font-bold">
            ${parseFloat(property.pricePerMonth).toFixed(0)}
            <span className="text-gray-600 text-xs font-normal"> /mo</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardCompact;
