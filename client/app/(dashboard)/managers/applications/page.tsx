"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { redirect } from "next/navigation";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import LoadingPage from "@/components/LoadingPage";
import { getAllApplications } from "@/lib/data/properties";
import ApplicationCard from "@/components/ApplicationCard";
import { updateApplicationStatus } from "@/lib/actions/application";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApplicationPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");

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
    queryKey: ["get-applications", authUser?.data?.userInfo.cognitoID],
    queryFn: async () => {
      const data = await getAllApplications();

      return data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-application"],
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await updateApplicationStatus({
        applicationId: id,
        status,
      });

      return result;
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);

        return;
      }

      toast.success("Appliction Updated!");

      queryClient.invalidateQueries({
        queryKey: ["get-applications", authUser?.data?.userInfo.cognitoID],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;

    return application.details.applicationStatus.toLowerCase() === activeTab;
  });

  const handleStatusChange = async (id: string, status: string) => {
    mutate({ id, status });
  };

  if (isLoading || isFetching) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!isLoading && !authErr && !authUser) {
    redirect("/signin");
  }

  if (authUser?.data?.role.toLowerCase() !== "manager") {
    redirect("/");
  }

  if (isError || !applications || (applications && applications.length < 1)) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        {isError
          ? "Something went wrong! Unable to get applications"
          : "You do not manage any applications!"}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <Headings
        title="Applications"
        subtitle="View and manage applications for your properties"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full my-5"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>

          <TabsTrigger value="pending">Pending</TabsTrigger>

          <TabsTrigger value="approved">Approved</TabsTrigger>

          <TabsTrigger value="denied">Denied</TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "denied"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 w-full">
            {filteredApplications
              ?.filter(
                (application) =>
                  tab === "all" ||
                  application.details.applicationStatus.toLowerCase() === tab
              )
              .map((application) => (
                <ApplicationCard
                  key={application.details.application_id}
                  application={application}
                  userRole={authUser.data?.role as string}
                  userType={
                    authUser.data?.role === "tenant"
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
                    {/* Colored Section Status */}
                    <div
                      className={`p-4 text-green-700 grow ${
                        application.details.applicationStatus.toLowerCase() ===
                        "approved"
                          ? "bg-green-100"
                          : application.details.applicationStatus.toLowerCase() ===
                            "denied"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <div className="flex flex-wrap items-center">
                        <File className="w-5 h-5 mr-2 flex-shrink-0" />

                        <span className="mr-2">
                          Application submitted on{" "}
                          {new Date(
                            application.details.applicationApplicationDate
                          ).toLocaleDateString()}
                          .
                        </span>

                        <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />

                        <span
                          className={`font-semibold ${
                            application.details.applicationStatus.toLowerCase() ===
                            "approved"
                              ? "text-green-800"
                              : application.details.applicationStatus.toLowerCase() ===
                                "denied"
                              ? "text-red-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {application.details.applicationStatus.toLowerCase() ===
                            "approved" && "This application has been approved."}
                          {application.details.applicationStatus.toLowerCase() ===
                            "denied" && "This application has been denied."}
                          {application.details.applicationStatus ===
                            "Pending" && "This application is pending review."}
                        </span>
                      </div>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/managers/properties/${application.details.id}`}
                        className={`bg-white border border-gray-300 text-gray-700 py-2 px-4 
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                        scroll={false}
                      >
                        <Hospital className="w-5 h-5 mr-2" />
                        Property Details
                      </Link>

                      {application.details.applicationStatus.toLowerCase() ===
                        "approved" && (
                        <button
                          className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                          disabled={isPending}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Agreement
                        </button>
                      )}

                      {application.details.applicationStatus.toLowerCase() ===
                        "pending" && (
                        <>
                          <button
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500"
                            onClick={() =>
                              handleStatusChange(
                                application.details.application_id,
                                "Approved"
                              )
                            }
                            disabled={isPending}
                          >
                            Approve
                          </button>

                          <button
                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-500"
                            disabled={isPending}
                            onClick={() =>
                              handleStatusChange(
                                application.details.application_id,
                                "Denied"
                              )
                            }
                          >
                            Deny
                          </button>
                        </>
                      )}

                      {application.details.applicationStatus.toLowerCase() ===
                        "denied" && (
                        <button
                          className={`bg-gray-800 text-white py-2 px-4 rounded-md flex items-center
                          justify-center hover:bg-secondary-500 hover:text-primary-50`}
                          disabled={isPending}
                        >
                          Contact User
                        </button>
                      )}
                    </div>
                  </div>
                </ApplicationCard>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
