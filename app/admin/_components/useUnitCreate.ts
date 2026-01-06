"use client";

import { apiClient } from "@/helpers/api/axios";
import { CreateUnit } from "@/types/schema/create-unit";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUnitCreate = () => {
  return useMutation({
    mutationFn: async (data: CreateUnit) => {
      const response = await apiClient.post("/unit/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Unit created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create unit");
    },
  });
};
