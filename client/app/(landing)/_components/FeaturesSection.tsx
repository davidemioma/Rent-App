"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Feature = {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
};

const FeatureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturedCard = ({
  imageSrc,
  title,
  description,
  linkHref,
  linkText,
}: Feature) => {
  return (
    <motion.div className="text-center" variants={FeatureVariants}>
      <div className="p-4 rounded-lg mb-4 flex items-center justify-center h-48">
        <Image
          src={imageSrc}
          width={400}
          height={400}
          className="w-full h-full object-contain"
          alt={title}
        />
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      <p className="mb-4">{description}</p>

      <Link
        href={linkHref}
        className="inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
        scroll={false}
      >
        {linkText}
      </Link>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <motion.div
      className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white"
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        staggerChildren: 0.2,
      }}
    >
      <div className="w-full max-w-4xl xl:max-w-6xl mx-auto">
        <motion.h2
          className="w-full sm:w-2/3 mx-auto text-3xl font-bold text-center mb-12"
          variants={FeatureVariants}
        >
          Quickly find a home using our effective search filters!
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
          {[0, 1, 2].map((_, i) => (
            <FeaturedCard
              key={i}
              imageSrc={`/landing-search${3 - i}.png`}
              title={
                [
                  "Trustworthy and Verified Listings",
                  "Browse Rental Listings with Ease",
                  "Simplify Your Rental Search with Advanced",
                ][i]
              }
              description={
                [
                  "Discover the best rental options with user reviews and ratings.",
                  "Get access to user reviews and ratings for a better understanding of rental options.",
                  "Find trustworthy and verified rental listings to ensure a hassle-free experience.",
                ][i]
              }
              linkText={["Explore", "Search", "Discover"][i]}
              linkHref={["/explore", "/search", "/discover"][i]}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturesSection;
