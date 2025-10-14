"use client"

import { useState } from "react"
import { DashboardHeader } from "../../components/dashboard-header"
import { DashboardSidebar } from "../../components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="bg-white">
      <DashboardHeader onMobileMenuToggle={toggleMobileSidebar} />
      <div className="md:flex">
        <DashboardSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}