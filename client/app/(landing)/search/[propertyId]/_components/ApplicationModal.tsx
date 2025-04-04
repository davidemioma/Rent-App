"use client";

import React from "react";
import { Tenant } from "@/types";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  propertyId: string;
  authUser: Tenant | undefined;
  userRole: string;
};

const ApplicationModal = ({}: Props) => {
  return <div></div>;
};

export default ApplicationModal;
