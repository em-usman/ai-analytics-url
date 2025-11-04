"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
// import { FaGem } from "react-icons/fa";
import companyLogo from "../../assets/white-logo.png";

interface Links {
  label: string | React.ReactNode;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full hidden  md:flex md:flex-col bg-neutral-100 w-[300px] shrink-0 border-r border-[var(--border-color)]",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "250px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-[var(--bg-primary)] w-full"
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full z-20 gap-2">
          {/* Left side: Heading */}
          <div className="flex items-center justify-between w-full z-20">
            {/* Left side: Responsive logo */}
            <div className="flex items-center">
              <img
                src={companyLogo}
                alt="AI Strategy Compass"
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
          {/* Right side: Hamburger menu */}
          <IconMenu2
            className="text-[var(--text-primary)] cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-[var(--bg-primary)] z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-8 top-6 z-50 text-[var(--text-primary)] cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onLogout,
  disabled,
  ...props
}: {
  link: Links;
  className?: string;
  onLogout?: () => Promise<void>;
  disabled?: boolean;
}) => {
  const { open, animate, setOpen } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === link.href;

  const handleClick = async (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (link.label === "Logout" && onLogout) {
      e.preventDefault();
      await onLogout();
      return;
    }
  };

  // If it's a logout link, render as button
  if (link.label === "Logout") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md w-full text-left",
          "hover:bg-[var(--accent-hover)]",
          className
        )}
        {...props}
      >
        {link.icon}

        <motion.span
          animate={{
            display: animate
              ? open
                ? "inline-block"
                : "none"
              : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-[var(--text-primary)]  text-x1 group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
        >
          {link.label}
        </motion.span>
      </button>
    );
  }

  // Regular link for other items
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center gap-2 group/sidebar py-2 px-2 rounded-md",
        // ✅ No hover for profile (#)
        link.href === "#"
          ? "cursor-default" // No hover or click visual
          : isActive
          ? "bg-[var(--accent-active)]"
          : "hover:bg-[var(--accent-hover)]",
        className
      )}
      onClick={() => link.href !== "#" && setOpen(false)} // Prevent closing if #
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-[var(--text-primary)] text-x1 group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
