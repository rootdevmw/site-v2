import axios from "axios";
import { showError } from "@/lib/toast";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.errors?.message ||
      error?.message ||
      "Something went wrong";

    showError(message);

    return Promise.reject(error);
  },
);
