"use client";

import { apiClient } from "@/helpers/api/axios";
import { CreateSubject } from "@/types/schema/create-subject";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubjectCreate = () => {
  return useMutation({
    mutationFn: async (data: CreateSubject) => {
      const response = await apiClient.post("/subject/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Subject created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subject");
    },
  });
};
