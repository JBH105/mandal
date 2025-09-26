import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ViewModalProps {
  mandal: Mandal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (mandal: Mandal) => void;
}

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

interface StatusBadgeProps {
  status: "Active" | "Inactive";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge
    variant={status === "Active" ? "default" : "secondary"}
    className={status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
  >
    {status}
  </Badge>
);

export const ViewModal = ({ mandal, open, onOpenChange, onEdit }: ViewModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>View Mandal Details</DialogTitle>
      </DialogHeader>
      {mandal && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">English Name</Label>
              <p className="text-lg font-semibold">{mandal.nameEn}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">ગુજરાતી નામ</Label>
              <p className="text-lg font-semibold">{mandal.nameGu}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Admin Username</Label>
              <p className="font-medium">{mandal.adminUsername}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <StatusBadge status={mandal.status} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Established Date</Label>
              <p className="font-medium">{new Date(mandal.establishedDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Total Members</Label>
              <p className="font-medium">{mandal.totalMembers}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(mandal);
              }}
            >
              Edit Mandal
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);