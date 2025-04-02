"use client";

import { toast } from "sonner";
import Image from "next/image";
import { Button } from "./ui/button";
import { UploadCloud, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  values: (File | string)[];
  setValues: (values: (File | string)[]) => void;
  disabled?: boolean;
};

const MAX_FILES = 6;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE_MB = 1;

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FilesUpload = ({ values, setValues, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;

      if (!fileList) return;

      const filesArray = Array.from(fileList);

      const currentFileCount = values.length;

      const availableSlots = MAX_FILES - currentFileCount;

      if (availableSlots <= 0) {
        toast.error(`You can only upload up to ${MAX_FILES} images.`);

        if (inputRef.current) inputRef.current.value = "";

        return;
      }

      const filesToAdd: File[] = [];

      filesArray.forEach((file) => {
        if (filesToAdd.length >= availableSlots) {
          toast.error(`You can only upload up to ${MAX_FILES} images.`);

          return;
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`Invalid type: ${file.name}.`);

          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(
            `${file.name} size >  ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
          );

          return;
        }

        filesToAdd.push(file);
      });

      if (filesToAdd.length > 0) {
        setValues([...values, ...filesToAdd]);
      }

      // Reset file input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [values, setValues]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const updatedFiles = values.filter((_, index) => index !== indexToRemove);

      setValues(updatedFiles);

      // If removing the last file, reset the input element value as well
      if (updatedFiles.length === 0 && inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [values, setValues]
  );

  const triggerInput = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  useEffect(() => {
    const newObjectUrls: string[] = [];

    values.forEach((fileOrUrl) => {
      if (fileOrUrl instanceof File) {
        newObjectUrls.push(URL.createObjectURL(fileOrUrl));
      } else if (typeof fileOrUrl === "string") {
        newObjectUrls.push(fileOrUrl);
      }
    });

    // Revoke previous URLs before setting new ones
    objectUrls.forEach(URL.revokeObjectURL);

    setObjectUrls(newObjectUrls);

    // Cleanup function to revoke URLs when component unmounts or values change
    return () => {
      newObjectUrls.forEach((url) => {
        // Only revoke URLs created by createObjectURL
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        onChange={handleFileChange}
        disabled={disabled || values.length >= MAX_FILES}
      />

      {values.length < MAX_FILES && !disabled && (
        <button
          type="button"
          onClick={triggerInput}
          disabled={disabled}
          className="relative h-40 w-full border-2 border-dashed border-muted-foreground/50 rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud className="size-8 mb-1" />

          <span>Upload Image</span>

          <span className="text-xs">
            ({values.length}/{MAX_FILES})
          </span>
        </button>
      )}

      {values.length > 0 && !disabled && (
        <Button
          type="button"
          className="w-fit mt-2"
          variant="outline"
          size="sm"
          onClick={() => {
            setValues([]);

            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
        >
          Clear All ({values.length})
        </Button>
      )}

      <div
        className={cn(
          "grid gap-3",
          values.length > 0 &&
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}
      >
        {objectUrls.map((url, index) => (
          <div key={index} className="relative aspect-square group">
            <Image
              className="object-cover rounded-md border border-muted/20"
              src={url}
              fill
              alt={`Preview ${index + 1}`}
            />

            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 size-5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesUpload;
