import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Manager, Tenant } from "@/types";
import { buttonVariants } from "./ui/button";
import { NAVBAR_HEIGHT } from "@/lib/constants";

type Props = {
  authUser: Tenant | Manager | undefined;
};

const Navbar = ({ authUser }: Props) => {
  return (
    <nav
      className="fixed top-0 z-50 w-full bg-[#27272a] text-white flex items-center justify-between px-4 md:px-8"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div>
        <Link href="/" scroll={false}>
          <div className="flex items-center gap-3">
            <Image
              className="object-contain"
              src="/logo.svg"
              width={24}
              height={24}
              alt="Logo"
            />

            <div className="text-xl font-bold">
              Rent<span className="text-red-400 font-light">Ify</span>
            </div>
          </div>
        </Link>
      </div>

      {authUser ? (
        <div>Profile</div>
      ) : (
        <div className="flex items-center gap-5">
          <Link
            href="/signin"
            className={cn(
              buttonVariants({
                variant: "outline",
                className: "text-black hover:opacity-75 transition-opacity",
              })
            )}
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className={cn(
              buttonVariants({
                className:
                  "bg-red-500 text-white hover:bg-red-600 hover:opacity-75 transition-opacity",
              })
            )}
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
