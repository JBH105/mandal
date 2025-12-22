import api from "@/utils/axiosConfig";

export interface MemberData {
  _id: string;
  mandal: string;
  subUser: { _id: string; subUserName: string; phoneNumber: string };
  monthId: string;
  installment: number;
  withdrawal: number;
  interest: number;
  fine: number;
  paidWithdrawal: number;
  newWithdrawal: number;
  total: number; 
  // outerCheckbox: boolean;   
  // innerCheckbox: boolean;
  pendingInstallment: number;
  paidInstallment : number ;
  paidInterest : number ;
}

export interface SubUser {
  _id: string;
  subUserName: string;
  phoneNumber: string;
}

export const login = async (phoneNumber: string, password: string) => {
  const response = await api.post("/login", { phoneNumber, password });
  return response.data;
};

export const createMandal = async (data: {
  nameEn: string;
  nameGu: string;
  userName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  establishedDate: string;
  isActive: boolean;
}) => {
  const response = await api.post("/mandal", data);
  return response.data;
};

export const getMandals = async () => {
  const response = await api.get("/mandal");
  return response.data;
};

export const updateMandal = async (id: string, data: {
  nameEn: string;
  nameGu: string;
  userName: string;
  isActive: boolean;
}) => {
  const response = await api.put(`/mandal?id=${id}`, data);
  return response.data;
};

export const deleteMandal = async (id: string) => {
  const response = await api.delete(`/mandal?id=${id}`);
  return response.data;
};

export const createMandalSubUserApi = async (data: { subUserName: string; phoneNumber: string  , monthId : string }) => {
  const response = await api.post("/mandalSubUser", data);
  return response.data;
};

export const getMandalSubUsersApi = async () => {
  const response = await api.get("/mandalSubUser");
  return response.data;
};

export const createMemberDataApi = async (data: {
    _id: string;
  paidInstallment: number;
  paidWithdrawal: number;
  newWithdrawal: number;
  fine: number;

}) => {
  const response = await api.post("/memberData", data);
  return response.data;
};

export const getMemberDataApi = async (monthId: string): Promise<MemberData[]> => {
  const response = await api.get(`/memberData?monthId=${monthId}`);
  return response.data as MemberData[];
};

// export const initializeMonthDataApi = async (month: string) => {
//   const response = await api.post("/memberData/initialize", { month });
//   return response.data;
// };

// export const getAllMonthsApi = async (): Promise<string[]> => {
//   const response = await api.get(`/memberData?allMonths=true`);
//   return response.data as string[];
// };

export const getAvailableSubUsersApi = async (monthId: string): Promise<SubUser[]> => {
  const response = await api.get(`/memberData/availableSubUsers?monthId=${monthId}`);
  return response.data as SubUser[];
};


export const setNewInstallmentApi = async (
  monthId: string,
  installment: number
) => {
  const response = await api.post("/month/installment", {
    monthId,
    installment: Number(installment), 
  });
  return response.data;
};


export const getMonthApi = async (): Promise<{ _id: string; month: string }[]> => {
  const response = await api.get("/month");
  return response.data;
};


export const addNewMonthApi = async () => {
  const response = await api.post("/month");
  return response.data;
};
