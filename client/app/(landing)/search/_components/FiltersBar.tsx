"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyTypeIcons } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { Filter, Grid, List, Search } from "lucide-react";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import useFiltersState, { FiltersState } from "@/hooks/use-filters-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FiltersBar = () => {
  const router = useRouter();

  const pathname = usePathname();

  const {
    isFiltersOpen,
    toggleFiltersOpen,
    filters,
    setFilters,
    viewMode,
    setViewMode,
  } = useFiltersState();

  const [searchInput, setSearchInput] = useState(filters.location);

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

  const handleFiltersChange = (
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentRange = [...filters[key]];

      const index = isMin ? 0 : 1;

      currentRange[index] = value === "any" ? null : Number(value);

      newValue = currentRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };

    setFilters(newFilters);

    updateUrl(newFilters);
  };

  return (
    <div className="w-full flex items-start justify-between py-5">
      <div className="flex flex-wrap text-sm items-center gap-4 p-2">
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-[#a8a8af] hover:bg-[#82828b] hover:text-[#fcfcfc] cursor-pointer",
            isFiltersOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={toggleFiltersOpen}
        >
          <Filter className="w-4 h-4" />

          <span>All Filters</span>
        </Button>

        {/* Location */}
        <div className="flex items-center border rounded-xl pl-4">
          <input
            className="w-40"
            placeholder="Search location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <Button className="bg-transparent border-l hover:bg-transparent text-black">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Price Range */}
        <div className="flex gap-1">
          {/* Minimum Price Selector */}
          <Select
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFiltersChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              {formatPriceValue(filters.priceRange[0], true)}
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="any">Any Min Price</SelectItem>

              {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  ${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Maximum Price Selector */}
          <Select
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFiltersChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false)}
              </SelectValue>
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="any">Any Max Price</SelectItem>
              {[1000, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  &lt;${price / 1000}k
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-1">
          {/* Beds */}
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFiltersChange("beds", value, null)}
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="any">Any Beds</SelectItem>

              <SelectItem value="1">1+ bed</SelectItem>

              <SelectItem value="2">2+ beds</SelectItem>

              <SelectItem value="3">3+ beds</SelectItem>

              <SelectItem value="4">4+ beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Baths */}
          <Select
            value={filters.baths}
            onValueChange={(value) => handleFiltersChange("baths", value, null)}
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="any">Any Baths</SelectItem>

              <SelectItem value="1">1+ bath</SelectItem>

              <SelectItem value="2">2+ baths</SelectItem>

              <SelectItem value="3">3+ baths</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <Select
          value={filters.propertyType || "any"}
          onValueChange={(value) =>
            handleFiltersChange("propertyType", value, null)
          }
        >
          <SelectTrigger className="w-fit rounded-xl border-primary-400">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>

          <SelectContent className="bg-white">
            <SelectItem value="any">Any Property Type</SelectItem>

            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />

                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Mode */}
      <div className="flex justify-between items-center gap-4 p-2">
        <div className="flex border rounded-xl">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
