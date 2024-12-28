import test from "node:test";
import { apiSlice } from "./http";

export const machines = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMachines: build.query({
      query: () => "/machines",
      providesTags: ["Machine"],
    }),
    createMachine: build.mutation({
      query: (body) => ({
        url: "/machines",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Machine"],
    }),
    deleteMachine: build.mutation({
      query: (id) => ({
        url: `/machines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Machine"],
    }),
    testMachine: build.mutation({
      query: (id) => ({
        url: `/machines/connect/${id}`,
        method: "POST",
      }),
    }),
    configureVersion: build.mutation({
      query: ({ id, branch }) => ({
        url: `/machines/${id}/config?branch_name=${branch}`,
        method: "POST",
      }),
      invalidatesTags: ["Machine"],
    }),
    machineHealth: build.mutation({
      query: () => ({
        url: `/machines/health`,
        method: "POST",
      }),
      invalidatesTags: ["Machine"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateMachineMutation,
  useGetMachinesQuery,
  useDeleteMachineMutation,
  useTestMachineMutation,
  useConfigureVersionMutation,
  useMachineHealthMutation,
} = machines;
