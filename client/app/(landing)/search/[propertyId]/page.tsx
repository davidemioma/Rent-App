"use client";

import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { getProperty } from "@/lib/data/properties";
import ImagePreview from "./_components/ImagePreview";
import { redirect, useParams } from "next/navigation";
import ContactWidget from "./_components/ContactWidget";
import PropertyDetails from "./_components/PropertyDetails";
import PropertyOverview from "./_components/PropertyOverview";
import PropertyLocation from "./_components/PropertyLocation";
import ApplicationModal from "./_components/ApplicationModal";
import { useState } from "react";

export default function PropertyPage() {
  const { propertyId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: authUser,
    isLoading,
    isError: authErr,
  } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  const {
    data: property,
    isLoading: propertyLoading,
    isError,
  } = useQuery({
    queryKey: ["get-property", propertyId],
    queryFn: async () => {
      const data = await getProperty(propertyId as string);

      return data;
    },
  });

  if (isLoading || propertyLoading) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!propertyLoading && !isError && !property) {
    return redirect("/search");
  }

  return (
    <div>
      <ImagePreview
        images={
          property?.photoUrls || [
            "/singlelisting-2.jpg",
            "/singlelisting-3.jpg",
          ]
        }
      />

      <div className="flex flex-col lg:flex-row justify-center gap-10 px-5 lg:mx-auto mt-16 mb-8">
        <div className="order-2 md:order-1">
          <PropertyOverview property={property} />

          <PropertyDetails property={property} />

          <PropertyLocation property={property} />
        </div>

        <div className="order-1 md:order-2">
          <ContactWidget isAuthUser={!!authUser} />
        </div>
      </div>

      {!isLoading && !authErr && authUser && (
        <ApplicationModal
          isOpen={isModalOpen}
          onOpenChange={() => setIsModalOpen((prev) => !prev)}
          propertyId={propertyId as string}
          authUser={authUser.data?.userInfo}
          userRole={authUser.data?.role as string}
        />
      )}
    </div>
  );
}
