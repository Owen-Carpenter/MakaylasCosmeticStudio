"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, LogIn, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = React.useState<{ name: string | null }>({ name: null });
  
  const isAuthenticated = status === "authenticated";
  const userName = userProfile.name || session?.user?.email?.split("@")[0] || "User";

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user profile data when authenticated
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/profile");
          
          if (response.status === 404) {
            // User profile doesn't exist yet (e.g., OAuth user without profile)
            console.log("User profile not found - using session data");
            return;
          }
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.success && data.user) {
            setUserProfile({
              name: data.user.name
            });
            console.log("User profile loaded successfully");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Don't throw the error, just use session data as fallback
        }
      }
    };

    fetchUserProfile();
  }, [status]);

  // Updated navItems to only include Home and Services for everyone
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
  ];
  
  // Add Dashboard only for authenticated users
  const authenticatedItems = isAuthenticated 
    ? [...navItems, { name: "Dashboard", href: "/dashboard" }]
    : navItems;

  return (
    <header
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="content-container flex justify-between items-center h-20">
        <Link href="/" className="z-50 flex items-center h-full py-2">
          <Image 
            src="/images/mcstudioLogo.png" 
            alt="Makaylas Cosmetic Studio" 
            width={150}
            height={64}
            className={cn(
              "h-full w-auto transition-all duration-300 drop-shadow-lg max-h-16",
              isScrolled 
                ? "brightness-100 invert-0 filter-none" 
                : "brightness-0 invert drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
            )}
          />
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "md:hidden z-50 flex flex-col gap-1.5",
            isScrolled ? "text-primary" : "text-white"
          )}
          aria-label="Toggle menu"
        >
          <span 
            className={cn(
              "w-6 h-0.5 rounded-full transition-all duration-300 block",
              mobileMenuOpen ? "rotate-45 translate-y-2" : "",
              isScrolled ? "bg-primary" : "bg-white"
            )} 
          />
          <span 
            className={cn(
              "w-6 h-0.5 rounded-full transition-all duration-300 block",
              mobileMenuOpen ? "opacity-0" : "opacity-100",
              isScrolled ? "bg-primary" : "bg-white"
            )} 
          />
          <span 
            className={cn(
              "w-6 h-0.5 rounded-full transition-all duration-300 block",
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : "",
              isScrolled ? "bg-primary" : "bg-white"
            )} 
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {authenticatedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href 
                  ? isScrolled ? "text-primary" : "text-white font-bold"
                  : isScrolled ? "text-slate-700" : "text-white/90",
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={cn(
                      "border-0",
                      isScrolled 
                        ? "bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
                        : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                    )}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {userName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-slate-500">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button 
                    size="sm"
                    className={cn(
                      "border-0",
                      isScrolled 
                        ? "bg-white hover:bg-white/90 text-primary ring-1 ring-primary/20"
                        : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                    )}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    size="sm"
                    className={cn(
                      "border-0",
                      isScrolled 
                        ? "bg-primary hover:bg-primary/90 text-white transition-colors duration-200" 
                        : "bg-white text-primary hover:bg-white/90"
                    )}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "fixed inset-0 top-0 left-0 right-0 bottom-0 bg-primary text-white flex flex-col justify-center items-center transition-opacity duration-300 md:hidden overflow-y-auto z-40",
            mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          style={{ height: "100vh" }}
        >
          <div className="flex flex-col gap-6 text-center py-20">
            {authenticatedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-xl font-medium transition-all hover:scale-110",
                  pathname === item.href ? "text-white font-bold" : "text-white/80"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-6">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="secondary" 
                      className="w-48 bg-white text-primary hover:bg-white/90 font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span>{userName}</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="secondary" 
                    className="w-48 bg-white text-primary hover:bg-white/90"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="secondary" 
                      className="w-48 bg-white text-primary hover:bg-white/90 font-medium"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="secondary" 
                      className="w-48 bg-white text-primary hover:bg-white/90"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 