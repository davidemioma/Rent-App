"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import Headings from "@/components/Headings";
import { getAuthUser } from "@/lib/data/auth";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import FilesUpload from "@/components/FilesUpload";
import { PropertyTypeEnum } from "@/lib/constants";
import LoadingPage from "@/components/LoadingPage";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProperty } from "@/lib/actions/properties";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PropertySchema, PropertyValidator } from "@/lib/validators/property";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function PropertiesPage() {
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

  const form = useForm<PropertyValidator>({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      price_per_month: 1000,
      security_deposit: 500,
      application_fee: 100,
      is_pets_allowed: false,
      is_parking_included: true,
      photo_urls: [],
      beds: 1,
      baths: 1,
      square_feet: 1000,
      property_type: PropertyTypeEnum.Apartment,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-property"],
    mutationFn: async (values: PropertyValidator) => {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "photo_urls") {
          const files = value as File[];

          files.forEach((file: File) => {
            if (file !== null || file !== undefined) {
              formData.append("images", file);
            }
          });
        } else if (key === "property_type") {
          formData.append("property_type", String(value).toUpperCase());
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const result = await createProperty(formData);

      return result;
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error("Something went wrong! unable to create property.");

        return;
      }

      toast.success("New property created");

      form.reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (values: PropertyValidator) => {
    mutate(values);
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

  return (
    <div className="pt-8 pb-5 px-8">
      <Headings
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />

      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="name..."
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>

                      <FormControl>
                        <Textarea
                          placeholder="Write something..."
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo_urls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>

                      <FormControl>
                        <FilesUpload
                          values={field.value}
                          setValues={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div>
              <h2 className="text-lg font-semibold mb-4">Fees</h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Month</FormLabel>

                      <FormControl>
                        <Input type="number" disabled={isPending} {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="security_deposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="application_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Fee</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              <div>
                <h2 className="text-lg font-semibold mb-4">Property Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="beds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beds</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="baths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Baths</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="square_feet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Feet</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="is_pets_allowed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Is pets allowed</FormLabel>
                        </div>

                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_parking_included"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Is Parking allowed</FormLabel>
                        </div>

                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger disabled={isPending}>
                              <SelectValue placeholder="Select a property type" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {Object.keys(PropertyTypeEnum).map((type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                disabled={isPending}
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Additional Information
                </h2>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>

                        <FormControl>
                          <Input
                            type="text"
                            placeholder="address..."
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>

                          <FormControl>
                            <Input
                              type="text"
                              placeholder="city..."
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>

                          <FormControl>
                            <Input
                              type="text"
                              placeholder="state..."
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>

                          <FormControl>
                            <Input
                              type="text"
                              placeholder="123456..."
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>

                        <FormControl>
                          <Input
                            type="text"
                            placeholder="United Kingdom..."
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button
              className="bg-[#27272a] text-white text-sm w-full"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Property"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
