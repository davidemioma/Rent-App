import React from "react";
import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader className="w-20 h-20 animate-spin" />
    </div>
  );
};

export default LoadingPage;
