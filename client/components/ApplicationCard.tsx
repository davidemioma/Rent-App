import React, { useState } from "react";
import Image from "next/image";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import { Manager, PropertyApplication, Tenant } from "@/types";

type Props = {
  application: PropertyApplication;
  userType: Manager | Tenant;
  children: React.ReactNode;
  userRole: string;
};

const ApplicationCard = ({
  application,
  userType,
  userRole,
  children,
}: Props) => {
  const [imgSrc, setImgSrc] = useState(
    application.details.photoUrls?.[0] || "/placeholder.jpg"
  );

  const statusColor =
    application.details.applicationStatus === "Approved"
      ? "bg-green-500"
      : application.details.applicationStatus === "Denied"
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white mb-4">
      <div className="flex flex-col lg:flex-row  items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.details.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2">
                {application.details.name}
              </h2>
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{`${application.details.locationCity}, ${application.details.locationCountry}`}</span>
              </div>
            </div>
            <div className="text-xl font-semibold">
              ${parseFloat(application.details.pricePerMonth).toFixed(2)}{" "}
              <span className="text-sm font-normal">/ month</span>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 ${statusColor} text-white rounded-full text-sm`}
              >
                {application.details.applicationStatus}
              </span>
            </div>
            <hr className="mt-3" />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Start Date:</span>{" "}
            {new Date(application.lease?.startDate).toLocaleDateString()}
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">End Date:</span>{" "}
            {new Date(application.lease?.endDate).toLocaleDateString()}
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Next Payment:</span>{" "}
            {new Date(application.lease?.nextPaymentDate).toLocaleDateString()}
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-lg font-semibold">
              {userRole === "manager" ? "Tenant" : "Manager"}
            </div>

            <hr className="mt-3" />
          </div>

          <div className="flex gap-4">
            <div>
              <Image
                src="/landing-i1.png"
                alt={userType.name}
                width={40}
                height={40}
                className="rounded-full mr-2 min-w-[40px] min-h-[40px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-semibold">{userType.name}</div>

              <div className="text-sm flex items-center text-primary-600">
                <PhoneCall className="w-5 h-5 mr-2" />

                {userType.phonenumber}
              </div>

              <div className="text-sm flex items-center text-primary-600">
                <Mail className="w-5 h-5 mr-2" />
                {userType.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {children}
    </div>
  );
};

export default ApplicationCard;
