import { Avatar } from "@/components/ui/avatar";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/authClient";

import icon from "@/tallyo.png?url";
import { useTheme } from "./theme-provider";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const context = useRouteContext({
    from: "__root__",
  });

  const { setTheme } = useTheme();

  return (
    <nav className="border-b">
      <div className="flex justify-between items-center px-4 lg:px-8 py-3">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={icon} alt="Tallyo logo" className="w-8 h-8" />
            <span className="font-bold text-xl">Tallyo</span>
          </Link>
        </div>
        <div className="lg:flex lg:items-center lg:space-x-6 hidden">
          {context.auth.isAuthenticated ? (
            <>
              <NavLinks />
              <UserDropdown />
            </>
          ) : (
            <Button type="button" asChild className="w-fit" size="lg">
              <Link to="/signin">Sign in</Link>
            </Button>
          )}
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-6 h-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-4">
              {context.auth.isAuthenticated ? (
                <>
                  <NavLinks asChild />
                  <UserDropdown />
                </>
              ) : (
                <SheetClose asChild>
                  <Button
                    type="button"
                    asChild
                    className="mx-auto w-fit"
                    size="lg"
                  >
                    <Link to="/signin">Sign in</Link>
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

function NavLinks({ asChild }: { asChild?: boolean }) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/categories", label: "Categories" },
    { href: "/transactions", label: "Transactions" },
  ];

  const linkElements = links.map((link) => (
    <Link
      key={link.href}
      to={link.href}
      className="font-medium text-foreground text-sm hover:text-gray-400"
    >
      {link.label}
    </Link>
  ));

  if (asChild) {
    return linkElements.map((x) => (
      <SheetClose key={x.key} asChild>
        {x}
      </SheetClose>
    ));
  }

  return linkElements;
}

function UserDropdown() {
  const context = useRouteContext({
    from: "__root__",
  });

  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-1">
          <Avatar className="w-5 h-5">
            <img
              src={context!.auth!.user!.image}
              alt={context!.auth!.user!.name.substring(0, 1).toUpperCase()}
            />
          </Avatar>
          <span className="font-medium text-sm">
            {context!.auth!.user!.name || ""}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => {
            if (theme === "dark") {
              setTheme("light");
            } else if (theme === "light") {
              setTheme("dark");
            }
          }}
        >
          <span>Switch to {theme === "light" ? "dark" : "light"} mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut().then(() => {
              window.location.reload();
              window.location.href = "/";
            });
          }}
        >
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
