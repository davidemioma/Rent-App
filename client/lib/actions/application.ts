import { AxiosError } from "axios";
import axiosInstance from "../axios";
import { ApplicationValidator } from "../validators/application";

export const createApplication = async ({
  propertyId,
  values,
}: {
  values: ApplicationValidator;
  propertyId: string;
}) => {
  try {
    const res = await axiosInstance.post("/applications", {
      propertyId,
      ...values,
    });

    if (res.status !== 201) {
      return { error: "Something went wrong! unable to create application." };
    }

    return res.data;
  } catch (err) {
    console.log("createApplication Err:", err);

    if (err instanceof AxiosError) {
      return { error: `${err.response?.data}` };
    } else {
      return { error: "Something went wrong! unable to create application." };
    }
  }
};
