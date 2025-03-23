import axiosInstance from "../axios";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const getAuthUser = async () => {
  try {
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
      role === "manager" ? `/manager/${user.userId}` : `/tenant/${user.userId}`;

    await axiosInstance.get(endpoint);
  } catch (err) {
    console.log("getAuthUser Err:", err);

    return null;
  }
};
