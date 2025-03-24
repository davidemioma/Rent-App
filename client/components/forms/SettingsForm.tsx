"use client";

import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDbUser } from "@/lib/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthSchema, AuthValidator } from "@/lib/validators/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  initialData?: {
    name: string;
    email: string;
    phonenumber: string;
  };
  role: "manager" | "tenant";
  cognitoId: string;
};

const SettingsForm = ({ initialData, role, cognitoId }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<AuthValidator>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phonenumber: initialData?.phonenumber || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-user"],
    mutationFn: async (values: AuthValidator) => {
      if (!initialData) return;

      const res = await updateDbUser({
        values,
        userRole: role,
        cognitoId,
      });

      return res;
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      }

      toast.success("User updated successfully!");

      queryClient.invalidateQueries({
        queryKey: ["get-auth-user"],
      });
    },
    onError: (err) => {
      console.log("Update user", err);

      toast.error("Something went wrong! " + err.message);
    },
  });

  const onSubmit = (values: AuthValidator) => {
    mutate(values);
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold capitalize">{role} settings</h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>

      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Name..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="test@mail.com"
                      {...field}
                      disabled
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phonenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>

                  <FormControl>
                    <Input
                      type="text"
                      placeholder="(+44) 123456789"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="text-white cursor-pointer bg-[#27272a] hover:bg-[#111113]"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingsForm;
