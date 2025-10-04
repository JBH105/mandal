"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsBarChart } from "react-icons/bs";

interface MenuItem {
  title: string
  icon: React.ReactNode
  href: string
  roles: string[]
}

const menuItems: MenuItem[] = [
  // admin menu
  {
    title: "Dashboard",
    icon: <MdOutlineDashboardCustomize />,
    href: "/admin/dashboard",
    roles: ["admin"],
  },
  {
    title: "Create Mandal",
    icon: <HiOutlineUserGroup />,
    href: "/admin/create-mandal",
    roles: ["admin"],
  },
  //   {
  //   title: "Mandal List",
  //   icon: (
  //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={2}
  //         d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
  //       />
  //     </svg>
  //   ),
  //   href: "/admin/mandal-list",
  //   roles: ["admin"],
  // },
  //  mandal menu
  // {
  //   title: "Dashboard",
  //   icon: (
  //     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={2}
  //         d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
  //       />
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  //     </svg>
  //   ),
  //   href: "/mandal/dashboard",
  //   roles: ["mandal"],
  // },
  {
    title: "Monthly Ledger",
    icon:<BsBarChart />,
    href: "/mandal/analytics",
    roles: ["mandal"],
  },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("token");
      if (!token) {
        token = sessionStorage.getItem("token");
      }
      if (token) {
        try {
          const user = JSON.parse(atob(token.split(".")[1]));
          setRole(user.role);
        } catch (error) {
          console.error("Error parsing token:", error);
        }
      }
    }
  }, [])

  const filteredMenuItems = menuItems.filter(item => role && item.roles.includes(role))
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed md:sticky top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
          "md:translate-x-0", // Always visible on desktop
          isOpen ? "translate-x-0" : "-translate-x-full", // Toggle on mobile
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!collapsed && <h2 className="text-lg font-semibold text-sidebar-foreground">Menu</h2>}
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
              <svg
                className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10",
                      collapsed ? "px-2" : "px-3",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose()
                      }
                      router.push(item.href)
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="ml-3 text-sm font-medium">{item.title}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          {/* <div className="p-4 border-t border-sidebar-border">
            <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3")}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              {!collapsed && user && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div> */}
        </div>
      </aside>
    </>
  )
}