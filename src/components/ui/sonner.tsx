"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          opacity: 1,
        },
        classNames: {
          error: 'bg-destructive text-destructive-foreground border-destructive',
          success: 'bg-primary text-primary-foreground border-primary',
          warning: 'bg-yellow-500 text-white border-yellow-600',
          info: 'bg-blue-500 text-white border-blue-600',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
