import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type SectionSize = "xs" | "sm" | "md" | "lg";

interface SectionProps {
  children: ReactNode;
  size?: SectionSize;
  className?: string;
}

const sizeClasses: Record<SectionSize, string> = {
  xs: "py-4 md:py-6",
  sm: "py-6 md:py-8",
  md: "py-10 md:py-14",
  lg: "py-14 md:py-20",
};

export function Section({
  children,
  size = "md",
  className,
}: Readonly<SectionProps>) {
  return (
    <section className={cn(sizeClasses[size], className)}>{children}</section>
  );
}
