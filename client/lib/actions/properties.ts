import { AxiosError } from "axios";
import axiosInstance from "../axios";

export const toggleFavorite = async ({
  cognitoId,
  propertyId,
}: {
  cognitoId: string;
  propertyId: string;
}) => {
  try {
    const res = await axiosInstance.patch(
      `/${cognitoId}/favorites/${propertyId}`
    );

    return { message: res.data };
  } catch (err) {
    console.log("createDbUser Err:", err);

    if (err instanceof AxiosError) {
      return { error: `${err.response?.data}` };
    } else {
      return { error: "Something went wrong! unable to create user." };
    }
  }
};
