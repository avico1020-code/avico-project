"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SignInModal from "@/components/SignInModal";
import { Button } from "@/components/ui/button";

const buttonClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

export default function ProfileButton() {
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
    <>
      <div className="fixed top-4 end-4 z-50" ref={dropdownRef}>
        {isSignedIn && user ? (
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className={buttonClass}
              aria-label="תפריט פרופיל"
            >
              <User className="w-5 h-5" aria-hidden />
              <span>
                {user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0]}
              </span>
            </Button>
            {isOpen && (
              <div className="absolute top-full mt-2 end-0 min-w-[12rem] rounded-2xl border-2 border-black bg-[#FFFDF7] shadow-lg p-2">
                <div className="px-3 py-2 border-b border-black/20 mb-2">
                  <p className="text-sm font-semibold text-black">
                    {user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0]}
                  </p>
                  <p className="text-xs text-black/70 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className={`w-full justify-start ${buttonClass} rounded-xl border-red-600 text-red-700 hover:bg-red-50`}
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                  <span className="text-sm font-medium">התנתק</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => setShowSignInModal(true)}
            className={buttonClass}
            aria-label="התחברות"
          >
            התחברות
          </Button>
        )}
      </div>
      <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
    </>
  );
}
