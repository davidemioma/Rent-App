import { AxiosError } from "axios";
import axiosInstance from "../axios";

export const createProperty = async (values: FormData) => {
  try {
    const res = await axiosInstance.post("/properties", values);

    if (res.status !== 201) {
      return { error: "Something went wrong! unable to create property." };
    }

    return res.data;
  } catch (err) {
    console.log("createProperty Err:", err);

    if (err instanceof AxiosError) {
      return { error: `${err.response?.data}` };
    } else {
      return { error: "Something went wrong! unable to create property." };
    }
  }
};

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
    console.log("toggleFavorite Err:", err);

    if (err instanceof AxiosError) {
      return { error: `${err.response?.data}` };
    } else {
      return { error: "Something went wrong! unable to create user." };
    }
  }
};
