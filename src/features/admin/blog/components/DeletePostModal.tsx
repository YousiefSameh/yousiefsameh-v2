"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { Trash2 } from "lucide-react";

interface DeletePostModalProps {
  onConfirm: () => void;
}

export function DeletePostModal({ onConfirm }: DeletePostModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon-lg" className="cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            post and remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel variant={"default"} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={onConfirm}
            className="hover:text-white hover:bg-destructive/95 cursor-pointer"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}