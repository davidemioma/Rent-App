import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signOut } from "aws-amplify/auth";
import { SidebarTrigger } from "./ui/sidebar";
import { getAuthUser } from "@/lib/data/auth";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const router = useRouter();

  const pathname = usePathname();

  const { data: authUser } = useQuery({
    queryKey: ["get-auth-user"],
    queryFn: async () => {
      const data = await getAuthUser();

      return data;
    },
  });

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const handleSignOut = async () => {
    await signOut();

    window.location.href = "/signin";
  };

  return (
    <nav
      className="fixed top-0 z-50 w-full bg-[#27272a] text-white flex items-center justify-between px-4 md:px-8"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex items-center gap-4 md:gap-6">
        {isDashboardPage && (
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
        )}

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

        {authUser && isDashboardPage && (
          <Button
            className="md:ml-4 bg-[#fcfcfc] text-[#27272a] hover:bg-[#eb8686] hover:text-[#fcfcfc]"
            variant="secondary"
            onClick={() =>
              router.push(
                authUser.data?.role.toLowerCase() === "manager"
                  ? "/managers/newproperty"
                  : "/search"
              )
            }
          >
            {authUser.data?.role.toLowerCase() === "manager" ? (
              <>
                <Plus className="h-4 w-4" />
                <span className="hidden md:block ml-2">Add New Property</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden md:block ml-2">Search Properties</span>
              </>
            )}
          </Button>
        )}
      </div>

      {authUser ? (
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <MessageCircle className="w-6 h-6 cursor-pointer text-[#e0e0e2] hover:text-[#a8a8af]" />

            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          <div className="relative hidden md:block">
            <Bell className="w-6 h-6 cursor-pointer text-[#e0e0e2] hover:text-[#a8a8af]" />

            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
              <Avatar>
                <AvatarImage src={""} />

                <AvatarFallback className="bg-[#57575f] font-semibold">
                  {authUser.data?.role?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <p className="text-primary-200 hidden md:block">
                {authUser.data?.userInfo.name}
              </p>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-white text-primary-700">
              <DropdownMenuItem
                className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 font-bold"
                onClick={() =>
                  router.push(
                    authUser.data?.role?.toLowerCase() === "manager"
                      ? "/managers/properties"
                      : "/tenants/favorites",
                    { scroll: false }
                  )
                }
              >
                Go to Dashboard
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-primary-200" />

              <DropdownMenuItem
                className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                onClick={() =>
                  router.push(
                    `/${authUser.data?.role?.toLowerCase()}s/settings`,
                    {
                      scroll: false,
                    }
                  )
                }
              >
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                onClick={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
