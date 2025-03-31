"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cleanParams, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRouter, usePathname } from "next/navigation";
import { AmenityIcons, PropertyTypeIcons } from "@/lib/constants";
import useFiltersState, {
  FiltersState,
  initialFiltersState,
} from "@/hooks/use-filters-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FiltersSidebar = () => {
  const router = useRouter();

  const pathname = usePathname();

  const { isFiltersOpen, filters, setFilters } = useFiltersState();

  const [localFilters, setLocalFilters] = useState<FiltersState>(filters);

  const updateUrl = (filters: FiltersState) => {
    const cleanFilters = cleanParams(filters);

    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  };

  const onSubmit = () => {
    setFilters(localFilters);

    updateUrl(localFilters);
  };

  const onReset = () => {
    setLocalFilters(initialFiltersState);

    setFilters(initialFiltersState);

    updateUrl(initialFiltersState);
  };

  if (!isFiltersOpen) return null;

  return (
    <div className="bg-white h-full px-4 pb-10 overflow-auto rounded-lg">
      <div className="flex flex-col space-y-6">
        {/* Location */}
        <div>
          <h4 className="font-bold mb-2">Location</h4>

          <div className="flex items-center">
            <Input
              placeholder="Enter location"
              value={localFilters.location}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="rounded-l-xl rounded-r-none border-r-0"
            />

            <Button
              onClick={() => {}}
              className="rounded-r-xl rounded-l-none border-l-none border-black shadow-none border hover:bg-primary-700 hover:text-primary-50"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Property */}
        <div>
          <h4 className="font-bold mb-2">Property Type</h4>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <div
                key={type}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                  localFilters.propertyType === type
                    ? "border-black"
                    : "border-gray-200"
                )}
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    propertyType: type,
                  }))
                }
              >
                <Icon className="w-5 h-5 mb-2" />

                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-bold mb-2">Price Range (Monthly)</h4>

          <Slider
            min={0}
            max={10000}
            step={100}
            value={[
              localFilters.priceRange[0] ?? 0,
              localFilters.priceRange[1] ?? 10000,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                priceRange: value as [number, number],
              }))
            }
          />

          <div className="flex justify-between mt-2">
            <span>${localFilters.priceRange[0] ?? 0}</span>

            <span>${localFilters.priceRange[1] ?? 10000}</span>
          </div>
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-4">
          <div className="flex-1">
            <h4 className="font-bold mb-2">Beds</h4>

            <Select
              value={localFilters.beds || "any"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, beds: value }))
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Beds" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="any">Any beds</SelectItem>

                <SelectItem value="1">1+ bed</SelectItem>

                <SelectItem value="2">2+ beds</SelectItem>

                <SelectItem value="3">3+ beds</SelectItem>

                <SelectItem value="4">4+ beds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <h4 className="font-bold mb-2">Baths</h4>

            <Select
              value={localFilters.baths || "any"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, baths: value }))
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Baths" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="any">Any baths</SelectItem>

                <SelectItem value="1">1+ bath</SelectItem>

                <SelectItem value="2">2+ baths</SelectItem>

                <SelectItem value="3">3+ baths</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Square Feet */}
        <div>
          <h4 className="font-bold mb-2">Square Feet</h4>

          <Slider
            className="[&>.bar]:bg-primary-700"
            min={0}
            max={5000}
            step={100}
            value={[
              localFilters.squareFeet[0] ?? 0,
              localFilters.squareFeet[1] ?? 5000,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                squareFeet: value as [number, number],
              }))
            }
          />

          <div className="flex justify-between mt-2">
            <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>

            <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-bold mb-2">Amenities</h4>

          <div className="flex flex-wrap gap-2">
            {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
              <div
                key={amenity}
                className={cn(
                  "flex items-center space-x-2 p-2 border rounded-lg hover:cursor-pointer",
                  localFilters.amenities.includes(amenity)
                    ? "border-black"
                    : "border-gray-200"
                )}
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    amenities: prev.amenities.includes(amenity)
                      ? prev.amenities.filter((a) => a !== amenity)
                      : [...prev.amenities, amenity],
                  }))
                }
              >
                <Icon className="w-5 h-5 hover:cursor-pointer" />

                <Label className="hover:cursor-pointer">{amenity}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Available From */}
        <div>
          <h4 className="font-bold mb-2">Available From</h4>

          <Input
            className="rounded-xl w-fit"
            type="date"
            value={
              localFilters.availableFrom !== "any"
                ? localFilters.availableFrom
                : ""
            }
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                availableFrom: e.target.value ? e.target.value : "any",
              }))
            }
          />
        </div>

        {/* Apply and Reset buttons */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            onClick={onSubmit}
            className="flex-1 bg-[#27272a] text-white rounded-xl"
          >
            Apply
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
