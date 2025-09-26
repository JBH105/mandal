"use client"

import { useMemo, useState } from "react"
import { MANDAL_DATA } from "./mandalData"
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "./SummaryCards";
import { Filters, StatusFilter } from "./Filters"; // Import StatusFilter from Filters
import { DesktopTableView } from "./DesktopTableView";
import { MobileCardView } from "./MobileCardView";
import { ViewModal } from "./ViewModal";
import { EditModal } from "./EditModal";

export interface Mandal {
  id: number;
  nameEn: string;
  nameGu: string;
  adminUsername: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  totalMembers: number;
  createdAt: string;
}

export default function MandalListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMandal, setSelectedMandal] = useState<Mandal | null>(null)

  // Memoized filtered mandals
  const filteredMandals = useMemo(() => {
    return MANDAL_DATA.filter((mandal) => {
      const matchesSearch =
        mandal.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandal.nameGu.includes(searchTerm) ||
        mandal.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || mandal.status.toLowerCase() === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  // Memoized statistics
  const { totalMandals, activeMandals, inactiveMandals } = useMemo(() => {
    const totalMandals = MANDAL_DATA.length
    const activeMandals = MANDAL_DATA.filter((m) => m.status === "Active").length
    const inactiveMandals = MANDAL_DATA.filter((m) => m.status === "Inactive").length
    
    return { totalMandals, activeMandals, inactiveMandals }
  }, [])

  const handleView = (mandal: Mandal) => {
    setSelectedMandal(mandal)
    setViewDialogOpen(true)
  }

  const handleEdit = (mandal: Mandal) => {
    setSelectedMandal(mandal)
    setEditDialogOpen(true)
  }

  return (
    <>
      <PageHeader title="Mandal List" description="Manage and view all created mandals">
        <Button>Export List</Button>
      </PageHeader>

      <SummaryCards total={totalMandals} active={activeMandals} inactive={inactiveMandals} />

      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter} // This now matches the expected type
      />

      <DesktopTableView mandals={filteredMandals} onView={handleView} onEdit={handleEdit} />
      
      <MobileCardView mandals={filteredMandals} onView={handleView} onEdit={handleEdit} />

      <ViewModal
        mandal={selectedMandal}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={handleEdit}
      />

      <EditModal
        mandal={selectedMandal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}



// "use client"

// import { useState, useMemo } from "react"
// import { PageHeader } from "@/components/ui/page-header"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Eye, Edit, Calendar, Users, Building } from "lucide-react"

// // Types
// interface Mandal {
//   id: number
//   nameEn: string
//   nameGu: string
//   adminUsername: string
//   establishedDate: string
//   status: "Active" | "Inactive"
//   totalMembers: number
//   createdAt: string
// }

// // Sample mandal data
// const MANDAL_DATA: Mandal[] = [
//   {
//     id: 1,
//     nameEn: "Shri Khodiyar Mandal",
//     nameGu: "શ્રી ખોડિયાર મંડળ",
//     adminUsername: "khodiyar_admin",
//     establishedDate: "2024-01-15",
//     status: "Active",
//     totalMembers: 25,
//     createdAt: "2024-01-15T10:30:00Z",
//   },
//   {
//     id: 2,
//     nameEn: "Ganesh Mandal",
//     nameGu: "ગણેશ મંડળ",
//     adminUsername: "ganesh_admin",
//     establishedDate: "2024-02-20",
//     status: "Active",
//     totalMembers: 30,
//     createdAt: "2024-02-20T14:15:00Z",
//   },
//   {
//     id: 3,
//     nameEn: "Durga Mata Mandal",
//     nameGu: "દુર્ગા માતા મંડળ",
//     adminUsername: "durga_admin",
//     establishedDate: "2024-03-10",
//     status: "Inactive",
//     totalMembers: 18,
//     createdAt: "2024-03-10T09:45:00Z",
//   },
//   {
//     id: 4,
//     nameEn: "Hanuman Mandal",
//     nameGu: "હનુમાન મંડળ",
//     adminUsername: "hanuman_admin",
//     establishedDate: "2024-04-05",
//     status: "Active",
//     totalMembers: 22,
//     createdAt: "2024-04-05T16:20:00Z",
//   },
//   {
//     id: 5,
//     nameEn: "Saraswati Mandal",
//     nameGu: "સરસ્વતી મંડળ",
//     adminUsername: "saraswati_admin",
//     establishedDate: "2024-05-12",
//     status: "Active",
//     totalMembers: 35,
//     createdAt: "2024-05-12T11:30:00Z",
//   },
// ]

// // Summary Cards Component
// const SummaryCards = ({ total, active, inactive }: { total: number; active: number; inactive: number }) => (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">Total Mandals</CardTitle>
//         <Building className="h-4 w-4 text-muted-foreground" />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold text-blue-600">{total}</div>
//         <p className="text-xs text-muted-foreground">All registered mandals</p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">Active Mandals</CardTitle>
//         <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//           />
//         </svg>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold text-green-600">{active}</div>
//         <p className="text-xs text-muted-foreground">Currently active</p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">Inactive Mandals</CardTitle>
//         <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//           />
//         </svg>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold text-red-600">{inactive}</div>
//         <p className="text-xs text-muted-foreground">Currently inactive</p>
//       </CardContent>
//     </Card>
//   </div>
// )

// // Filters Component
// const Filters = ({
//   searchTerm,
//   onSearchChange,
//   statusFilter,
//   onStatusFilterChange,
// }: {
//   searchTerm: string
//   onSearchChange: (value: string) => void
//   statusFilter: string
//   onStatusFilterChange: (value: string) => void
// }) => (
//   <div className="flex flex-col sm:flex-row gap-4 mb-6">
//     <div className="flex-1">
//       <Input
//         placeholder="Search mandals by name or admin username..."
//         value={searchTerm}
//         onChange={(e) => onSearchChange(e.target.value)}
//         className="max-w-sm"
//       />
//     </div>
//     <Select value={statusFilter} onValueChange={onStatusFilterChange}>
//       <SelectTrigger className="w-[180px]">
//         <SelectValue placeholder="Filter by status" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">All Status</SelectItem>
//         <SelectItem value="active">Active</SelectItem>
//         <SelectItem value="inactive">Inactive</SelectItem>
//       </SelectContent>
//     </Select>
//   </div>
// )

// // Desktop Table View Component
// const DesktopTableView = ({ mandals, onView, onEdit }: { mandals: Mandal[]; onView: (mandal: Mandal) => void; onEdit: (mandal: Mandal) => void }) => (
//   <Card className="hidden md:block">
//     <CardHeader>
//       <CardTitle>All Mandals ({mandals.length})</CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-red-50">
//               <TableHead className="font-semibold text-red-800">Sr. No.</TableHead>
//               <TableHead className="font-semibold text-red-800">Mandal Name (English)</TableHead>
//               <TableHead className="font-semibold text-red-800">મંડળ નામ (ગુજરાતી)</TableHead>
//               <TableHead className="font-semibold text-red-800">Admin Username</TableHead>
//               <TableHead className="font-semibold text-red-800">Established Date</TableHead>
//               <TableHead className="font-semibold text-red-800">Status</TableHead>
//               <TableHead className="font-semibold text-red-800">Total Members</TableHead>
//               <TableHead className="font-semibold text-red-800">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {mandals.map((mandal, index) => (
//               <TableRow key={mandal.id} className="hover:bg-gray-50">
//                 <TableCell className="font-medium">{index + 1}</TableCell>
//                 <TableCell className="font-medium">{mandal.nameEn}</TableCell>
//                 <TableCell className="font-medium">{mandal.nameGu}</TableCell>
//                 <TableCell>{mandal.adminUsername}</TableCell>
//                 <TableCell>{new Date(mandal.establishedDate).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   <StatusBadge status={mandal.status} />
//                 </TableCell>
//                 <TableCell>{mandal.totalMembers}</TableCell>
//                 <TableCell>
//                   <div className="flex space-x-2">
//                     <Button variant="outline" size="sm" onClick={() => onView(mandal)}>
//                       <Eye className="h-4 w-4 mr-1" />
//                       View
//                     </Button>
//                     <Button variant="outline" size="sm" onClick={() => onEdit(mandal)}>
//                       <Edit className="h-4 w-4 mr-1" />
//                       Edit
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </CardContent>
//   </Card>
// )

// // Mobile Card View Component
// const MobileCardView = ({ mandals, onView, onEdit }: { mandals: Mandal[]; onView: (mandal: Mandal) => void; onEdit: (mandal: Mandal) => void }) => (
//   <div className="md:hidden space-y-4">
//     <div className="flex items-center justify-between">
//       <h3 className="text-lg font-semibold">All Mandals ({mandals.length})</h3>
//     </div>
//     {mandals.map((mandal, index) => (
//       <MandalCard key={mandal.id} mandal={mandal} index={index} onView={onView} onEdit={onEdit} />
//     ))}
//   </div>
// )

// // Mandal Card Component
// const MandalCard = ({
//   mandal,
//   index,
//   onView,
//   onEdit,
// }: {
//   mandal: Mandal
//   index: number
//   onView: (mandal: Mandal) => void
//   onEdit: (mandal: Mandal) => void
// }) => (
//   <Card className="border-l-4 border-l-red-500">
//     <CardContent className="p-4">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <Badge variant="outline" className="text-xs">
//               #{index + 1}
//             </Badge>
//             <StatusBadge status={mandal.status} />
//           </div>
//           <h4 className="font-semibold text-lg text-gray-900">{mandal.nameEn}</h4>
//           <p className="text-sm text-gray-600 font-medium">{mandal.nameGu}</p>
//         </div>
//       </div>

//       <div className="space-y-2 mb-4">
//         <div className="flex items-center gap-2 text-sm">
//           <Building className="h-4 w-4 text-gray-500" />
//           <span className="text-gray-600">Admin:</span>
//           <span className="font-medium">{mandal.adminUsername}</span>
//         </div>
//         <div className="flex items-center gap-2 text-sm">
//           <Calendar className="h-4 w-4 text-gray-500" />
//           <span className="text-gray-600">Established:</span>
//           <span className="font-medium">{new Date(mandal.establishedDate).toLocaleDateString()}</span>
//         </div>
//         <div className="flex items-center gap-2 text-sm">
//           <Users className="h-4 w-4 text-gray-500" />
//           <span className="text-gray-600">Members:</span>
//           <span className="font-medium">{mandal.totalMembers}</span>
//         </div>
//       </div>

//       <div className="flex gap-2 pt-2 border-t">
//         <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onView(mandal)}>
//           <Eye className="h-4 w-4 mr-1" />
//           View
//         </Button>
//         <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(mandal)}>
//           <Edit className="h-4 w-4 mr-1" />
//           Edit
//         </Button>
//       </div>
//     </CardContent>
//   </Card>
// )

// // Status Badge Component
// const StatusBadge = ({ status }: { status: "Active" | "Inactive" }) => (
//   <Badge
//     variant={status === "Active" ? "default" : "secondary"}
//     className={status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
//   >
//     {status}
//   </Badge>
// )

// // View Modal Component
// const ViewModal = ({
//   mandal,
//   open,
//   onOpenChange,
//   onEdit,
// }: {
//   mandal: Mandal | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onEdit: (mandal: Mandal) => void
// }) => (
//   <Dialog open={open} onOpenChange={onOpenChange}>
//     <DialogContent className="max-w-2xl">
//       <DialogHeader>
//         <DialogTitle>View Mandal Details</DialogTitle>
//       </DialogHeader>
//       {mandal && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">English Name</Label>
//               <p className="text-lg font-semibold">{mandal.nameEn}</p>
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">ગુજરાતી નામ</Label>
//               <p className="text-lg font-semibold">{mandal.nameGu}</p>
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">Admin Username</Label>
//               <p className="font-medium">{mandal.adminUsername}</p>
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">Status</Label>
//               <StatusBadge status={mandal.status} />
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">Established Date</Label>
//               <p className="font-medium">{new Date(mandal.establishedDate).toLocaleDateString()}</p>
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-gray-600">Total Members</Label>
//               <p className="font-medium">{mandal.totalMembers}</p>
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Close
//             </Button>
//             <Button
//               onClick={() => {
//                 onOpenChange(false)
//                 onEdit(mandal)
//               }}
//             >
//               Edit Mandal
//             </Button>
//           </div>
//         </div>
//       )}
//     </DialogContent>
//   </Dialog>
// )

// // Edit Modal Component
// const EditModal = ({
//   mandal,
//   open,
//   onOpenChange,
// }: {
//   mandal: Mandal | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }) => (
//   <Dialog open={open} onOpenChange={onOpenChange}>
//     <DialogContent className="max-w-2xl">
//       <DialogHeader>
//         <DialogTitle>Edit Mandal</DialogTitle>
//       </DialogHeader>
//       {mandal && (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="editNameEn">English Name</Label>
//               <Input id="editNameEn" defaultValue={mandal.nameEn} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="editNameGu">ગુજરાતી નામ</Label>
//               <Input id="editNameGu" defaultValue={mandal.nameGu} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="editUsername">Admin Username</Label>
//               <Input id="editUsername" defaultValue={mandal.adminUsername} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="editStatus">Status</Label>
//               <Select defaultValue={mandal.status.toLowerCase()}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="editDate">Established Date</Label>
//               <Input id="editDate" type="date" defaultValue={mandal.establishedDate} />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="editMembers">Total Members</Label>
//               <Input id="editMembers" type="number" defaultValue={mandal.totalMembers} />
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
//           </div>
//         </div>
//       )}
//     </DialogContent>
//   </Dialog>
// )

// // Main Component
// export default function MandalListPage() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [viewDialogOpen, setViewDialogOpen] = useState(false)
//   const [editDialogOpen, setEditDialogOpen] = useState(false)
//   const [selectedMandal, setSelectedMandal] = useState<Mandal | null>(null)

//   // Memoized filtered mandals
//   const filteredMandals = useMemo(() => {
//     return MANDAL_DATA.filter((mandal) => {
//       const matchesSearch =
//         mandal.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         mandal.nameGu.includes(searchTerm) ||
//         mandal.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
//       const matchesStatus = statusFilter === "all" || mandal.status.toLowerCase() === statusFilter
//       return matchesSearch && matchesStatus
//     })
//   }, [searchTerm, statusFilter])

//   // Memoized statistics
//   const { totalMandals, activeMandals, inactiveMandals } = useMemo(() => {
//     const totalMandals = MANDAL_DATA.length
//     const activeMandals = MANDAL_DATA.filter((m) => m.status === "Active").length
//     const inactiveMandals = MANDAL_DATA.filter((m) => m.status === "Inactive").length
    
//     return { totalMandals, activeMandals, inactiveMandals }
//   }, [])

//   const handleView = (mandal: Mandal) => {
//     setSelectedMandal(mandal)
//     setViewDialogOpen(true)
//   }

//   const handleEdit = (mandal: Mandal) => {
//     setSelectedMandal(mandal)
//     setEditDialogOpen(true)
//   }

//   return (
//     <>
//       <PageHeader title="Mandal List" description="Manage and view all created mandals">
//         <Button>Export List</Button>
//       </PageHeader>

//       <SummaryCards total={totalMandals} active={activeMandals} inactive={inactiveMandals} />

//       <Filters
//         searchTerm={searchTerm}
//         onSearchChange={setSearchTerm}
//         statusFilter={statusFilter}
//         onStatusFilterChange={setStatusFilter}
//       />

//       <DesktopTableView mandals={filteredMandals} onView={handleView} onEdit={handleEdit} />
      
//       <MobileCardView mandals={filteredMandals} onView={handleView} onEdit={handleEdit} />

//       <ViewModal
//         mandal={selectedMandal}
//         open={viewDialogOpen}
//         onOpenChange={setViewDialogOpen}
//         onEdit={handleEdit}
//       />

//       <EditModal
//         mandal={selectedMandal}
//         open={editDialogOpen}
//         onOpenChange={setEditDialogOpen}
//       />
//     </>
//   )
// }