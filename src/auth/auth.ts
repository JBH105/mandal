import api from "@/utils/axiosConfig";

export interface MemberData {
  _id: string;
  subUser: { _id: string; subUserName: string; phoneNumber: string };
  month: string;
  installment: number;
  amount: number;
  interest: number;
  fine: number;
  withdrawal: number;
  newWithdrawal: number;
  total: number;
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

export const createMandalSubUserApi = async (data: { subUserName: string; phoneNumber: string }) => {
  const response = await api.post("/mandalSubUser", data);
  return response.data;
};

export const getMandalSubUsersApi = async () => {
  const response = await api.get("/mandalSubUser");
  return response.data;
};

export const createMemberDataApi = async (data: {
  subUserId: string;
  month: string;
  installment: number;
  amount: number;
  interest: number;
  fine: number;
  withdrawal: number;
  newWithdrawal: number;
}) => {
  const response = await api.post("/memberData", data);
  return response.data;
};

export const getMemberDataApi = async (month: string): Promise<MemberData[]> => {
  const response = await api.get(`/memberData?month=${month}`);
  return response.data as MemberData[];
};

export const initializeMonthDataApi = async (month: string) => {
  const response = await api.post("/memberData/initialize", { month });
  return response.data;
};

export const getAllMonthsApi = async (): Promise<string[]> => {
  const response = await api.get(`/memberData?allMonths=true`);
  return response.data as string[];
};

export const getAvailableSubUsersApi = async (month: string): Promise<SubUser[]> => {
  const response = await api.get(`/memberData/availableSubUsers?month=${month}`);
  return response.data as SubUser[];
};