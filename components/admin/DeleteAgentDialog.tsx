"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { userApi } from "@/lib/api/users";
import Swal from "sweetalert2";

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface DeleteAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onSuccess: () => void;
}

export default function DeleteAgentDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: DeleteAgentDialogProps) {
  useEffect(() => {
    if (open && agent) {
      Swal.fire({
        title: "Delete Agent",
        text: `Are you sure you want to delete ${agent.name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await userApi.deleteUser(agent._id);
            return true;
          } catch (error: any) {
            Swal.showValidationMessage(
              error.response?.data?.message || "Failed to delete agent"
            );
            return false;
          }
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          toast.success("Agent deleted successfully");
          onSuccess();
        }
        onOpenChange(false);
      });
    }
  }, [open, agent, onOpenChange, onSuccess]);

  return null;
}
