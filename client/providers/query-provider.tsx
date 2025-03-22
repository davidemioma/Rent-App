"use client";

import { ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./auth-provider";

interface Props {
  children: ReactNode;
}

const queryClient = new QueryClient();

const QueryProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Authenticator.Provider>
        <Auth>{children}</Auth>
      </Authenticator.Provider>
    </QueryClientProvider>
  );
};

export default QueryProvider;
