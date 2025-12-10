import type React from "react"
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  subtitle?: string
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap gap-4 !w-full flex-col space-y-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 overflow-x-hidden">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground text-pretty sm:text-base">{description}</p>}
      </div>
      {children && <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">{children}</div>}
    </div>
  )
}

