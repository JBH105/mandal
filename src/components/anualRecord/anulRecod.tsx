"use client";

import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MemberData } from "@/auth/auth";

interface Month {
  _id: string;
  month: string;
  monthlyInstallment: number;
  extraExpence: number;
}

interface Calculations {
  totalInstallments: number;
  totalInterest: number;
  totalWithdrawals: number;
  totalNewWithdrawals: number;
  totalMembers: number;
  totalName: number;
  bandSilak: number;
  Mandalcash: number;
  interestPerPerson: number;
  perPerson: number;
  totalExtraExpense: number;
   totalFine: number;
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

export default function AnnualRecord({
  initialMandalName = "આઈ શ્રી ખોડિયાર",
  initialAllMonthsData = [],
  initialMonths = [],
  initialUniqueMembers = [],
}: {
  initialMandalName?: string;
  initialAllMonthsData?: AllMonthsData[];
  initialMonths?: Month[];
  initialUniqueMembers?: SubUser[];
}) {
  // Since data comes from SSR, we don't need state or loading
  const mandalName = initialMandalName;
  const allMonthsData = initialAllMonthsData;
  const months = initialMonths;
  const uniqueMembers = initialUniqueMembers;
  console.log("🚀 ~ AnnualRecord ~ uniqueMembers:", uniqueMembers)

  // Direct calculations without useMemo since props don't change in client
  const allData = allMonthsData.flatMap((m) => m.data);

  const uniqueMemberIds = new Set(
    allData.map((row) => row.subUser?._id).filter(Boolean),
  );

  const totalInstallments = allData.reduce(
    (sum, row) => sum + (row.paidInstallment || 0),
    0,
  );

  const totalInterest = allData.reduce(
    (sum, row) => sum + (row.paidInterest || 0),
    0,
  );
  
  const totalFine = allData.reduce(
    (sum, row) => sum + (row.fine || 0),
    0,
  );

  const totalWithdrawals = allData.reduce(
    (sum, row) => sum + (row.paidWithdrawal || 0),
    0,
  );

  const totalNewWithdrawals = allData.reduce(
    (sum, row) => sum + (row.newWithdrawal || 0),
    0,
  );

  const totalExtraExpense = months.reduce(
    (sum, m) => sum + (m.extraExpence || 0),
    0,
  );

  const totalMembers = uniqueMemberIds.size;

  const totalName = totalInstallments + totalInterest + totalFine;
  const bandSilak = totalName - totalNewWithdrawals - totalExtraExpense;
  const Mandalcash = bandSilak;
  const interestPerPerson =
    totalMembers > 0 ? totalInterest / totalMembers : 0;
  const perPerson = totalMembers > 0 ? bandSilak / totalMembers : 0;

  const calculations: Calculations = {
    totalInstallments,
    totalInterest,
    totalWithdrawals,
    totalNewWithdrawals,
    totalMembers,
    totalName,
    bandSilak,
    Mandalcash,
    interestPerPerson,
    perPerson,
    totalExtraExpense,
    totalFine,
  };

  // Direct monthly summaries without useMemo
  const monthlySummaries = allMonthsData.map((monthData) => {
    const monthInstallments = monthData.data.reduce(
      (sum, row) => sum + (row.paidInstallment || 0),
      0,
    );

    const monthInterest = monthData.data.reduce(
      (sum, row) => sum + (row.paidInterest || 0),
      0,
    );

    const monthWithdrawals = monthData.data.reduce(
      (sum, row) => sum + (row.paidWithdrawal || 0),
      0,
    );

    const monthNewWithdrawals = monthData.data.reduce(
      (sum, row) => sum + (row.newWithdrawal || 0),
      0,
    );

    const monthFine = monthData.data.reduce(
      (sum, row) => sum + (row.fine || 0),
      0,
    );

    const currentMonthObj = months.find((m) => m.month === monthData.month);

    const monthExtraExpense = currentMonthObj?.extraExpence || 0;

    const monthTotalName =
      monthInstallments + monthInterest + monthWithdrawals;

    const monthBandSilak =
      monthTotalName - monthNewWithdrawals - monthExtraExpense + monthFine;

    return {
      month: monthData.month,
      installments: monthInstallments,
      interest: monthInterest,
      withdrawals: monthWithdrawals,
      newWithdrawals: monthNewWithdrawals,
      totalName: monthTotalName,
      bandSilak: monthBandSilak,
      monthExtraExpense: monthExtraExpense,
      monthFine: monthFine,
    };
  });

  // Direct installment analysis without useMemo
  const totalPossibleInstallments = months.reduce((sum, m) => {
    return sum + (m.monthlyInstallment || 0) * uniqueMembers.length;
  }, 0);

  const totalActualInstallments = calculations.totalInstallments;

  const collectionPercentage =
    totalPossibleInstallments > 0
      ? (totalActualInstallments / totalPossibleInstallments) * 100
      : 0;

  const averageMonthlyInstallmentAmount =
    months.length > 0
      ? months.reduce((sum, m) => sum + (m.monthlyInstallment || 0), 0) /
        months.length
      : 0;

  const installmentAnalysis = {
    totalPossibleInstallments,
    totalActualInstallments,
    collectionPercentage,
    averageMonthlyInstallments:
      months.length > 0 ? totalActualInstallments / months.length : 0,
    averageMonthlyPerMember:
      months.length > 0 && uniqueMembers.length > 0
        ? totalActualInstallments / months.length / uniqueMembers.length
        : 0,
    averageMonthlyInstallmentAmount,
  };

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
              Avg: ₹
              {installmentAnalysis.averageMonthlyInstallments.toLocaleString()}
              /month
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
            <p className="text-xs text-green-800">Annual interest earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annual Withdrawals
            </CardTitle>
            <div className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-red-600">↓</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ₹{calculations.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-red-600">Total withdrawals</p>
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
              <p className="text-sm font-medium text-gray-600">
                Possible Installments
              </p>
              <p className="text-2xl font-bold">
                ₹
                {installmentAnalysis.totalPossibleInstallments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {uniqueMembers.length} members × {months.length} months × ₹
                {installmentAnalysis.averageMonthlyInstallmentAmount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Actual Installments
              </p>
              <p className="text-2xl font-bold">
                ₹{installmentAnalysis.totalActualInstallments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Collected amount</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Collection Rate
              </p>
              <p className="text-2xl font-bold">
                {installmentAnalysis.collectionPercentage.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(installmentAnalysis.collectionPercentage, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Monthly Breakdown</CardTitle>
          <p className="text-sm text-gray-500">
            Month-by-month financial summary
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex flex-col">
                    <span className="font-medium">Month</span>
                    <span className="text-xs text-gray-500"> મહિનાઓ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Paid Installments</span>
                    <span className="text-xs text-gray-500">ચૂકવેલ હપ્તાઓ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Paid Interest</span>
                    <span className="text-xs text-gray-500">ચૂકવેલ વ્યાજ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Fine</span>
                    <span className="text-xs text-gray-500">દંડ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">New Withdrawals</span>
                    <span className="text-xs text-gray-500">ઉપાડ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Paid Withdrawals</span>
                    <span className="text-xs text-gray-500">ચૂકવેલ ઉપાડ</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Extra Expence</span>
                    <span className="text-xs text-gray-500">વધારાનો ખર્ચો</span>
                  </div>
                </TableHead>

                <TableHead className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">Bandh Silak</span>
                    <span className="text-xs text-gray-500">બંધ સિલ્ક</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {monthlySummaries.map((summary) => (
                <TableRow key={summary.month}>
                  <TableCell>
                    {new Date(summary.month + "-01").toLocaleDateString(
                      "en-GB",
                      {
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.installments.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.interest.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.monthFine.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.newWithdrawals.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.withdrawals.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{summary.monthExtraExpense.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    ₹{summary.bandSilak.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}

              {/* Annual Total Row */}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell>Annual Total</TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalInstallments.toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalInterest.toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalFine.toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalNewWithdrawals.toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalWithdrawals.toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ₹{calculations.totalExtraExpense.toLocaleString()}
                </TableCell>

                <TableCell className="text-right text-green-700">
                  ₹{calculations.bandSilak.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-green-700">
            {mandalName} - મંડળ વાર્ષિક સારાંશ
          </CardTitle>
          <p className="text-sm text-gray-500">
            Comprehensive annual financial summary (Total {months.length}{" "}
            months)
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
                    Total Fine (કુલ દંડ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalFine.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  New Withdrawals ( નવો ઉપાડ ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{calculations.totalNewWithdrawals.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm md:text-base">
                  Extra Expense ( વધારાનો ખર્ચ ):
                </span>
                <span className="font-bold text-sm md:text-base">
                  ₹{(calculations.totalExtraExpense ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200">
                <span className="font-bold text-green-800 text-sm md:text-base">
                  Bandh Silak ( શ્રી બંધ સિલક ):
                </span>
                <span className="font-bold text-lg md:text-xl text-green-800">
                  ₹{calculations.bandSilak.toLocaleString()}
                </span>
              </div>
              {/* <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                <span className="font-bold text-blue-800 text-sm md:text-base">
                  Grand Total ( કુલ ધીરાણા ):
                </span>
                <span className="font-bold text-lg md:text-xl text-blue-800">
                  ₹ {calculations.grandTotal?.toLocaleString()}
                </span>
              </div> */}
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

   
    </>
  );
}
