import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BACKEND_URL, SAMPLE_ROUTE } from "@/constants";

/**
 * sample api endpoint to be used with react redux
 * @author Sriram Sundar
 *
 */
export const sampleApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    credentials: "include",
  }),
  reducerPath: "main",
  tagTypes: [],
  endpoints: (build) => ({
    getSampleRoute: build.query({
      query: () => ({
        url: SAMPLE_ROUTE,
        method: "GET",
      }),
    }),
  }),
});

/**
 * hooks to use the sample api related endpoints
 * @author Sriram Sundar
 *
 */
export const { useGetSampleRouteQuery } = sampleApi;
