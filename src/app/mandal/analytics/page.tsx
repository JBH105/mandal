import {
  getMandalsService,
  getMandalSubUsersService,
  getMonthService,
  getMemberDataService,
} from "@/services/mandal.service";
import AnalyticsPage from "@/components/pages/mandal/analytics/AnalyticsPage";

export default async function Analytics(props: {
  searchParams?: Promise<{ monthId?: string }>;
}) {
  try {
    const searchParams = props.searchParams ? await props.searchParams : {};

    const [mandals, subUsers, monthsData] = await Promise.all([
      getMandalsService(),
      getMandalSubUsersService(),
      getMonthService(),
    ]);

    const allMonthsData = await Promise.all(
      (monthsData || []).map(async (m: any) => {
        const data = await getMemberDataService(m._id);
        return {
          monthId: m._id,
          data,
        };
      }),
    );

    let activeMonthId = searchParams.monthId;
    let initialSelectedMonth = "";
    if (!activeMonthId && monthsData && monthsData.length > 0) {
      activeMonthId = monthsData[0]._id;
      initialSelectedMonth = monthsData[0].month;
    } else if (activeMonthId) {
      const matchingMonth = monthsData.find(
        (m: any) => m._id === activeMonthId,
      );
      if (matchingMonth) {
        initialSelectedMonth = matchingMonth.month;
      }
    }

    let memberData = [];
    if (activeMonthId) {
      memberData = await getMemberDataService(activeMonthId);
    }

    return (
      <AnalyticsPage
        initialMandals={mandals}
        initialSubUsers={subUsers}
        initialMonths={monthsData}
        initialMemberData={memberData}
        initialSelectedMonth={initialSelectedMonth}
        selectallMonthsData={allMonthsData}
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
