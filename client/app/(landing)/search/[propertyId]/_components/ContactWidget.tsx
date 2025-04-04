"use client";

import React from "react";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  isAuthUser: boolean;
};

const ContactWidget = ({ isAuthUser }: Props) => {
  const router = useRouter();

  const handleButtonClick = () => {
    if (isAuthUser) {
      // Open modal
    } else {
      router.push("/signin");
    }
  };
  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      <div className="flex items-center gap-5 mb-4 border border-primary-200 p-4 rounded-xl">
        <div className="flex items-center p-4 bg-primary-900 rounded-full">
          <Phone className="text-primary-50" size={15} />
        </div>

        <div>
          <p>Contact This Property</p>

          <div className="text-lg font-bold text-primary-800">
            (424) 340-5574
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-[#27272a] text-white hover:bg-[#57575f]"
        onClick={handleButtonClick}
      >
        {isAuthUser ? "Submit Application" : "Sign In to Apply"}
      </Button>

      <hr className="my-4" />

      <div className="text-sm">
        <div className="text-primary-600 mb-1">Language: English.</div>

        <div className="text-primary-600">
          Open by appointment on Monday - Sunday
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
