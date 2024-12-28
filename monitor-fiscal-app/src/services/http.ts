/* eslint-disable react-hooks/rules-of-hooks */
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

import { Tags } from "lucide-react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000",

  prepareHeaders: async (headers: any) => {
    // const token = localStorage.getItem("@azure:token");
    // const user = localStorage.getItem("@azure:user");

    // if (token && user) {
    //   headers.set("x-forwarded-for", ip);
    //   headers.set("Authorization", `Bearer ${token}`);
    // }

    return headers;
  },
});

export const baseQueryWithRetry = retry(baseQuery, { maxRetries: 3 });

export const apiSlice = createApi({
  reducerPath: "api",
  tagTypes: Object.values(Tags),
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
});
