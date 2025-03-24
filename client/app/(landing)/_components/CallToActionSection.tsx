"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const CallToActionSection = () => {
  return (
    <div className="relative py-24">
      <Image
        className="object-cover object-center"
        src="/landing-call-to-action.jpg"
        fill
        alt="Search Section Background"
      />

      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        className="relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 md:mr-10">
            <h2 className="text-2xl font-bold text-white">
              Find Your Dream Rental Property
            </h2>
          </div>

          <div>
            <p className="text-white mb-3">
              Discover a wide range of rental properties in your desired
              location.
            </p>

            <div className="flex justify-center md:justify-start gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-block text-primary-700 bg-white rounded-lg px-6 py-3 font-semibold hover:bg-primary-500 hover:text-primary-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
