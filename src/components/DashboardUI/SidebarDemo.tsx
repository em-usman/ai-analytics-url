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
// import { FaGem } from "react-icons/fa";
// import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { Outlet, useLocation } from "react-router-dom";
// import box from "../../assets/AH_logo.webp";
import companyLogo from "../../assets/white-logo.png";
// import HomeFirst from "./Home/HomeFirst";
import HomeFirst from "./Home/HomeFirst";
// import { signOutUser, fetchUserName } from "../../services/authServices";
// do not use firebase client SDK here; read logged-in user from localStorage
import { signOutUser } from "../../services/authServices";
import { useGlobalData } from "../../store/useGlobalData";
import Spinner from "../ui/spinner";
import getInitials from "../ui/getInitials";

export function SidebarDemo() {
  const navigate = useNavigate();
  // Start with empty name and loading = true to avoid showing a dummy name
  const [name, setName] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [toast, setToast] = useState<null | {
    message: string;
    type: "success" | "error";
  }>(null);

  // Use global store as source of truth for profile (backend-provided)
  const userProfile = useGlobalData((s: any) => s.userProfile);
  const globalLoading = useGlobalData((s: any) => s.isLoading);

  useEffect(() => {
    setIsProfileLoading(globalLoading);
  }, [globalLoading]);

  useEffect(() => {
    if (userProfile && userProfile.name) {
      setName(userProfile.name);
      setIsProfileLoading(false);
    } else if (userProfile && !userProfile.name) {
      // server returned a user object without name — keep loading until listener updates
      setIsProfileLoading(true);
    }
  }, [userProfile]);

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
    try {
      setLogoutLoading(true);
      const result = await signOutUser();
      if (result.success) {
        setToast({ message: "Signed out successfully", type: "success" });
        // small delay so user sees toast before redirect
        setTimeout(() => navigate("/"), 400);
      } else {
        setToast({ message: result.message || "Logout failed", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Logout failed", type: "error" });
    } finally {
      setLogoutLoading(false);
      // auto-dismiss toast after 3s
      setTimeout(() => setToast(null), 3000);
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
              {links.map((link, idx) => {
                if (link.label === "Logout") {
                  const logoutIcon = logoutLoading ? (
                    <Spinner size="sm" className="text-[var(--text-primary)]" />
                  ) : (
                    link.icon
                  );

                  return (
                    <SidebarLink
                      key={idx}
                      link={{ ...link, icon: logoutIcon }}
                      onLogout={handleLogout}
                      disabled={logoutLoading}
                    />
                  );
                }

                return (
                  <SidebarLink key={idx} link={link} onLogout={undefined} />
                );
              })}
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
                  label: (
                    <span
                      className="max-w-[90px] truncate block"
                      title={name || "User"}
                    >
                      {name || "User"}
                    </span>
                  ),
                  href: "#",
                  icon: (
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--bg-secondary)] text-white text-lg font-medium">
                      {getInitials(name || "User")}
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
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div
            className={`px-4 py-2 rounded text-white shadow ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center py-4 px-4 w-full">
      {/* Responsive logo image */}
      <img
        src={companyLogo}
        alt="AI Strategy Compass"
        className="h-7 w-auto object-contain"
        loading="lazy"
      />
      {/* Optional: Keep the brand name if desired, or remove it completely */}
      {/* <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-lg md:text-lg ml-2 whitespace-pre text-[var(--text-primary)]"
      >
        AI Strategy Compass
      </motion.span> */}
    </div>
  );
};
// export const LogoIcon = () => {
//   return (
//     <a
//       href="#"
//       className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-[var(--text-primary)]"
//     >
//       <img
//         // src={}
//         className="h-7 w-7 shrink-0 rounded-full"
//         width={50}
//         height={50}
//         alt="Avatar"
//       />
//     </a>
//   );
// };

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
