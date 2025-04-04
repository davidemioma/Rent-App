"use client";

import React from "react";
import { toast } from "sonner";
import { Tenant } from "@/types";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createApplication } from "@/lib/actions/application";
import {
  ApplicationSchema,
  ApplicationValidator,
} from "@/lib/validators/application";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  propertyId: string;
  authUser: Tenant | undefined;
  userRole: string;
};

const ApplicationModal = ({
  isOpen,
  onOpenChange,
  propertyId,
  authUser,
  userRole,
}: Props) => {
  const form = useForm<ApplicationValidator>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-application"],
    mutationFn: async (values: ApplicationValidator) => {
      const res = await createApplication({ propertyId, values });

      return res;
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);

        return;
      }

      toast.success("Appliction Created!");

      onOpenChange();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (values: ApplicationValidator) => {
    if (!authUser || userRole !== "tenant") {
      toast.error("You must be logged in as a tenant to submit an application");

      return;
    }

    mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader className="mb-4">
          <DialogTitle>Submit Application for this Property</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="name..."
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
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>

                  <FormControl>
                    <Input
                      type="text"
                      disabled={isPending}
                      placeholder="+44 1234567789"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional information"
                      rows={5}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-[#27272a] text-white w-full"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
