"use client";

import Link from "next/link";
import Image from "next/image";
import { PaymentType } from "@/types";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "@/components/LoadingPage";
import { redirect, useParams } from "next/navigation";
import { getPropertyDetails } from "@/lib/data/properties";
import { ArrowDownToLine, ArrowLeft, Check, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PropertysPage() {
  const { id } = useParams();

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
    data,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["get-property-details", id],
    queryFn: async () => {
      const data = await getPropertyDetails({
        propertyId: id as string,
        cognitoId: authUser?.data?.userInfo.cognitoID as string,
      });

      return data;
    },
  });

  const getCurrentMonthPaymentStatus = ({
    leaseId,
    payments,
  }: {
    leaseId: string;
    payments: PaymentType[];
  }) => {
    const currentDate = new Date();

    const currentMonthPayment = payments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );

    return currentMonthPayment?.paymentStatus || "Not Paid";
  };

  if (isLoading) {
    return <LoadingPage className="w-full h-full" />;
  }

  if (!isLoading && !authErr && !authUser) {
    redirect("/signin");
  }

  if (authUser?.data?.role.toLowerCase() !== "manager") {
    redirect("/");
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
        Something went wrong! Unable to get property.
      </div>
    );
  }

  if (!isFetching && !isError && !data?.property) {
    redirect(`/managers/properties`);
  }

  return (
    <div className="pt-8 pb-5 px-8">
      <Link
        href="/managers/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />

        <span>Back to Properties</span>
      </Link>

      <Headings
        title={data?.property?.name || "My Property"}
        subtitle="Manage tenants and leases for this property"
      />

      <div className="w-full space-y-6">
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Tenants Overview</h2>

              <p className="text-sm text-gray-500">
                Manage and view all tenants for this property.
              </p>
            </div>

            <div>
              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2
              px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />

                <span>Download All</span>
              </button>
            </div>
          </div>

          <hr className="mt-4 mb-1" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>

                  <TableHead>Lease Period</TableHead>

                  <TableHead>Monthly Rent</TableHead>

                  <TableHead>Current Month Status</TableHead>

                  <TableHead>Contact</TableHead>

                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.leases?.map((lease) => (
                  <TableRow key={lease.id} className="h-24">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src="/placeholder.webp"
                          alt={lease.tenant.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />

                        <div>
                          <div className="font-semibold">
                            {lease.tenant.name}
                          </div>

                          <div className="text-sm text-gray-500">
                            {lease.tenant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        {new Date(lease.startDate).toLocaleDateString()} -
                      </div>
                      <div>{new Date(lease.endDate).toLocaleDateString()}</div>
                    </TableCell>

                    <TableCell>${parseFloat(lease.rent).toFixed(2)}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getCurrentMonthPaymentStatus({
                            leaseId: lease.id,
                            payments: lease.payments,
                          }) === "Paid"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {getCurrentMonthPaymentStatus({
                          leaseId: lease.id,
                          payments: lease.payments,
                        }) === "Paid" && (
                          <Check className="w-4 h-4 inline-block mr-1" />
                        )}
                        {getCurrentMonthPaymentStatus({
                          leaseId: lease.id,
                          payments: lease.payments,
                        })}
                      </span>
                    </TableCell>

                    <TableCell>{lease.tenant.phonenumber}</TableCell>

                    <TableCell>
                      <button
                        className={`border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex 
                      items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50`}
                      >
                        <ArrowDownToLine className="w-4 h-4 mr-1" />
                        Download Agreement
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
