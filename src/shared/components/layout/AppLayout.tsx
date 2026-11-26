import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/shadcn/sidebar";
import { AppSidebar } from "../ui/navigation/AppSidebar";
import { Outlet } from "react-router-dom";

interface AppLayoutProps {
  /** Contenido fijo (ej. un skeleton); por defecto, la ruta hija. */
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <SidebarTrigger className="cursor-pointer" />
        <div className="pt-2 flex flex-col gap-6">
          {children ?? <Outlet />}
        </div>
      </main>
    </SidebarProvider>
  );
};
