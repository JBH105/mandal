// src/components/pages/mandal/analytics/AnalyticsPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Search } from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi";

import {
  getMandals,
  getMandalSubUsersApi,
  createMandalSubUserApi,
  createMemberDataApi,
  getMemberDataApi,
  getAllMonthsApi,
  initializeMonthDataApi,
  MemberData,
  SubUser,
  updateMandalInstallmentApi,
} from "@/auth/auth";

import { showErrorToast, showSuccessToast } from "@/middleware/lib/toast";
import {
  validateNewMemberForm,
  cleanPhoneNumberForPayload,
  formatPhoneNumber,
  ValidationErrors,
} from "./validation";
import { AxiosError } from "axios";
import { SkeletonCard, SkeletonTable, Loader } from "@/components/ui/loader";
import { MobileFooter } from "@/components/ui/mobile-footer";
import { IoPersonAdd } from "react-icons/io5";
import { TbTransactionRupee } from "react-icons/tb";

interface FormData {
  subUserId: string;
  installment: string;
  amount: string;
  interest: string;
  fine: string;
  withdrawal: string;
  newWithdrawal: string;
}

export interface NewMemberForm {
  subUserName: string;
  phoneNumber: string;
}

const LOCAL_STORAGE_KEYS = {
  MANUAL_UPDATE_STATUS: (mandalId: string) =>
    `mandal_${mandalId}_manual_update_status`,
  MONTH_SELECTED: (mandalId: string) => `mandal_${mandalId}_selected_month`,
};

export default function AnalyticsPage() {
  const [mandalName, setMandalName] = useState<string>("આઈ શ્રી ખોડિયાર");
  const [establishedDate, setEstablishedDate] = useState<string | null>(null);
  const [mandalId, setMandalId] = useState<string | null>(null);

  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [filteredMemberData, setFilteredMemberData] = useState<MemberData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    subUserId: "",
    installment: "",
    amount: "",
    interest: "",
    fine: "",
    withdrawal: "",
    newWithdrawal: "",
  });

  const [selectedMemberName, setSelectedMemberName] = useState<string>("");

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] =
    useState<boolean>(false);

  const [newMemberData, setNewMemberData] = useState<NewMemberForm>({
    subUserName: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{
    subUserName: boolean;
    phoneNumber: boolean;
  }>({
    subUserName: false,
    phoneNumber: false,
  });

  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isAddingMonth, setIsAddingMonth] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isTableDataLoading, setIsTableDataLoading] = useState<boolean>(false);

  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);

  const [previousMonthData, setPreviousMonthData] = useState<MemberData[]>([]);

  const [mandalMonthlyInstallment, setMandalMonthlyInstallment] =
    useState<number>(0);

  const [isHaptoDialogOpen, setIsHaptoDialogOpen] = useState<boolean>(false);
  const [haptoValue, setHaptoValue] = useState<string>("");
  const [haptoLabelValue, setHaptoLabelValue] = useState<string>("");

  const [isInstallmentPaid, setIsInstallmentPaid] = useState<boolean>(true);
  const [isHaptoSet, setIsHaptoSet] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [manualUpdateStatus, setManualUpdateStatus] = useState<
    Record<string, boolean>
  >(() => {
    if (typeof window !== "undefined" && mandalId) {
      const saved = localStorage.getItem(
        LOCAL_STORAGE_KEYS.MANUAL_UPDATE_STATUS(mandalId)
      );
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined" && mandalId) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MANUAL_UPDATE_STATUS(mandalId),
        JSON.stringify(manualUpdateStatus)
      );
    }
  }, [manualUpdateStatus, mandalId]);

  useEffect(() => {
    if (selectedMonth && typeof window !== "undefined" && mandalId) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MONTH_SELECTED(mandalId),
        selectedMonth
      );
    }
  }, [selectedMonth, mandalId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsDashboardLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter member data based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMemberData(memberData);
    } else {
      const filtered = memberData.filter((member) =>
        member.subUser.subUserName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredMemberData(filtered);
    }
  }, [searchQuery, memberData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsDashboardLoading(true);

        const mandals = await getMandals();
        if (mandals.length > 0) {
          const currentMandal = mandals[0];
          setMandalName(currentMandal.nameGu);
          setEstablishedDate(currentMandal.establishedDate);
          const currentMandalId = currentMandal._id;
          setMandalId(currentMandalId);

          const backendInstallment = currentMandal.setInstallment || 0;
          setMandalMonthlyInstallment(backendInstallment);
          setIsHaptoSet(backendInstallment > 0);
          setHaptoLabelValue(
            backendInstallment > 0 ? `Hapto: ₹${backendInstallment}` : ""
          );

          const [users, allMonths] = await Promise.all([
            getMandalSubUsersApi(),
            getAllMonthsApi(),
          ]);

          setSubUsers(users);

          const validMonths = Array.isArray(allMonths) ? allMonths : [];

          if (validMonths.length > 0) {
            const sortedMonths = [...validMonths].sort((a, b) => {
              const dateA = new Date(a + "-01");
              const dateB = new Date(b + "-01");
              return dateB.getTime() - dateA.getTime();
            });

            setMonths(sortedMonths);

            let defaultMonth = sortedMonths[0];
            if (typeof window !== "undefined" && currentMandalId) {
              const savedMonth = localStorage.getItem(
                LOCAL_STORAGE_KEYS.MONTH_SELECTED(currentMandalId)
              );
              if (savedMonth && sortedMonths.includes(savedMonth)) {
                defaultMonth = savedMonth;
              }
            }

            setSelectedMonth(defaultMonth);

            if (defaultMonth) {
              const data: MemberData[] = await getMemberDataApi(defaultMonth);
              setMemberData(data);
              setFilteredMemberData(data);

              const currentMonthIndex = sortedMonths.indexOf(defaultMonth);
              if (currentMonthIndex > 0) {
                const previousMonth = sortedMonths[currentMonthIndex - 1];
                const prevData: MemberData[] = await getMemberDataApi(
                  previousMonth
                );
                setPreviousMonthData(prevData);
              }

              setHasDataLoaded(true);
            }
          } else {
            setMonths([]);
            setSelectedMonth("");
            setMemberData([]);
            setFilteredMemberData([]);
            setHasDataLoaded(true);

            showSuccessToast(
              "Welcome to your new mandal! Start by adding your first member."
            );
          }
        } else {
          setMandalName("No Mandal Found");
          setHasDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMandalName("Error Loading Mandal");
        setHasDataLoaded(true);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    const fetchMemberData = async () => {
      try {
        setIsTableDataLoading(true);
        const data: MemberData[] = await getMemberDataApi(selectedMonth);
        setMemberData(data);
        setFilteredMemberData(data);

        const currentMonthIndex = months.indexOf(selectedMonth);
        if (currentMonthIndex > 0 && months.length > 1) {
          const previousMonth = months[currentMonthIndex - 1];
          const prevData: MemberData[] = await getMemberDataApi(previousMonth);
          setPreviousMonthData(prevData);
        } else {
          setPreviousMonthData([]);
        }
      } catch (error) {
        console.log("🚀 ~ fetchMemberData ~ error:", error);
        showErrorToast("Error fetching member data:");
      } finally {
        setIsTableDataLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMemberData();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedMonth, months]);

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const calculations = useMemo(() => {
    const totalInstallments = memberData.reduce(
      (sum, row) => sum + row.installment,
      0
    );
    const totalAmount = memberData.reduce((sum, row) => sum + row.amount, 0);
    const totalInterest = memberData.reduce(
      (sum, row) => sum + row.interest,
      0
    );
    const totalFines = memberData.reduce((sum, row) => sum + row.fine, 0);
    const totalWithdrawals = memberData.reduce(
      (sum, row) => sum + row.withdrawal,
      0
    );
    const totalNewWithdrawals = memberData.reduce(
      (sum, row) => sum + row.newWithdrawal,
      0
    );
    const totalMembers = memberData.length;

    const totalName = totalInstallments + totalInterest + totalWithdrawals;
    const bandSilak = totalName - totalNewWithdrawals;
    const Mandalcash = 0 + bandSilak;
    const interestPerPerson =
      totalMembers > 0 ? totalInterest / totalMembers : 0;
    const perPerson = totalMembers > 0 ? bandSilak / totalMembers : 0;

    return {
      totalInstallments,
      totalAmount,
      totalInterest,
      totalFines,
      totalWithdrawals,
      totalNewWithdrawals,
      grandTotal: 0,
      totalMembers,
      totalName,
      bandSilak,
      Mandalcash,
      interestPerPerson,
      perPerson,
    };
  }, [memberData]);

  const calculateCarriedForwardInstallment = (memberId: string) => {
    if (!selectedMonth || !memberId) return 0;

    const currentMonthIndex = months.indexOf(selectedMonth);
    if (currentMonthIndex <= 0) return 0;

    const previousData = previousMonthData.find(
      (data) => data.subUser._id === memberId
    );

    if (previousData) {
      return previousData.installment;
    }

    return 0;
  };

  const calculateCarriedForwardAmount = (memberId: string) => {
    if (!selectedMonth || !memberId) return 0;

    const currentMonthIndex = months.indexOf(selectedMonth);
    if (currentMonthIndex <= 0) return 0;

    const previousData = previousMonthData.find(
      (data) => data.subUser._id === memberId
    );

    if (previousData) {
      return (
        previousData.amount +
        previousData.newWithdrawal -
        previousData.withdrawal
      );
    }

    return 0;
  };

  const shouldCheckboxBeChecked = (memberId: string) => {
    if (!selectedMonth) return false;

    const isManuallyUpdated =
      manualUpdateStatus[`${memberId}_${selectedMonth}`] || false;

    return isManuallyUpdated;
  };

  // Handle checkbox click - toggle installment payment status
  const handleCheckboxClick = (memberId: string) => {
    if (!selectedMonth) return;

    const newStatus = !shouldCheckboxBeChecked(memberId);
    
    setManualUpdateStatus((prev) => ({
      ...prev,
      [`${memberId}_${selectedMonth}`]: newStatus,
    }));

    // Update selected members array
    if (newStatus) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };

  // Select all checkboxes
  const handleSelectAll = () => {
    if (!selectedMonth || filteredMemberData.length === 0) return;

    const allMemberIds = filteredMemberData.map((member) => member.subUser._id);
    const allChecked = selectedMembers.length === allMemberIds.length;

    const newStatus = { ...manualUpdateStatus };
    
    if (!allChecked) {
      // Select all
      allMemberIds.forEach((memberId) => {
        newStatus[`${memberId}_${selectedMonth}`] = true;
      });
      setSelectedMembers(allMemberIds);
    } else {
      // Deselect all
      allMemberIds.forEach((memberId) => {
        newStatus[`${memberId}_${selectedMonth}`] = false;
      });
      setSelectedMembers([]);
    }
    
    setManualUpdateStatus(newStatus);
  };

  const getFilteredErrors = () => {
    const allErrors = validateNewMemberForm(newMemberData);
    const filtered: ValidationErrors = {};
    if (touched.subUserName && allErrors.subUserName) {
      filtered.subUserName = allErrors.subUserName;
    }
    if (touched.phoneNumber && allErrors.phoneNumber) {
      filtered.phoneNumber = allErrors.phoneNumber;
    }
    return filtered;
  };

  const getDisplayInstallmentValue = (row: MemberData): number => {
    const carriedForwardInstallment = calculateCarriedForwardInstallment(
      row.subUser._id
    );
    return carriedForwardInstallment + row.installment;
  };

  const handleAddMember = async () => {
    const validationErrors = validateNewMemberForm(newMemberData);
    setErrors(validationErrors);
    setTouched({ subUserName: true, phoneNumber: true });

    if (Object.keys(validationErrors).length > 0) {
      showErrorToast("Please fix the errors in the form");
      return;
    }

    try {
      setIsAddingMember(true);
      setIsTableDataLoading(true);

      const cleanPhoneNumber = cleanPhoneNumberForPayload(
        newMemberData.phoneNumber
      );

      const phoneNumberExists = subUsers.some(
        (user) => user.phoneNumber === cleanPhoneNumber
      );

      if (phoneNumberExists) {
        showErrorToast(
          "This phone number is already registered with another member"
        );
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Phone number already exists",
        }));
        setIsTableDataLoading(false);
        return;
      }

      // 1) Create subuser
      await createMandalSubUserApi({
        subUserName: newMemberData.subUserName,
        phoneNumber: cleanPhoneNumber,
      });

      showSuccessToast("Member created successfully!");

      // 2) Refresh subUsers list
      const users = await getMandalSubUsersApi();
      setSubUsers(users);

      // 3) Check if we need to create the first month based on established date
      let allMonths = await getAllMonthsApi();
      let validMonths = Array.isArray(allMonths) ? allMonths : [];

      // If no months exist, create the first month based on established date
      if (validMonths.length === 0 && establishedDate) {
        try {
          const establishedYear = new Date(establishedDate).getFullYear();
          const establishedMonth = (new Date(establishedDate).getMonth() + 1)
            .toString()
            .padStart(2, "0");
          const firstMonth = `${establishedYear}-${establishedMonth}`;

          await initializeMonthDataApi(firstMonth);

          allMonths = await getAllMonthsApi();
          validMonths = Array.isArray(allMonths) ? allMonths : [];

          const sortedMonths = [...validMonths].sort((a, b) => {
            const dateA = new Date(a + "-01");
            const dateB = new Date(b + "-01");
            return dateB.getTime() - dateA.getTime();
          });

          setMonths(sortedMonths);
          setSelectedMonth(firstMonth);

          const updatedData = await getMemberDataApi(firstMonth);
          setMemberData(updatedData);
          setFilteredMemberData(updatedData);

          showSuccessToast(
            `First month ${firstMonth} created based on mandal's established date`
          );
        } catch (monthError) {
          console.error("Error creating first month:", monthError);
          showErrorToast("Failed to create initial month");
        }
      } else if (validMonths.length > 0) {
        const initPromises = validMonths.map(async (month) => {
          if (!/^\d{4}-\d{2}$/.test(month)) {
            console.warn(`Invalid month format: ${month}`);
            return;
          }
          try {
            await initializeMonthDataApi(month);
          } catch (err) {
            console.warn("initializeMonthDataApi failed for month", month, err);
          }
        });

        await Promise.all(initPromises);

        const targetMonth = selectedMonth || validMonths[0];
        const updatedData = await getMemberDataApi(targetMonth);
        setMemberData(updatedData);
        setFilteredMemberData(updatedData);
      } else {
        const fallbackMonth = getCurrentMonth();
        await initializeMonthDataApi(fallbackMonth);

        allMonths = await getAllMonthsApi();
        validMonths = Array.isArray(allMonths) ? allMonths : [];

        const sortedMonths = [...validMonths].sort((a, b) => {
          const dateA = new Date(a + "-01");
          const dateB = new Date(b + "-01");
          return dateB.getTime() - dateA.getTime();
        });

        setMonths(sortedMonths);
        setSelectedMonth(fallbackMonth);

        const updatedData = await getMemberDataApi(fallbackMonth);
        setMemberData(updatedData);
        setFilteredMemberData(updatedData);
      }

      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setErrors({});
      setTouched({ subUserName: false, phoneNumber: false });
      setIsAddMemberDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error creating member:", error);
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error?.toLowerCase() ||
          error.response?.data?.message?.toLowerCase();
        if (
          errorMessage &&
          errorMessage.includes("phone") &&
          errorMessage.includes("already")
        ) {
          showErrorToast("Phone number already in use");
          setErrors((prev) => ({
            ...prev,
            phoneNumber: "This phone number is already registered",
          }));
        } else if (error.response?.data?.error) {
          showErrorToast(error.response.data.error);
        } else {
          showErrorToast("Failed to create member");
        }
      } else {
        showErrorToast("Failed to create member");
      }
    } finally {
      setIsAddingMember(false);
      setIsTableDataLoading(false);
    }
  };

  const handleAddData = async () => {
    if (!formData.subUserId || !selectedMonth) {
      showErrorToast("Please select a member and month");
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      showErrorToast("Invalid month format. Expected YYYY-MM");
      return;
    }

    try {
      setUpdatingMemberId(formData.subUserId);

      const currentInstallment = parseInt(formData.installment) || 0;

      const data = {
        subUserId: formData.subUserId,
        month: selectedMonth,
        installment: currentInstallment,
        amount: parseInt(formData.amount) || 0,
        interest: parseInt(formData.interest) || 0,
        fine: parseInt(formData.fine) || 0,
        withdrawal: parseInt(formData.withdrawal) || 0,
        newWithdrawal: parseInt(formData.newWithdrawal) || 0,
      };

      await createMemberDataApi(data);

      setManualUpdateStatus((prev) => ({
        ...prev,
        [`${formData.subUserId}_${selectedMonth}`]: isInstallmentPaid,
      }));

      showSuccessToast("Member data updated successfully!");

      const updatedData = await getMemberDataApi(selectedMonth);
      setMemberData(updatedData);
      setFilteredMemberData(updatedData);

      setFormData({
        subUserId: "",
        installment: "",
        amount: "",
        interest: "",
        fine: "",
        withdrawal: "",
        newWithdrawal: "",
      });
      setIsInstallmentPaid(true);
      setSelectedMemberName("");
      setIsAddDialogOpen(false);
    } catch (error: unknown) {
      console.log("🚀 ~ handleAddData ~ error:", error);

      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message = err.response?.data?.message;

      if (
        message?.includes("Month is required") ||
        message?.includes("YYYY-MM")
      ) {
        showErrorToast("ત્રુટિ: મહિનો YYYY-MM ફોર્મેટમાં જરૂરી છે");
      } else {
        showErrorToast("Failed to update member data");
      }
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleHaptoSet = async () => {
    if (!haptoValue) {
      showErrorToast("Please enter a value for Hapto");
      return;
    }

    const numValue = parseInt(haptoValue);
    if (isNaN(numValue) || numValue < 0) {
      showErrorToast("Please enter a valid positive number");
      return;
    }

    if (!mandalId) {
      showErrorToast("Mandal not found");
      return;
    }

    try {
      const isFirstTimeSet = !isHaptoSet;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1;
      const currentMonthStr = `${currentYear}-${currentMonthNum
        .toString()
        .padStart(2, "0")}`;

      const shouldUpdateSelectedMonth =
        selectedMonth && selectedMonth >= currentMonthStr;

      const result = await updateMandalInstallmentApi(
        mandalId,
        numValue,
        selectedMonth
      );

      setMandalMonthlyInstallment(result.setInstallment ?? numValue);
      setIsHaptoSet((result.setInstallment ?? numValue) > 0);
      setHaptoLabelValue(`Hapto: ₹${result.setInstallment ?? numValue}`);

      showSuccessToast(
        `Hapto value set to ₹${result.setInstallment ?? numValue}`
      );

      if (selectedMonth && shouldUpdateSelectedMonth) {
        setIsTableDataLoading(true);
        const updatedData = await getMemberDataApi(selectedMonth);
        setMemberData(updatedData);
        setFilteredMemberData(updatedData);
      } else if (selectedMonth && !shouldUpdateSelectedMonth) {
        showSuccessToast(
          `Hapto updated for future months. Current view shows previous month ${selectedMonth}`
        );
      }

      if (isFirstTimeSet) {
        showSuccessToast(
          `Hapto value set. Future months will use ₹${numValue}`
        );
      } else {
        showSuccessToast(
          `Hapto value updated. Future months will use ₹${numValue}`
        );
      }

      setIsHaptoDialogOpen(false);
      setHaptoValue("");
    } catch (error) {
      console.error("Error setting hapto value:", error);
      showErrorToast("Failed to set hapto value");
    } finally {
      setIsTableDataLoading(false);
    }
  };

  const handleAddNewMonth = async () => {
    let newMonth: string;

    if (months.length === 0 && establishedDate) {
      const [year, month] = establishedDate.slice(0, 7).split("-").map(Number);
      newMonth = `${year}-${month.toString().padStart(2, "0")}`;
    } else if (months.length > 0) {
      const latestMonth = months[0];
      const [year, month] = latestMonth.split("-").map(Number);
      let nextMonth = month + 1;
      let nextYear = year;

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
      }

      newMonth = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`;
    } else {
      newMonth = getCurrentMonth();
    }

    if (!/^\d{4}-\d{2}$/.test(newMonth)) {
      showErrorToast("Invalid month format. Expected YYYY-MM");
      return;
    }

    try {
      setIsAddingMonth(true);
      setIsTableLoading(true);

      await initializeMonthDataApi(newMonth);

      const allMonths = await getAllMonthsApi();
      const validMonths = Array.isArray(allMonths) ? allMonths : [];

      validMonths.sort((a, b) => {
        const dateA = new Date(a + "-01");
        const dateB = new Date(b + "-01");
        return dateB.getTime() - dateA.getTime();
      });

      setMonths(validMonths);
      setSelectedMonth(newMonth);

      const data = await getMemberDataApi(newMonth);
      setMemberData(data);
      setFilteredMemberData(data);

      const prevData =
        months.length > 0 ? await getMemberDataApi(months[0]) : [];
      setPreviousMonthData(prevData);

      const newStatus = { ...manualUpdateStatus };
      subUsers.forEach((subUser) => {
        const key = `${subUser._id}_${newMonth}`;
        if (!(key in newStatus)) {
          newStatus[key] = false;
        }
      });
      setManualUpdateStatus(newStatus);

      showSuccessToast(
        `મહિનો ${newMonth} બનાવાયો! (Installment for this month will use backend's setInstallment)`
      );
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message = err.response?.data?.message;

      console.error("Error creating new month:", error);

      if (message?.includes("Month is required")) {
        showErrorToast("ત્રુટિ: મહિનો YYYY-MM ફોર્મેટમાં જરૂરી છે");
      } else if (message) {
        showErrorToast(`ત્રુટિ: ${message}`);
      } else {
        showErrorToast("નવો મહિનો બનાવામાં ત્રુટિ");
      }
    } finally {
      setIsAddingMonth(false);
      setIsTableLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMemberData({ ...newMemberData, subUserName: value });
    setTouched({ ...touched, subUserName: true });
    setErrors(getFilteredErrors());
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+91 ")) {
      value = "+91 " + value.replace(/^\+91\s*/, "");
    }
    const digits = value
      .replace(/^\+91\s*/, "")
      .replace(/\s/g, "")
      .replace(/\D/g, "");
    const formattedValue = formatPhoneNumber(digits);
    setNewMemberData({ ...newMemberData, phoneNumber: formattedValue });
    setTouched({ ...touched, phoneNumber: true });
    setErrors(getFilteredErrors());
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setErrors({});
      setTouched({ subUserName: false, phoneNumber: false });
    }
    setIsAddMemberDialogOpen(open);
  };

  const hasError = (field: keyof typeof touched) =>
    touched[field] && !!errors[field];

  const handleRowAction = (row: MemberData) => {
    const currentInstallment = row.installment;

    setFormData({
      subUserId: row.subUser._id,
      installment: currentInstallment.toString(),
      amount: row.amount?.toString() || "0",
      interest: row.interest?.toString() || "0",
      fine: row.fine?.toString() || "0",
      withdrawal: row.withdrawal?.toString() || "0",
      newWithdrawal: row.newWithdrawal?.toString() || "0",
    });

    const isManuallyUpdated =
      manualUpdateStatus[`${row.subUser._id}_${selectedMonth}`] || false;
    setIsInstallmentPaid(isManuallyUpdated);

    setSelectedMemberName(row.subUser?.subUserName || "");
    setIsAddDialogOpen(true);
  };

  const handleInputFocus = (field: keyof Omit<FormData, "subUserId">) => {
    if (formData[field] === "0") {
      setFormData({
        ...formData,
        [field]: "",
      });
    }
  };

  const handleInputBlur = (field: keyof Omit<FormData, "subUserId">) => {
    if (formData[field] === "") {
      if (field === "installment") {
        return;
      }
      setFormData({
        ...formData,
        [field]: "0",
      });
    }
  };

  // Update selected members when member data changes
  useEffect(() => {
    if (filteredMemberData.length > 0 && selectedMonth) {
      const membersWithCheckedBox = filteredMemberData
        .filter((member) => shouldCheckboxBeChecked(member.subUser._id))
        .map((member) => member.subUser._id);
      setSelectedMembers(membersWithCheckedBox);
    }
  }, [filteredMemberData, selectedMonth, manualUpdateStatus]);

  if (isDashboardLoading && !hasDataLoaded) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-48 md:w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-72 md:w-96 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-28 md:w-32 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-10 w-40 md:w-48 bg-gray-200 rounded animate-pulse" />
          <SkeletonTable rows={5} cols={11} />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Monthly Ledger"
        description="View your monthly ledger, withdrawals, and interest earnings in one place."
      >
        <div
          className="
 hidden
    md:flex md:flex-row md:flex-wrap md:items-center md:gap-3
    lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-3
    w-full       
  "
        >
          <div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px] shrink-0">
                <Calendar className="h-4 w-4 mr-2" />
                {isAddingMonth ? (
                  <span className="text-gray-400 text-sm">
                    Loading months...
                  </span>
                ) : (
                  <SelectValue placeholder="Select month" />
                )}
              </SelectTrigger>
              {!isAddingMonth && (
                <SelectContent>
                  {Array.isArray(months) && months.length > 0 ? (
                    months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {new Date(month + "-01").toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        })}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No months available
                    </SelectItem>
                  )}
                </SelectContent>
              )}
            </Select>
          </div>
          <div className="">
            <Button
              variant="default"
              onClick={handleAddNewMonth}
              className="w-full sm:w-auto lg:w-auto shrink-0"
              disabled={isAddingMonth || subUsers.length === 0}
            >
              {isAddingMonth ? (
                <Loader
                  size="sm"
                  variant="white"
                  type="dots"
                  className="!gap-0"
                  show
                />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2">
                {isAddingMonth ? "Adding..." : "Add New Month"}
              </span>
            </Button>
          </div>
          <div className="">
            <div className="sm:ml-auto">
              <Dialog
                open={isAddMemberDialogOpen}
                onOpenChange={handleDialogClose}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full sm:w-auto lg:w-auto shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Add Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      Add New Member
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="subUserName"
                        className="text-sm sm:text-base"
                      >
                        Member Name
                      </Label>
                      <Input
                        id="subUserName"
                        value={newMemberData.subUserName}
                        onChange={handleNameChange}
                        placeholder="Enter member name"
                        className={
                          hasError("subUserName")
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }
                        disabled={isAddingMember}
                      />
                      {hasError("subUserName") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.subUserName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-sm sm:text-base"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={newMemberData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder="+91 12345 67890"
                        className={
                          hasError("phoneNumber")
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }
                        disabled={isAddingMember}
                      />
                      {hasError("phoneNumber") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleDialogClose(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddMember}
                      disabled={
                        Object.keys(validateNewMemberForm(newMemberData))
                          .length > 0 || isAddingMember
                      }
                      className="w-full sm:w-auto"
                    >
                      {isAddingMember ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader
                            size="sm"
                            variant="white"
                            type="dots"
                            className="!gap-0"
                            show
                          />
                          Adding...
                        </div>
                      ) : (
                        "Add Member"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="">
            <div className="flex items-center gap-2">
              <Dialog
                open={isHaptoDialogOpen}
                onOpenChange={setIsHaptoDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full sm:w-auto lg:w-auto shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">
                      {isHaptoSet ? "Update Hapto" : "Set Hapto"}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      {isHaptoSet ? "Update Hapto Value" : "Set Hapto Value"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="haptoValue"
                        className="text-sm sm:text-base"
                      >
                        હપ્તો (Installment)
                      </Label>
                      <Input
                        id="haptoValue"
                        type="number"
                        value={haptoValue}
                        onChange={(e) => setHaptoValue(e.target.value)}
                        placeholder={
                          isHaptoSet
                            ? "Update hapto value"
                            : "Enter hapto value (e.g., 1000)"
                        }
                        className="text-base"
                      />
                      {isHaptoSet && (
                        <p className="text-xs text-gray-500 mt-1">
                          Note: Updating hapto will only affect CURRENT month
                          and FUTURE months. Previous months installment values
                          will remain unchanged.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setIsHaptoDialogOpen(false);
                        setHaptoValue("");
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      type="button"
                      onClick={handleHaptoSet}
                      className="w-full sm:w-auto"
                      disabled={!haptoValue}
                    >
                      {isHaptoSet ? "Update Hapto" : "Set Hapto"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Search Bar - Only for mobile (sm) */}
      <div className="md:hidden px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Update Member Data
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="memberName" className="text-sm sm:text-base">
                  સભ્યનું નામ (Member Name)
                </Label>
                <Input
                  id="memberName"
                  value={selectedMemberName}
                  readOnly
                  className="w-full text-base"
                  placeholder="Selected member name"
                />
                <input type="hidden" value={formData.subUserId} />
              </div>

              <div className="space-y-2 sm:col-span-2 flex items-center gap-2">
                <Checkbox
                  id="installmentPaid"
                  checked={isInstallmentPaid}
                  onCheckedChange={(checked) =>
                    setIsInstallmentPaid(checked as boolean)
                  }
                />
                <Label
                  htmlFor="installmentPaid"
                  className="text-sm sm:text-base"
                >
                  હપ્તો ચૂકવાયો (Installment Paid)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment" className="text-sm sm:text-base">
                  હપ્તો (Installment)
                </Label>
                <Input
                  id="installment"
                  type="number"
                  value={formData.installment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installment: e.target.value,
                    })
                  }
                  onFocus={() => handleInputFocus("installment")}
                  onBlur={() => handleInputBlur("installment")}
                  placeholder="Enter installment"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm sm:text-base">
                  આ નો ઉ. (Amount)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  onFocus={() => handleInputFocus("amount")}
                  onBlur={() => handleInputBlur("amount")}
                  placeholder="Enter amount"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest" className="text-sm sm:text-base">
                  બ્યાજ (Interest)
                </Label>
                <Input
                  id="interest"
                  type="number"
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                  onFocus={() => handleInputFocus("interest")}
                  onBlur={() => handleInputBlur("interest")}
                  placeholder="Enter interest"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fine" className="text-sm sm:text-base">
                  દંડ (Fine)
                </Label>
                <Input
                  id="fine"
                  type="number"
                  value={formData.fine}
                  onChange={(e) =>
                    setFormData({ ...formData, fine: e.target.value })
                  }
                  onFocus={() => handleInputFocus("fine")}
                  onBlur={() => handleInputBlur("fine")}
                  placeholder="Enter fine"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawal" className="text-sm sm:text-base">
                  ઉપાડ જમા (Withdrawal)
                </Label>
                <Input
                  id="withdrawal"
                  type="number"
                  value={formData.withdrawal}
                  onChange={(e) =>
                    setFormData({ ...formData, withdrawal: e.target.value })
                  }
                  onFocus={() => handleInputFocus("withdrawal")}
                  onBlur={() => handleInputBlur("withdrawal")}
                  placeholder="Enter withdrawal"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newWithdrawal" className="text-sm sm:text-base">
                  નવો ઉપાડ (New Withdrawal)
                </Label>
                <Input
                  id="newWithdrawal"
                  type="number"
                  value={formData.newWithdrawal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newWithdrawal: e.target.value,
                    })
                  }
                  onFocus={() => handleInputFocus("newWithdrawal")}
                  onBlur={() => handleInputBlur("newWithdrawal")}
                  placeholder="Enter new withdrawal"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setFormData({
                    subUserId: "",
                    installment: "",
                    amount: "",
                    interest: "",
                    fine: "",
                    withdrawal: "",
                    newWithdrawal: "",
                  });
                  setIsInstallmentPaid(true);
                  setSelectedMemberName("");
                  setUpdatingMemberId(null);
                  setIsAddDialogOpen(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddData}
                className="w-full sm:w-auto"
                disabled={!selectedMemberName || updatingMemberId !== null}
              >
                {updatingMemberId ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader
                      size="sm"
                      variant="white"
                      type="dots"
                      className="!gap-0"
                      show
                    />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Data"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="hidden md:block lg:block">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl font-bold text-red-600">
                {mandalName}
              </CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline">
                  {calculations.totalMembers} Members
                </Badge>
                <Badge variant="outline">
                  {selectedMonth
                    ? new Date(selectedMonth + "-01").toLocaleDateString(
                        "en-GB",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "No Month Selected"}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {isHaptoSet
                    ? `Monthly: ₹${mandalMonthlyInstallment}`
                    : "Monthly: Not Set"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  {months.length} Months
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <div className="max-h-[420px] overflow-y-auto">
              <Table className="min-w-[1000px] w-full">
                <TableHeader className="sticky top-0 z-20 bg-white">
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      <Checkbox
                        checked={
                          filteredMemberData.length > 0 &&
                          selectedMembers.length === filteredMemberData.length
                        }
                        onCheckedChange={handleSelectAll}
                        className="border border-gray-600 h-5 w-5 rounded-sm
                          data-[state=checked]:bg-green-600
                          data-[state=checked]:border-green-600"
                      />
                    </TableHead>
                    <TableHead className="sticky top-0 bg-whitez-30 text-center">
                      ક્રમ નં.
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30">
                      સભ્યનું નામ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      હપ્તો
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      આ.નો ઉ.
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      વ્યાજ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      દંડ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      ઉપાડ જમા
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      નવો ઉપાડ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      હપ્તો + વ્યાજ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isTableLoading || isTableDataLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className="text-center">
                          <div className="h-5 w-5 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-8 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-32 md:w-40 bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-24 md:w-28 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-8 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredMemberData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <HiOutlineUserGroup className="h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                          <p className="text-base md:text-lg font-medium mb-1 md:mb-2">
                            {searchQuery ? "No members found" : "No members added yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMemberData.map((row, index) => {
                      const carriedForwardAmount =
                        calculateCarriedForwardAmount(row.subUser._id);
                      const carriedForwardInstallment =
                        calculateCarriedForwardInstallment(row.subUser._id);
                      const isChecked = shouldCheckboxBeChecked(
                        row.subUser._id
                      );
                      const hasPaidNewInstallment =
                        row.installment > carriedForwardInstallment;

                      const totalInstallmentDisplay =
                        getDisplayInstallmentValue(row);

                      return (
                        <TableRow key={row._id}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleCheckboxClick(row.subUser._id)}
                              className="border border-gray-600 h-5 w-5 rounded-sm
                                data-[state=checked]:bg-green-600
                                data-[state=checked]:border-green-600"
                            />
                          </TableCell>
                          <TableCell className="text-center font-medium text-xs md:text-sm">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-xs md:text-sm">
                            <div className="flex items-center">
                              {row.subUser?.subUserName}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center gap-2">
                                <Checkbox
                                  checked={isChecked}
                                  disabled
                                  className="h-4 w-4 data-[state=checked]:bg-green-600"
                                />
                                <span
                                  className={`font-medium ${
                                    isChecked
                                      ? "text-green-600"
                                      : hasPaidNewInstallment
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  ₹{totalInstallmentDisplay?.toLocaleString()}
                                </span>
                              </div>
                              {carriedForwardInstallment > 0 &&
                                row.installment !==
                                  carriedForwardInstallment && (
                                  <span className="text-[10px] text-gray-500 mt-1">
                                    (Prev: ₹
                                    {carriedForwardInstallment.toLocaleString()}
                                    )
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm font-semibold">
                            {carriedForwardAmount > 0 ? (
                              <div className="flex flex-col items-center">
                                <span>
                                  ₹{carriedForwardAmount.toLocaleString()}
                                </span>
                                {row.amount > 0 &&
                                  row.amount !== carriedForwardAmount && (
                                    <span className="text-[10px] text-gray-500">
                                      (Updated: ₹{row.amount?.toLocaleString()})
                                    </span>
                                  )}
                              </div>
                            ) : row.amount > 0 ? (
                              `₹${row.amount?.toLocaleString()}`
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.interest > 0 ? `₹${row?.interest}` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.fine > 0 ? `₹${row?.fine}` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.withdrawal > 0
                              ? `₹${row?.withdrawal.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.newWithdrawal > 0
                              ? `₹${row?.newWithdrawal.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center font-medium text-xs md:text-sm">
                            {isChecked ? (
                              `₹${(
                                row.installment + row.interest
                              ).toLocaleString()}`
                            ) : (
                              <span className="text-gray-400">₹0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRowAction(row)}
                              disabled={updatingMemberId === row.subUser._id}
                              className="text-xs h-8 px-2 md:text-sm md:h-9 md:px-3"
                            >
                              {updatingMemberId === row.subUser._id ? (
                                <Loader
                                  size="sm"
                                  variant="primary"
                                  type="dots"
                                  className="!gap-0"
                                  show
                                />
                              ) : (
                                "Update"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MOBILE 2-COLUMN CARD GRID */}
      <div className="md:hidden grid grid-cols-2 gap-2 mt-3">
        {filteredMemberData.map((row, index) => {
          const carriedForwardInstallment = calculateCarriedForwardInstallment(
            row.subUser._id
          );
          const carriedForwardAmount = calculateCarriedForwardAmount(
            row.subUser._id
          );

          const isChecked = shouldCheckboxBeChecked(row.subUser._id);
          const hasPaidNewInstallment =
            row.installment > carriedForwardInstallment;

          const totalInstallmentDisplay = getDisplayInstallmentValue(row);

          return (
            <div
              key={row._id}
              className="bg-green-50 border border-green-200 shadow-sm rounded-md p-2 flex flex-col gap-1"
            >
              {/* TOP: Checkbox + Name + Index */}
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxClick(row.subUser._id)}
                  className="
                    h-4 w-4 border border-gray-600
                    data-[state=checked]:bg-green-600
                    data-[state=checked]:border-green-600
                  "
                />

                <p className="font-semibold text-[11px] text-green-700 truncate flex-1 ml-2">
                  {row.subUser.subUserName}
                </p>

                <span className="text-[10px] text-green-600 ml-1">
                  #{index + 1}
                </span>
              </div>

              {/* Installment */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">હપ્તો</span>

                <span
                  className={`font-semibold ${
                    isChecked
                      ? "text-green-700"
                      : hasPaidNewInstallment
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  ₹{totalInstallmentDisplay}
                </span>
              </div>

              {/* Carried Forward Installment */}
              {carriedForwardInstallment > 0 &&
                row.installment !== carriedForwardInstallment && (
                  <div className="text-[10px] text-gray-500 text-right">
                    Prev: ₹{carriedForwardInstallment}
                  </div>
                )}

              {/* Amount */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">આ.નો ઉ.</span>
                <span className="font-semibold text-green-700">
                  {carriedForwardAmount > 0
                    ? `₹${carriedForwardAmount}`
                    : row.amount > 0
                    ? `₹${row.amount}`
                    : "-"}
                </span>
              </div>

              {/* Interest */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">વ્યાજ</span>
                <span className="font-semibold text-green-700">
                  {row.interest > 0 ? `₹${row.interest}` : "-"}
                </span>
              </div>

              {/* Fine */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">દંડ</span>
                <span className="font-semibold text-green-700">
                  {row.fine > 0 ? `₹${row.fine}` : "-"}
                </span>
              </div>

              {/* Withdrawal */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">ઉપાડ જમા</span>
                <span className="font-semibold text-green-700">
                  {row.withdrawal > 0 ? `₹${row.withdrawal}` : "-"}
                </span>
              </div>

              {/* New Withdrawal */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">નવો ઉપાડ</span>
                <span className="font-semibold text-green-700">
                  {row.newWithdrawal > 0 ? `₹${row.newWithdrawal}` : "-"}
                </span>
              </div>

              {/* Total Installment + Interest */}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">કુલ (હપ્તો+વ્યાજ)</span>
                <span className="font-semibold text-green-700">
                  {isChecked
                    ? `₹${(row.installment + row.interest).toLocaleString()}`
                    : "₹0"}
                </span>
              </div>

              {/* Update Button */}
              <button
                onClick={() => handleRowAction(row)}
                className="
                  mt-2 w-full bg-green-600 text-white py-1
                  rounded text-[10px] active:scale-95
                "
              >
                Update
              </button>
            </div>
          );
        })}
      </div>

      {memberData.length > 0 && (
        <div className="mt-6 md:mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Summary Calculations (Month)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-blue-600">
                      કુલ હપ્તા
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-blue-800">
                      ₹{calculations.totalInstallments.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 md:h-4 md:w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-green-600">
                      કુલ બ્યાજ
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-green-800">
                      ₹{calculations.totalInterest.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 md:h-4 md:w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-orange-600">
                      કુલ ઉપાડ જમા
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-orange-800">
                      ₹{calculations.totalWithdrawals.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 md:h-4 md:w-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-purple-600">
                      કુલ રકમ
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-purple-800">
                      ₹{calculations.totalName.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 md:h-4 md:w-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <MobileFooter>
        <div
          className="
    fixed bottom-0 left-0 right-0
    bg-white border-t shadow-md
    p-2
    flex flex-row items-center justify-between
     gap-1
    sm:hidden
    z-30
  "
        >
          <div className="relative">
            <button
              id="mobile-month-btn"
              onClick={() =>
                document.getElementById("mobile-month-trigger")?.click()
              }
              className="flex flex-col items-center mx-0.5 px-3"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-[10px]">Month</span>
            </button>

            {/* Hidden Select Trigger */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger
                id="mobile-month-trigger"
                className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
              >
                <SelectValue placeholder="Select month" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                side="bottom"
                align="center"
                className="z-[9999]"
              >
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + "-01").toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2) Add Month */}
          <button
            onClick={handleAddNewMonth}
            className="flex flex-col text-center items-center text-xs mx-0.5 px-3"
          >
            <Plus className="h-5 w-6 "  />
            <span className="text-[10px] tems-center">Add month</span>
          </button>

          {/* 3) Add Member Dialog */}
          <button
            onClick={() => setIsAddMemberDialogOpen(true)}
            className="flex flex-col items-center text-xs"
          >
            <IoPersonAdd className="h-5 w-5 gap-1.5 " />
            <span className="text-[10px]"> Add Member</span>
          </button>
          
          {/* 4) Hapto Dialog */}
          <button
            onClick={() => setIsHaptoDialogOpen(true)}
            className="flex flex-col items-center text-xs px-3"
          >
            <TbTransactionRupee  className="h-5 w-5"/>
            <span className="text-[10px]">Hapto</span>
          </button>
        </div>
      </MobileFooter>
    </>
  );
}