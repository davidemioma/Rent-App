"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type DiscoverItem = {
  imageSrc: string;
  title: string;
  description: string;
};

const ItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverCard = ({ imageSrc, title, description }: DiscoverItem) => {
  return (
    <motion.div variants={ItemVariants}>
      <div className="px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72">
        <div className="bg-blue-300 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto">
          <Image
            src={imageSrc}
            width={30}
            height={30}
            className="w-full h-full"
            alt={title}
          />
        </div>

        <h3 className="mt-4 text-xl font-medium text-gray-800">{title}</h3>

        <p className="mt-2 text-base text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
};

const DiscoverSection = () => {
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
      <div className="w-full max-w-6xl xl:max-w-7xl mx-auto">
        <motion.div variants={ItemVariants} className="my-12 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Discover
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Find your Dream Rental Property Today!
          </p>

          <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
            Searching for your dream rental property has never been easier. With
            our user-friendly search feature, you can quickly find the perfect
            home that meets all your needs. Start your search today and discover
            your dream rental property!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
          {[
            {
              imageSrc: "/landing-icon-wand.png",
              title: "Search for Properties",
              description:
                "Browse through our extensive collection of rental properties in your desired location.",
            },
            {
              imageSrc: "/landing-icon-calendar.png",
              title: "Book Your Rental",
              description:
                "Once you've found the perfect rental property, easily book it online with just a few clicks.",
            },
            {
              imageSrc: "/landing-icon-heart.png",
              title: "Enjoy your New Home",
              description:
                "Move into your new rental property and start enjoying your dream home.",
            },
          ].map((card, index) => (
            <motion.div key={index} variants={ItemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoverSection;
