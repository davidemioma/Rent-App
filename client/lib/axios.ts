import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await fetchAuthSession();

    if (!session) {
      return config;
    }

    const { idToken } = session.tokens ?? {};

    if (!idToken) {
      return config;
    }

    config.headers.Authorization = `Bearer ${idToken}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
