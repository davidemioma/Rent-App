import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const LoadingPage = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "w-screen h-screen flex items-center justify-center",
        className
      )}
    >
      <Loader className="w-20 h-20 animate-spin" />
    </div>
  );
};

export default LoadingPage;
