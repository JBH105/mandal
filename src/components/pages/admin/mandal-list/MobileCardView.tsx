import { MandalCard } from "./MandalCard";

interface MobileCardViewProps {
  mandals: Mandal[];
  onView: (mandal: Mandal) => void;
  onEdit: (mandal: Mandal) => void;
  onDelete: (mandal: Mandal) => void;
}

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

export const MobileCardView = ({ mandals, onView, onEdit ,onDelete}: MobileCardViewProps) => (
  <div className="md:hidden space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">All Mandals ({mandals.length})</h3>
    </div>
    {mandals.map((mandal, index) => (
      <MandalCard key={mandal.id} mandal={mandal} index={index} onView={onView} onEdit={onEdit} onDelete={onDelete}/>
    ))}
  </div>
);