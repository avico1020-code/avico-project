"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, User, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SignInModal from "@/components/SignInModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Navigation Links - Right Side (RTL) */}
          <div className="flex gap-8 items-center">
            <Link
              href="/"
              className="text-2xl hover:scale-110 transition-transform"
              aria-label="דף הבית"
            >
              <Home className="w-6 h-6 text-foreground" />
            </Link>
            <Link
              href="/page1"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-2"
            >
              עמוד 1
            </Link>
            <Link
              href="/page2"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-2"
            >
              עמוד 2
            </Link>
            <Link
              href="/page3"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-2"
            >
              עמוד 3
            </Link>
          </div>

          {/* User Profile or Sign In - Left Side (RTL) */}
          <div className="mr-auto">
            {isSignedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 hover:bg-accent rounded-lg px-3 py-2 h-auto"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    שלום, {user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0]}
                  </span>
                </Button>

                {isOpen && (
                  <Card className="absolute left-0 mt-2 w-72 shadow-lg border-border z-50">
                    <CardContent className="p-0">
                      <div className="px-4 py-4 border-b border-border bg-muted/50">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.emailAddresses[0]?.emailAddress}
                        </p>
                      </div>

                      <div className="p-2">
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start px-3 py-2 text-right hover:bg-destructive/10 text-destructive rounded-md"
                        >
                          <LogOut className="w-4 h-4 ml-2" />
                          <span className="text-sm font-medium">התנתק</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowSignInModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-all"
              >
                התחברות
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
    </nav>
  );
}
