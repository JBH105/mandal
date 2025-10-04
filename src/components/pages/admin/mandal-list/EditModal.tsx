import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { updateMandal } from "@/auth/auth"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

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

interface EditModalProps {
  mandal: Mandal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditSuccess: (updatedMandal: Mandal) => void;
}

export const EditModal = ({
  mandal,
  open,
  onOpenChange,
  onEditSuccess,
}: EditModalProps) => {
  const [nameEn, setNameEn] = useState("")
  const [nameGu, setNameGu] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [status, setStatus] = useState("active")

  // Update state when mandal prop changes
  useEffect(() => {
    if (mandal) {
      setNameEn(mandal.nameEn)
      setNameGu(mandal.nameGu)
      setAdminUsername(mandal.adminUsername)
      setStatus(mandal.status.toLowerCase())
    }
  }, [mandal])

  const handleSave = async () => {
    if (!mandal) return;

    try {
      await updateMandal(mandal.id, {
        nameEn,
        nameGu,
        userName: adminUsername,
        isActive: status === "active",
      });
      showSuccessToast("Mandal updated successfully");
      // Call onEditSuccess with updated mandal data
      onEditSuccess({
        ...mandal,
        nameEn,
        nameGu,
        adminUsername,
        status: status === "active" ? "Active" : "Inactive",
      });
      onOpenChange(false);
    } catch (error) {
      console.log("🚀 ~ handleSave ~ error:", error)
      showErrorToast("Error updating mandal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Mandal</DialogTitle>
        </DialogHeader>
        {mandal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editNameEn">English Name</Label>
                <Input
                  id="editNameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNameGu">ગુજરાતી નામ</Label>
                <Input
                  id="editNameGu"
                  value={nameGu}
                  onChange={(e) => setNameGu(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUsername">Mandal Username</Label>
                <Input
                  id="editUsername"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDate">Established Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={mandal.establishedDate}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMembers">Total Members</Label>
                <Input
                  id="editMembers"
                  type="number"
                  value={mandal.totalMembers}
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}