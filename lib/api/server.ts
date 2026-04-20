import axios from "axios";
import { cookies } from "next/headers";

export function createServerApi() {
  const cookieStore = cookies();

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Cookie: cookieStore.toString(), // forwards ALL cookies
    },
  });
}
