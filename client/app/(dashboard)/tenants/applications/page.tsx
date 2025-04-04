"use client";

import { redirect } from "next/navigation";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { getAllApplications } from "@/lib/data/properties";
import ApplicationCard from "@/components/ApplicationCard";
import { CircleCheckBig, Clock, Download, XCircle } from "lucide-react";

export default function ApplicationPage() {
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
    data: applications,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["get-application", authUser?.data?.userInfo.cognitoID],
    queryFn: async () => {
      const data = await getAllApplications();

      return data;
    },
  });

  if (isLoading || isFetching) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!isLoading && !authErr && !authUser) {
    redirect("/signin");
  }

  if (authUser?.data?.role.toLowerCase() !== "tenant") {
    redirect("/");
  }

  if (isError || !applications || (applications && applications.length < 1)) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        {isError
          ? "Something went wrong! Unable to get applications"
          : "You do not have any applications!"}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <Headings
        title="Applications"
        subtitle="View and manage applications for your properties"
      />

      <div className="w-full">
        {applications?.map((application) => (
          <ApplicationCard
            key={application.details.application_id}
            application={application}
            userRole={authUser.data?.role as string}
            userType={
              authUser.data?.role === "manager"
                ? {
                    id: application.details.managerId,
                    name: application.details.managerName,
                    email: application.details.managerEmail,
                    cognitoID: application.details.managerCognitoId,
                    phonenumber: application.details.managerPhonenumber,
                  }
                : {
                    id: application.details.tenantId as string,
                    name: application.details.tenantName,
                    email: application.details.tenantEmail,
                    cognitoID: application.details.tenantCognitoId,
                    phonenumber: application.details.tenantPhonenumber,
                  }
            }
          >
            <div className="flex justify-between gap-5 w-full pb-4 px-4">
              {application.details.applicationStatus.toLowerCase() ===
              "approved" ? (
                <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                  <CircleCheckBig className="w-5 h-5 mr-2" />
                  The property is being rented by you until{" "}
                  {new Date(application.lease?.endDate).toLocaleDateString()}
                </div>
              ) : application.details.applicationStatus.toLowerCase() ===
                "pending" ? (
                <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Your application is pending approval
                </div>
              ) : (
                <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Your application has been denied
                </div>
              )}

              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Agreement
              </button>
            </div>
          </ApplicationCard>
        ))}
      </div>
    </div>
  );
}
