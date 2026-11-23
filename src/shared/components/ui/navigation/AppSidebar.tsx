import { useAuth } from "@/features/auth/hooks/useAuth";
import { Logo } from "@/shared/components/brand/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/shadcn/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../shadcn/button";
import { Skeleton } from "../../shadcn/skeleton";
import { SkeletonText } from "../loading/SkeletonText";
import { PROFILE_PHOTO_SIZE_CLASS, ProfilePhoto } from "../user/ProfilePhoto";

const userCardClass = "flex items-center gap-3 rounded-2xl bg-gray-50 p-2.5";

type IItem = {
  title: string;
  url: string;
  icon: string;
};

// * Menu items
const items: IItem[] = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: "ri-cash-line",
  },
  {
    title: "Gastos",
    url: "/gastos",
    icon: "ri-shopping-bag-3-line",
  },
  {
    title: "Ingresos",
    url: "/ingresos",
    icon: "ri-money-dollar-circle-line",
  },
  {
    title: "Cuentas",
    url: "/cuentas",
    icon: "ri-wallet-3-line",
  },
  {
    title: "Ahorros",
    url: "/ahorro",
    icon: "ri-safe-2-line",
  },
  {
    title: "Etiquetas",
    url: "/etiquetas",
    icon: "ri-price-tag-3-fill",
  },
];

export function AppSidebar() {
  //* Context
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarHeader className="bg-white px-5 pt-6 pb-4 ">
        <Link to="/" aria-label="Ir al inicio">
          <Logo size="md" onlyLogo={false} />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white px-3">
        <SidebarGroup>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Menú
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 rounded-xl px-3 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-[#da00831f] font-semibold text-[#DA0081] hover:bg-[#da00831f] hover:text-[#DA0081]"
                          : "text-[#200020]/70 hover:bg-gray-50 hover:text-[#200020]"
                      }`}
                    >
                      <Link to={item.url}>
                        <i
                          className={`${item.icon} text-lg ${
                            isActive ? "text-[#DA0081]" : "text-[#200020]/50"
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white p-3">
        {loading ? (
          <div className={userCardClass} aria-busy="true">
            <Skeleton className={`${PROFILE_PHOTO_SIZE_CLASS} shrink-0 rounded-full`} />
            <SkeletonText className="min-w-0 flex-1 text-sm" barClassName="w-24" />
            <Skeleton className="size-9 shrink-0 rounded-xl" />
          </div>
        ) : (
          <div className={userCardClass}>
            <ProfilePhoto />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#200020]">
              {user?.username?.split(" ").slice(0, 2).join(" ") ?? "Usuario"}
            </span>
            <Button
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="size-9 shrink-0 rounded-xl bg-[#da00831f] text-[#DA0081] shadow-none transition-colors hover:bg-[#E366A7] hover:text-white"
            >
              <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
