import {
  getMandalsService,
  getMandalSubUsersService,
  getMonthService,
  getMemberDataService,
} from "@/services/mandal.service";
import AnnualRecord from "@/components/anualRecord/anulRecod";

export default async function AnnualRecordPageWrapper() {
  try {
    const [mandals, subUsers, monthsData] = await Promise.all([
      getMandalsService(),
      getMandalSubUsersService(),
      getMonthService(),
    ]);

    const allMonthsData = await Promise.all(
      (monthsData || []).map(async (m: any) => {
        const data = await getMemberDataService(m._id);
        return {
          month: m.month,
          data,
        };
      }),
    );

    const currentMandal = mandals?.[0] || null;
    const currentMandalId = currentMandal?._id || null;

    const filteredUsers = currentMandalId 
      ? (subUsers || []).filter((user: any) => user.mandal === currentMandalId)
      : (subUsers || []);

    return (
      <AnnualRecord
        initialMandalName={currentMandal?.nameGu || "No Mandal Found"}
        initialAllMonthsData={allMonthsData}
        initialMonths={monthsData}
        initialUniqueMembers={filteredUsers}
      />
    );
  } catch (error) {
    return (
      <div className="p-8 text-red-500">
        Please make sure you are logged in. (Error: {String(error)})
      </div>
    );
  }
}
