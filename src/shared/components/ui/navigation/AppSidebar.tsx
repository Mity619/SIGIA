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

const userCardClass = "flex items-center gap-3 rounded-2xl bg-muted/50 p-2.5";

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
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="bg-card px-5 pt-6 pb-4 ">
        <Link to="/" aria-label="Ir al inicio">
          <Logo size="md" onlyLogo={false} />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-card px-3">
        <SidebarGroup>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                          ? "bg-primary/12 font-semibold text-primary hover:bg-primary/12 hover:text-primary"
                          : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Link to={item.url}>
                        <i
                          className={`${item.icon} text-lg ${
                            isActive ? "text-primary" : "text-foreground/50"
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

      <SidebarFooter className="bg-card p-3">
        {loading ? (
          <div className={userCardClass} aria-busy="true">
            <Skeleton className={`${PROFILE_PHOTO_SIZE_CLASS} shrink-0 rounded-full`} />
            <SkeletonText className="min-w-0 flex-1 text-sm" barClassName="w-24" />
            <Skeleton className="size-9 shrink-0 rounded-xl" />
          </div>
        ) : (
          <div className={userCardClass}>
            <ProfilePhoto />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {user?.username?.split(" ").slice(0, 2).join(" ") ?? "Usuario"}
            </span>
            <Button
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="size-9 shrink-0 rounded-xl bg-primary/12 text-primary shadow-none transition-colors hover:bg-orquidea-70 hover:text-primary-foreground"
            >
              <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
