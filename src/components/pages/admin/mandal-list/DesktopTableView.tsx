"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DesktopTableViewProps {
  mandals: Mandal[]
  onView: (mandal: Mandal) => void
  onEdit: (mandal: Mandal) => void
  onDelete: (mandal: Mandal) => void
}

export interface Mandal {
  id: string
  nameEn: string
  nameGu: string
  adminUsername: string
  establishedDate: string
  status: "Active" | "Inactive"
  totalMembers: number
  createdAt: string
}

interface StatusBadgeProps {
  status: "Active" | "Inactive"
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge
    variant={status === "Active" ? "default" : "secondary"}
    className={status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
  >
    {status}
  </Badge>
)



export const DesktopTableView = ({ mandals, onView, onEdit, onDelete }: DesktopTableViewProps) => (
  <>
 

    {/* Tablet and Desktop view - hidden on small screens */}
    <div className="hidden lg:block">
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">All Mandals ({mandals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mandals.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50 hover:bg-red-50 border-b-2 border-red-200">
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 w-12">
                      Sr. No.
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[200px]">
                      Mandal Name (English)
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[150px]">
                      મંડળ નામ (ગુજરાતી)
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[140px]">
                      Username
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[130px] text-center">
                      Date
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[100px] text-center">
                      Members
                    </TableHead>
                    <TableHead className="font-bold text-red-900 text-xs uppercase tracking-wide py-4 px-6 min-w-[120px] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mandals.map((mandal, index) => (
                    <TableRow
                      key={mandal.id}
                      className="border-b border-border hover:bg-gray-50 transition-colors duration-150"
                    >
                      <TableCell className="py-4 px-6 text-sm font-semibold text-foreground">{index + 1}</TableCell>
                      <TableCell className="py-4 px-6 text-sm font-medium text-foreground">{mandal.nameEn}</TableCell>
                      <TableCell className="py-4 px-6 text-sm text-foreground">{mandal.nameGu}</TableCell>
                      <TableCell className="py-4 px-6 text-sm text-muted-foreground">{mandal.adminUsername}</TableCell>
                      <TableCell className="py-4 px-6 text-sm text-muted-foreground text-center">
                        {new Intl.DateTimeFormat("en-GB").format(new Date(mandal.establishedDate))}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <StatusBadge status={mandal.status} />
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm font-semibold text-foreground text-center">
                        {mandal.totalMembers}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(mandal)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                            title="View mandal"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(mandal)}
                            className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-700"
                            title="Edit mandal"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(mandal)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                            title="Delete mandal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">No mandals found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </>
)
