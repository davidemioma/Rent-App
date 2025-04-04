"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import useFiltersState from "@/hooks/use-filters-state";

const HeroSection = () => {
  const router = useRouter();

  const { filters, setFilters } = useFiltersState();

  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationSearch = async () => {
    try {
      const query = searchQuery.trim();

      if (!query) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        setFilters({
          ...filters,
          location: query,
          coordinates: [lat, lng],
        });

        const params = new URLSearchParams({
          location: query,
          lat: lat.toString(),
          lng: lng,
        });

        router.push(`/search?${params.toString()}`);
      }
    } catch (err) {
      console.error("HeroSection handleLocationSearch Err:", err);

      toast.error("error search location!");
    }
  };

  return (
    <section
      className="relative"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <Image
        className="object-cover"
        src="/landing-splash.jpg"
        fill
        alt="Rentify Hero Section"
        priority
      />

      <div className="absolute bg-black/60 inset-0" />

      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeIn",
          type: "tween",
        }}
      >
        <div className="w-full max-w-4xl mx-auto text-white px-6 sm:px-8 lg:px-12 xl:px-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-4">
            Start your journey to finding the perfect place to call home.
          </h1>

          <p className="text-lg text-muted text-center mb-8">
            Explore our wide range of rental properties tailored to fit your
            lifestyle and needs.
          </p>

          <div className="flex justify-center">
            <Input
              className="h-12 max-w-lg bg-white text-black border-none rounded-none rounded-l-xl"
              value={searchQuery}
              type="text"
              placeholder="Search by city, neighbourhood or address."
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button
              className="bg-red-500 h-12 rounded-none rounded-r-xl cursor-pointer hover:bg-red-500 hover:opacity-75 transition"
              onClick={handleLocationSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
