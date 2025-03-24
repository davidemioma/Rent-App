import { cache } from "react";
import axiosInstance from "../axios";
import { isAxiosError } from "axios";
import { Manager, Tenant } from "@/types";
import { createDbUser } from "../actions/auth";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const getAuthUser = cache(async () => {
  const session = await fetchAuthSession();

  if (!session) return null;

  const { idToken } = session.tokens ?? {};

  if (!idToken) return null;

  const user = await getCurrentUser();

  if (!user) return null;

  // Get the user role
  const role = idToken?.payload["custom:role"] as string;

  // Fetch user details from the database
  const endpoint =
    role === "manager" ? `/managers/${user.userId}` : `/tenants/${user.userId}`;

  try {
    const res = await axiosInstance.get(endpoint);

    // Create a new user if user does not exist
    if (res.status === 404) {
      const newUser = await createDbUser({
        values: {
          name: user.username,
          email: (idToken?.payload?.email as string) || "",
          phonenumber: "",
        },
        userRole: role,
      });

      if ("error" in newUser) {
        return { error: newUser.error };
      }

      return {
        data: {
          cognitoInfo: { ...user },
          userInfo: newUser as Tenant | Manager,
          role,
        },
      };
    }

    return {
      data: {
        cognitoInfo: { ...user },
        userInfo: res.data as Tenant | Manager,
        role,
      },
    };
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        const newUser = await createDbUser({
          values: {
            name: user.username,
            email: (idToken?.payload?.email as string) || "",
            phonenumber: "",
          },
          userRole: role,
        });

        if ("error" in newUser) {
          return { error: newUser.error };
        }

        return {
          data: {
            cognitoInfo: { ...user },
            userInfo: newUser as Tenant | Manager,
            role,
          },
        };
      }
    }

    console.log("getAuthUser Err:", err);

    return null;
  }
});
