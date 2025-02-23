import { configureStore, Store } from "@reduxjs/toolkit";
import { sampleApi } from "@/state/api/sampleApi";
/**
 * store to be used in the frontend using react redux
 * @author Sriram Sundar
 *
 * @type {Store}
 */
export const store: Store = configureStore({
  reducer: {
    [sampleApi.reducerPath]: sampleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sampleApi.middleware),
});
