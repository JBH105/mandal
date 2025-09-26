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

export const MANDAL_DATA: Mandal[] = [
  {
    id: 1,
    nameEn: "Shri Khodiyar Mandal",
    nameGu: "શ્રી ખોડિયાર મંડળ",
    adminUsername: "khodiyar_admin",
    establishedDate: "2024-01-15",
    status: "Active",
    totalMembers: 25,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    nameEn: "Ganesh Mandal",
    nameGu: "ગણેશ મંડળ",
    adminUsername: "ganesh_admin",
    establishedDate: "2024-02-20",
    status: "Active",
    totalMembers: 30,
    createdAt: "2024-02-20T14:15:00Z",
  },
  {
    id: 3,
    nameEn: "Durga Mata Mandal",
    nameGu: "દુર્ગા માતા મંડળ",
    adminUsername: "durga_admin",
    establishedDate: "2024-03-10",
    status: "Inactive",
    totalMembers: 18,
    createdAt: "2024-03-10T09:45:00Z",
  },
  {
    id: 4,
    nameEn: "Hanuman Mandal",
    nameGu: "હનુમાન મંડળ",
    adminUsername: "hanuman_admin",
    establishedDate: "2024-04-05",
    status: "Active",
    totalMembers: 22,
    createdAt: "2024-04-05T16:20:00Z",
  },
  {
    id: 5,
    nameEn: "Saraswati Mandal",
    nameGu: "સરસ્વતી મંડળ",
    adminUsername: "saraswati_admin",
    establishedDate: "2024-05-12",
    status: "Active",
    totalMembers: 35,
    createdAt: "2024-05-12T11:30:00Z",
  },
];