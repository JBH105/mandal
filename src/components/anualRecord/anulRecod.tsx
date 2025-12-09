"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMandals,
  getMandalSubUsersApi,
  getMemberDataApi,
  getAllMonthsApi,
  MemberData,
} from "@/auth/auth";
import { SkeletonCard } from "@/components/ui/loader";
import { HiOutlineUserGroup } from "react-icons/hi";

interface Calculations {
  totalInstallments: number;
  totalAmount: number;
  totalInterest: number;
  totalFines: number;
  totalWithdrawals: number;
  totalNewWithdrawals: number;
  grandTotal: number;
  totalMembers: number;
  totalName: number;
  bandSilak: number;
  Mandalcash: number;
  interestPerPerson: number;
  perPerson: number;
}

interface SubUser {
  _id: string;
  mandal: string;
  subUserName: string;
  phoneNumber: string;
}

interface AllMonthsData {
  month: string;
  data: MemberData[];
}

export default function AnnualRecordPage() {
  const [mandalName, setMandalName] = useState<string>("આઈ શ્રી ખોડિયાર");
  const [allMonthsData, setAllMonthsData] = useState<AllMonthsData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueMembers, setUniqueMembers] = useState<SubUser[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        const mandals = await getMandals();
        if (mandals.length > 0) {
          setMandalName(mandals[0].nameGu);
          const currentMandalId = mandals[0]._id;

          const [users, allMonths] = await Promise.all([
            getMandalSubUsersApi(),
            getAllMonthsApi(),
          ]);

          const filteredUsers = users.filter(
            (user: SubUser) => user.mandal === currentMandalId
          );
          setUniqueMembers(filteredUsers);

          if (Array.isArray(allMonths) && allMonths.length > 0) {
            setMonths(allMonths);
            
            // Fetch data for ALL months
            const allMonthData: AllMonthsData[] = [];
            
            for (const month of allMonths) {
              try {
                const data: MemberData[] = await getMemberDataApi(month);
                allMonthData.push({
                  month,
                  data
                });
              } catch (error) {
                console.error(`Error fetching data for ${month}:`, error);
              }
            }
            
            setAllMonthsData(allMonthData);
          } else {
            setMonths([]);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMandalName("Error Loading Mandal");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate ANNUAL totals from ALL months data
  const calculations = useMemo(() => {
    // Combine all data from all months
    const allData = allMonthsData.flatMap(month => month.data);
    
    // Get unique members from all months
    const uniqueMemberIds = new Set(allData.map(row => row.subUser?._id).filter(Boolean));
    
    const totalInstallments = allData.reduce(
      (sum, row) => sum + (row.installment || 0),
      0
    );
    const totalAmount = allData.reduce((sum, row) => sum + (row.amount || 0), 0);
    const totalInterest = allData.reduce(
      (sum, row) => sum + (row.interest || 0),
      0
    );
    const totalFines = allData.reduce((sum, row) => sum + (row.fine || 0), 0);
    const totalWithdrawals = allData.reduce(
      (sum, row) => sum + (row.withdrawal || 0),
      0
    );
    const totalNewWithdrawals = allData.reduce(
      (sum, row) => sum + (row.newWithdrawal || 0),
      0
    );
    const totalMembers = uniqueMemberIds.size; // Count unique members across all months

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
  }, [allMonthsData]);

  // Calculate month-by-month summary
  const monthlySummaries = useMemo(() => {
    return allMonthsData.map(monthData => {
      const monthInstallments = monthData.data.reduce((sum, row) => sum + (row.installment || 0), 0);
      const monthInterest = monthData.data.reduce((sum, row) => sum + (row.interest || 0), 0);
      const monthWithdrawals = monthData.data.reduce((sum, row) => sum + (row.withdrawal || 0), 0);
      const monthNewWithdrawals = monthData.data.reduce((sum, row) => sum + (row.newWithdrawal || 0), 0);
      const monthFines = monthData.data.reduce((sum, row) => sum + (row.fine || 0), 0);
      const monthTotalName = monthInstallments + monthInterest + monthWithdrawals;
      const monthBandSilak = monthTotalName - monthNewWithdrawals;

      return {
        month: monthData.month,
        installments: monthInstallments,
        interest: monthInterest,
        withdrawals: monthWithdrawals,
        newWithdrawals: monthNewWithdrawals,
        fines: monthFines,
        totalName: monthTotalName,
        bandSilak: monthBandSilak
      };
    });
  }, [allMonthsData]);

  // Calculate possible vs actual installments
  const installmentAnalysis = useMemo(() => {
    // Assuming monthly installment is 1000 (you can get this from mandal data)
    const monthlyInstallmentAmount = 1000;
    const totalPossibleInstallments = uniqueMembers.length * months.length * monthlyInstallmentAmount;
    const totalActualInstallments = calculations.totalInstallments;
    const collectionPercentage = totalPossibleInstallments > 0 
      ? (totalActualInstallments / totalPossibleInstallments) * 100 
      : 0;

    return {
      monthlyInstallmentAmount,
      totalPossibleInstallments,
      totalActualInstallments,
      collectionPercentage,
      averageMonthlyInstallments: months.length > 0 ? calculations.totalInstallments / months.length : 0,
      averageMonthlyPerMember: uniqueMembers.length > 0 
        ? calculations.totalInstallments / months.length / uniqueMembers.length 
        : 0
    };
  }, [calculations.totalInstallments, months.length, uniqueMembers.length]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-48 md:w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-72 md:w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Annual Record - Mandal Total Summary"
        description={`View comprehensive annual summary for ${mandalName}. Data aggregated from ${months.length} months.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <HiOutlineUserGroup className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {calculations.totalMembers}
            </div>
            <p className="text-xs text-green-800">
              Across {months.length} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Annual Collection
            </CardTitle>
            <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-green-800">₹</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ₹{calculations.totalInstallments.toLocaleString()}
            </div>
            <p className="text-xs text-green-800">
              Avg: ₹{installmentAnalysis.averageMonthlyInstallments.toLocaleString()}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interest
            </CardTitle>
            <div className="h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ₹{calculations.totalInterest.toLocaleString()}
            </div>
            <p className="text-xs text-green-800">
              Annual interest earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Withdrawals</CardTitle>
            <div className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-red-600">↓</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ₹{calculations.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-red-600">
              Total withdrawals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installment Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Installment Analysis
          </CardTitle>
          <p className="text-sm text-gray-500">
            Collection performance vs potential
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Possible Installments</p>
              <p className="text-2xl font-bold">
                ₹{installmentAnalysis.totalPossibleInstallments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {uniqueMembers.length} members × {months.length} months × ₹{installmentAnalysis.monthlyInstallmentAmount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Actual Installments</p>
              <p className="text-2xl font-bold">
                ₹{installmentAnalysis.totalActualInstallments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Collected amount
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold">
                {installmentAnalysis.collectionPercentage.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(installmentAnalysis.collectionPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Monthly Breakdown
          </CardTitle>
          <p className="text-sm text-gray-500">
            Month-by-month financial summary
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-right py-3 px-4">Installments</th>
                  <th className="text-right py-3 px-4">Interest</th>
                  <th className="text-right py-3 px-4">Withdrawals</th>
                  <th className="text-right py-3 px-4">Band Silak</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.map((summary) => (
                  <tr key={summary.month} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(summary.month + '-01').toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₹{summary.installments.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₹{summary.interest.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₹{summary.withdrawals.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      ₹{summary.bandSilak.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">Annual Total</td>
                  <td className="text-right py-3 px-4">
                    ₹{calculations.totalInstallments.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    ₹{calculations.totalInterest.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    ₹{calculations.totalWithdrawals.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-green-700">
                    ₹{calculations.bandSilak.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-green-700">
            {mandalName} - મંડળ વાર્ષિક સારાંશ
          </CardTitle>
          <p className="text-sm text-gray-500">
            Comprehensive annual financial summary (Total {months.length} months)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  Total Members ( કુલ સભ્ય ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  {calculations.totalMembers}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  Total Installments ( કુલ હપ્તો ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalInstallments.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  Total Interest ( કુલ વ્યાજ ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalInterest.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  Total Withdrawals ( ઉપાડ જમા ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalWithdrawals.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                <span className="font-bold text-blue-800 text-sm md:text-base">
                  Total ( કુલ રકમ ):
                </span>
                <span className="font-bold text-lg md:text-xl text-blue-800">
                  ₹{calculations.totalName.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  New Withdrawals ( નવો ઉપાડ ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalNewWithdrawals.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200">
                <span className="font-bold text-green-800 text-sm md:text-base">
                  Band Silak ( શ્રી બંધ સિલક: )
                </span>
                <span className="font-bold text-lg md:text-xl text-green-800">
                  ₹{calculations.bandSilak.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                <span className="font-bold text-blue-800 text-sm md:text-base">
                  Grand Total ( કુલ ધીરાણા ):
                </span>
                <span className="font-bold text-lg md:text-xl text-blue-800">
                  ₹ {calculations.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-200 mt-4 md:mt-6">
            <span className="font-bold text-red-800 text-sm md:text-base">
              Mandal&apos;s cash ( મંડળની રોકડ ):
            </span>
            <span className="font-bold text-lg md:text-xl text-red-800">
              ₹ {calculations.Mandalcash.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-4 md:mt-6">
            <span className="font-bold text-green-800 text-sm md:text-base">
              per person ( વ્યક્તિ દીઠ ):
            </span>
            <span className="font-bold text-lg md:text-xl text-green-800">
              ₹ {calculations.perPerson.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-4 md:mt-6">
            <span className="font-bold text-green-800 text-sm md:text-base">
              Interest per person ( વ્યક્તિ દીઠ વ્યાજ):
            </span>
            <span className="font-bold text-lg md:text-xl text-green-800">
              ₹ {calculations.interestPerPerson.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Annual Summary Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Annual Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Monthly Average Collection</h4>
                <p className="text-2xl font-bold text-green-800">
                  ₹{installmentAnalysis.averageMonthlyInstallments.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Per month average</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Per Member Monthly</h4>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{installmentAnalysis.averageMonthlyPerMember.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Average per member per month</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Withdrawal Rate</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {((calculations.totalWithdrawals / Math.max(calculations.totalInstallments, 1)) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Of total collection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}