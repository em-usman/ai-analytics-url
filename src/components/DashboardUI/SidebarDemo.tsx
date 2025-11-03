"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
// import { Link } from "react-router-dom";
import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconUsers,
  IconTerminal2,
  IconTemplate,
  IconSettings,
} from "@tabler/icons-react";
import { FaGem } from "react-icons/fa";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { Outlet, useLocation } from "react-router-dom";
import box from "../../assets/AH_logo.webp";
// import HomeFirst from "./Home/HomeFirst";
import HomeFirst from "./Home/HomeFirst";
// import { signOutUser, fetchUserName } from "../../services/authServices";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { signOutUser, listenToUserProfile } from "../../services/authServices";
import getInitials from "../ui/getInitials";

export function SidebarDemo() {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsProfileLoading(true); // Start loading when user is found
        if (profileUnsubscribe) profileUnsubscribe();

        profileUnsubscribe = listenToUserProfile(user.uid, (profile) => {
          if (profile?.name) {
            setName(profile.name);
          } else {
            setName("User");
          }
          setIsProfileLoading(false); // ✅ Done loading
        });
      } else {
        setName("User");
        setIsProfileLoading(false); // Not loading if no user
      }
    });

    return () => {
      unsubscribe();
      profileUnsubscribe?.();
    };
  }, []);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconLayoutDashboard className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      ),
    },
    {
      label: "Customers",
      href: "/dashboard/customer",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      ),
    },
    {
      label: "Prompt Library",
      href: "/dashboard/prompt_library",
      icon: (
        <IconTerminal2 className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      ),
    },
    {
      label: "Templates",
      href: "/dashboard/templates",
      icon: (
        <IconTemplate className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      navigate("/");
    } else {
      alert(result.message);
    }
  };
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden border border-[var(--gray)] bg-[var(--bg-primary)] md:flex-row ",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="justify-between gap-10 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-x1">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {/* {open ? <Logo /> : <LogoIcon />} */}
            <Logo />
            <div className="mt-8 flex flex-col gap-2 mx-4 my-4">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  onLogout={link.label === "Logout" ? handleLogout : undefined}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-1 py-1 border-t border-[var(--border-color)]">
            {" "}
            {/* Use justify-between, adjust padding */}
            {/* User Profile Link */}
            {isProfileLoading ? (
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse"></div>
                <div className="h-4 w-16 bg-[var(--bg-secondary)] rounded animate-pulse"></div>
              </div>
            ) : (
              <SidebarLink
                link={{
                  label: name,
                  href: "#",
                  icon: (
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--bg-secondary)] text-white text-lg font-medium">
                      {getInitials(name)}
                    </div>
                  ),
                }}
              />
            )}
            <SidebarLink
              link={{
                label: "",
                href: "/dashboard/settings",
                icon: (
                  <IconSettings className="h-6 w-6 shrink-0 text-[var(--text-primary)]" />
                ),
              }}
              aria-label="Settings"
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-4 px-4 text-sm font-normal text-[var(--text-primary)] border-b border-[var(--border-color)] width-full"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
        {" "}
        {/* Blue rounded-square background */}
        <FaGem className="text-white w-5 h-5" /> {/* White diamond icon */}
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-lg md:text-lg whitespace-pre text-[var(--text-primary)]"
      >
        AI Strategy Compass
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-[var(--text-primary)]"
    >
      <img
        src={box}
        className="h-7 w-7 shrink-0 rounded-full"
        width={50}
        height={50}
        alt="Avatar"
      />
    </a>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  const location = useLocation();
  const isExactDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex flex-1 overflow-y-auto w-full h-full">
      <div className="flex h-full w-full overflow-y-auto ">
        {isExactDashboard ? (
          // Show dashboard content only when on exact /dashboard route
          <>
            <HomeFirst />
          </>
        ) : (
          // Render nested routes (like UserProfile)
          <Outlet />
        )}
      </div>
    </div>
  );
};
