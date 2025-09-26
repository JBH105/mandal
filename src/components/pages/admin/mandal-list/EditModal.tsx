import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export const EditModal = ({
  mandal,
  open,
  onOpenChange,
}: {
  mandal: Mandal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => (
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
              <Input id="editNameEn" defaultValue={mandal.nameEn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNameGu">ગુજરાતી નામ</Label>
              <Input id="editNameGu" defaultValue={mandal.nameGu} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUsername">Admin Username</Label>
              <Input id="editUsername" defaultValue={mandal.adminUsername} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select defaultValue={mandal.status.toLowerCase()}>
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
              <Input id="editDate" type="date" defaultValue={mandal.establishedDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMembers">Total Members</Label>
              <Input id="editMembers" type="number" defaultValue={mandal.totalMembers} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
)
