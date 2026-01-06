import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  centered?: boolean; // if true, use mx-auto
  maxWidth?: string; // max-width when centered
  className?: string; // extra classes
  px?: string; // horizontal padding, default px-4
}

export function Wrapper({
  children,
  centered = true,
  maxWidth = "container",
  className,
  px = "px-4 md:px-2",
}: Readonly<WrapperProps>) {
  const baseClasses = centered
    ? `mx-auto w-full ${maxWidth} ${px}`
    : `w-full ${px}`;

  return <div className={cn(baseClasses, className)}>{children}</div>;
}
