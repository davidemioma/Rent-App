import { AxiosError } from "axios";
import axiosInstance from "../axios";
import { Manager, Tenant } from "@/types";
import { AuthSchema, AuthValidator } from "../validators/auth";

export const createDbUser = async ({
  values,
  userRole,
}: {
  values: AuthValidator;
  userRole: string;
}) => {
  try {
    const isValid = AuthSchema.safeParse(values);

    if (isValid.error) {
      return { error: "Invalid parameters" };
    }

    const endpoint =
      userRole.toLowerCase() === "manager" ? "/managers" : "/tenants";

    const res = await axiosInstance.post(endpoint, { ...values });

    if (res.status !== 201) {
      return { error: "Unable to create user." };
    }

    return res.data as Tenant | Manager;
  } catch (err) {
    console.log("createDbUser Err:", err);

    if (err instanceof AxiosError) {
      return { error: `${err.response?.data}` };
    } else {
      return { error: "Something went wrong! unable to create user." };
    }
  }
};
