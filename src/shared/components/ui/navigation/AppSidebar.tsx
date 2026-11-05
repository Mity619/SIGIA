import { useAuth } from "@/features/auth/hooks/useAuth";
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
import { Link } from "react-router-dom";
import { Button } from "../../shadcn/button";
import { ProfilePhoto } from "../user/ProfilePhoto";

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
];

export function AppSidebar() {
  //* Context
  const { user, logout } = useAuth();

  return (
    <Sidebar className="bg-white border-r border-gray-200 shadow-sm">
      <SidebarHeader className="flex-row items-center gap-2 bg-white border-b border-gray-100 px-4 py-4">
        <i
          className="ri-money-dollar-circle-fill text-5xl text-[#6B2D8F]"
          aria-hidden="true"
        />
        <a className="text-5xl font-bold text-[#6B2D8F]">SIGIA</a>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-gray-100 rounded-md px-4 py-4 transition text-[#200020]"
                  >
                    <Link to={item.url}>
                      <i className={item.icon} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white border-t border-gray-100">
        <div className="w-full flex items-center justify-between px-2 py-2 gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <ProfilePhoto />
            <span className="text-sm font-medium truncate">
              {user?.username?.split(" ").slice(0, 2).join(" ") ?? "User"}
            </span>
          </div>

          <Button
            onClick={logout}
            className="size-10 rounded-full transition"
            variant="destructive"
          >
            <i className="ri-logout-box-r-line text-lg"></i>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
