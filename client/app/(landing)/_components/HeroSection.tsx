"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
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
              type="text"
              placeholder="Search by city, neighbourhood or address."
            />

            <Button className="bg-red-500 h-12 rounded-none rounded-r-xl cursor-pointer hover:bg-red-500 hover:opacity-75 transition">
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
