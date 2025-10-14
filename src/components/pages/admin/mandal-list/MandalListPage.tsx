"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/ui/page-header";
import { SummaryCards } from "./SummaryCards";
import { Filters, StatusFilter } from "./Filters";
import { DesktopTableView } from "./DesktopTableView";
import { ViewModal } from "./ViewModal";
import { EditModal } from "./EditModal";
import { DeleteModal } from "./DeleteModal";
import { getMandals, getMandalSubUsersApi, deleteMandal } from "@/auth/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export interface Mandal {
  id: string;
  nameEn: string;
  nameGu: string;
  adminUsername: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  totalMembers: number;
  createdAt: string;
}

interface MandalResponse {
  _id: string;
  nameEn: string;
  nameGu: string;
  userName: string;
  establishedDate: string;
  isActive: boolean;
  createdAt?: string;
}

interface SubUserResponse {
  _id: string;
  subUserName: string;
  phoneNumber: string;
  mandal?: string | { _id: string };
}

export default function MandalListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMandal, setSelectedMandal] = useState<Mandal | null>(null)
  const [mandals, setMandals] = useState<Mandal[]>([])

  const filteredMandals = useMemo(() => {
    return mandals.filter((mandal) => {
      const matchesSearch =
        mandal.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandal.nameGu.includes(searchTerm) ||
        mandal.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || mandal.status.toLowerCase() === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, mandals])

  const { totalMandals, activeMandals, inactiveMandals } = useMemo(() => {
    const totalMandals = mandals.length
    const activeMandals = mandals.filter((m) => m.status === "Active").length
    const inactiveMandals = mandals.filter((m) => m.status === "Inactive").length
    
    return { totalMandals, activeMandals, inactiveMandals }
  }, [mandals])

  useEffect(() => {
    const fetchMandals = async () => {
      try {
        const [mandalResponse, subUsersResponse] = await Promise.all([
          getMandals(),
          getMandalSubUsersApi()
        ])

        const subUserCounts: { [key: string]: number } = subUsersResponse.reduce((acc: { [key: string]: number }, subUser: SubUserResponse) => {
          const mandalId = typeof subUser.mandal === 'object' && subUser.mandal ? subUser.mandal._id : subUser.mandal;
          if (mandalId) {
            acc[mandalId] = (acc[mandalId] || 0) + 1;
          }
          return acc;
        }, {})

        const mappedMandals: Mandal[] = mandalResponse.map((item: MandalResponse) => ({
          id: item._id,
          nameEn: item.nameEn,
          nameGu: item.nameGu,
          adminUsername: item.userName,
          establishedDate: item.establishedDate,
          status: item.isActive ? "Active" : "Inactive", 
          totalMembers: subUserCounts[item._id] || 0, 
          createdAt: item.createdAt || new Date().toISOString(),
        }))
        setMandals(mappedMandals)
      } catch (error) {
        console.log("🚀 ~ fetchMandals ~ error:", error)
        showErrorToast("Error fetching mandals or sub-users")
      } finally {
      }
    }
    fetchMandals()
  }, [])

  const handleView = (mandal: Mandal) => {
    setSelectedMandal(mandal)
    setViewDialogOpen(true)
  }

  const handleEdit = (mandal: Mandal) => {
    setSelectedMandal(mandal)
    setEditDialogOpen(true)
  }

  const handleDelete = (mandal: Mandal) => {
    setSelectedMandal(mandal)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMandal) return;

    try {
      await deleteMandal(selectedMandal.id);
      setMandals(mandals.filter((mandal) => mandal.id !== selectedMandal.id));
      showSuccessToast("Mandal deleted successfully");
    } catch (error) {
      console.log("🚀 ~ confirmDelete ~ error:", error)
      showErrorToast("Error deleting mandal");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMandal(null);
    }
  }

  const handleEditSuccess = (updatedMandal: Mandal) => {
    setMandals(mandals.map(m => m.id === updatedMandal.id ? updatedMandal : m));
    setEditDialogOpen(false);
    setSelectedMandal(null);
  }

  return (
    <>
      <PageHeader title="Mandal List" description="Manage and view all created mandals">
        {/* <Button>Export List</Button> */}
      </PageHeader>

      <SummaryCards total={totalMandals} active={activeMandals} inactive={inactiveMandals} />

      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <DesktopTableView 
        mandals={filteredMandals} 
        onView={handleView} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
        onEditSuccess={handleEditSuccess}
      />

      <DeleteModal
        mandal={selectedMandal}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </>
  )
}