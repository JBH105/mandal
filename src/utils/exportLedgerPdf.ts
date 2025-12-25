import pdfMake from "pdfmake/build/pdfmake";

export async function exportLedgerPdf({
  mandalName,
  selectedMonth,
  rows,
  calculateCarriedForwardAmount,
  getDisplayInstallmentValue,
  getDisplayInterestValue,
}: {
  mandalName: string;
  selectedMonth: string;
  rows: any[];
  calculateCarriedForwardAmount: (id: string) => number;
  getDisplayInstallmentValue: (row: any) => {
    value: number;
    hasPending: boolean;
    pendingAmount: number;
  };
  getDisplayInterestValue: (row: any) => {
    value: number;
    hasPending: boolean;
    pendingAmount: number;
  };
}) {

  const regularFont = await fetch("/fonts/NotoSansGujarati-Regular.ttf");
  const boldFont = await fetch("/fonts/NotoSansGujarati-Bold.ttf");

  const regularBase64 = Buffer.from(await regularFont.arrayBuffer()).toString("base64");
  const boldBase64 = Buffer.from(await boldFont.arrayBuffer()).toString("base64");

  (pdfMake as any).vfs = {
    "NotoSansGujarati-Regular.ttf": regularBase64,
    "NotoSansGujarati-Bold.ttf": boldBase64,
  };

  (pdfMake as any).fonts = {
    Gujarati: {
      normal: "NotoSansGujarati-Regular.ttf",
      bold: "NotoSansGujarati-Bold.ttf",
    },
  };


  let totalInstallment = 0;
  let totalCarriedForward = 0;
  let totalInterest = 0;
  let totalFine = 0;
  let totalPaidWithdrawal = 0;
  let totalNewWithdrawal = 0;
  let grandTotal = 0;
  let totalPending = 0;

  rows.forEach((row: any) => {
    const installmentInfo = getDisplayInstallmentValue(row);
    const interestInfo = getDisplayInterestValue(row);
    const carriedForward = calculateCarriedForwardAmount(row?.subUser?._id);

    totalInstallment += installmentInfo.value || 0;
    totalCarriedForward += carriedForward || 0;
    totalInterest += interestInfo.value || 0;
    totalFine += row.fine || 0;
    totalPaidWithdrawal += row.paidWithdrawal || 0;
    totalNewWithdrawal += row.newWithdrawal || 0;
    grandTotal += (row.paidInstallment || 0) + (row.paidInterest || 0);
    
    if (installmentInfo.hasPending) totalPending += installmentInfo.pendingAmount;
    if (interestInfo.hasPending) totalPending += interestInfo.pendingAmount;
  });


  const tableBody: any[] = [];

  // Header
  tableBody.push([
    { text: "ક્રમ", bold: true, alignment: "center", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "સભ્યનું નામ", bold: true, fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "હપ્તો", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "આ.નો ઉ.", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "વ્યાજ", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "દંડ", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "ઉપાડ જમા", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "નવો ઉપાડ", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
    { text: "કુલ", bold: true, alignment: "right", fillColor: "#4a4a4a", color: "#ffffff", fontSize: 8 },
  ]);

  rows.forEach((row: any, index: number) => {
    const installmentInfo = getDisplayInstallmentValue(row);
    const interestInfo = getDisplayInterestValue(row);
    const carriedForward = calculateCarriedForwardAmount(row?.subUser?._id);

    const rowColor = index % 2 === 0 ? "#fce8e8" : "#ffffff";

    tableBody.push([
      { text: index + 1, alignment: "center", fontSize: 7, fillColor: rowColor },
      { text: row.subUser?.subUserName || "-", fontSize: 7, fillColor: rowColor },
      {
        stack: [
          { text: installmentInfo.value > 0 ? `₹${installmentInfo.value}` : "-", fontSize: 7 },
          installmentInfo.hasPending ? { text: `(પેન્ડિંગ: ₹${installmentInfo.pendingAmount})`, fontSize: 5, color: "#666666" } : [],
        ],
        alignment: "right",
        fillColor: rowColor,
      },
       { text: row.withdrawal > 0 ? `₹${row.withdrawal}` : "-", alignment: "right", fontSize: 7, fillColor: rowColor },
      {
        stack: [
          { text: interestInfo.value > 0 ? `₹${interestInfo.value}` : "-", fontSize: 7 },
          interestInfo.hasPending ? { text: `(પેન્ડિંગ: ₹${interestInfo.pendingAmount})`, fontSize: 5, color: "#666666" } : [], 
        ],
        alignment: "right",
        fillColor: rowColor,
      },
      { text: row.fine > 0 ? `₹${row.fine}` : "-", alignment: "right", fontSize: 7, fillColor: rowColor },
      { text: row.paidWithdrawal > 0 ? `₹${row.paidWithdrawal}` : "-", alignment: "right", fontSize: 7, fillColor: rowColor },
      { text: row.newWithdrawal > 0 ? `₹${row.newWithdrawal}` : "-", alignment: "right", fontSize: 7, fillColor: rowColor },
      { text: `₹${(row.paidInstallment || 0) + (row.paidInterest || 0)}`, bold: true, alignment: "right", fontSize: 7, fillColor: rowColor },
    ]);
  });


  const content: any[] = [
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                { text: mandalName, fontSize: 16, bold: true, color: "#2a2a2a", alignment: "center" },
                { text: `મહિનો: ${selectedMonth}`, fontSize: 11, color: "#666666", alignment: "center", margin: [0, 2, 0, 0] },
              ],
              fillColor: "#ffffff",
              border: [false, false, false, false],
              margin: [0, 6, 0, 6],
            },
          ],
        ],
      },
      layout: "noBorders",
      margin: [0, 0, 0, 10],
    },

    {
      table: {
        widths: ["*", "*", "*", "*"],
        body: [
          [
            {
              stack: [
                { text: "કુલ સભ્યો", fontSize: 8, color: "#666666", alignment: "center" },
                { text: rows.length.toString(), fontSize: 18, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 1, 0, 0] },
              ],
              fillColor: "#ffffff",
              margin: [0, 4, 0, 4],
            },

            {
              stack: [
                { text: "કુલ હપ્તો", fontSize: 8, color: "#666666", alignment: "center" },
                { text: `₹${totalInstallment}`, fontSize: 18, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 1, 0, 0] },
              ],
              fillColor: "#ffffff",
              margin: [0, 4, 0, 4],
            },

            {
              stack: [
                { text: "કુલ વ્યાજ", fontSize: 8, color: "#666666", alignment: "center" },
                { text: `₹${totalInterest}`, fontSize: 18, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 1, 0, 0] },
              ],
              fillColor: "#ffffff",
              margin: [0, 4, 0, 4],
            },

            {
              stack: [
                { text: "કુલ યોગ", fontSize: 8, color: "#666666", alignment: "center" },
                { text: `₹${grandTotal}`, fontSize: 18, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 1, 0, 0] },
              ],
              fillColor: "#ffffff",
              margin: [0, 4, 0, 4],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: (i: number, node?: any) => (i === 0 || i === (node?.table?.body?.length || 1)) ? 1 : 0,
        vLineWidth: () => 0.5,
        hLineColor: () => "#cccccc",
        vLineColor: () => "#cccccc",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 4],
    },


    {
      columns: [
      {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: [
                    { text: "કુલ દંડ : ", fontSize: 8, color: "#666666" },
                    { text: ` ${totalFine}`, fontSize: 9, bold: true, color: "#2a2a2a" },
                  ],
                  margin: [4, 0, 4, 0],
                },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 3, 0],
        },
        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: [
                    { text: "કુલ પેન્ડિંગ: ", fontSize: 8, color: "#666666" },
                    { text: ` ${totalPending}`, fontSize: 9, bold: true, color: "#2a2a2a" },
                  ],
                  margin: [4, 0, 4, 0],
                },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 3, 0],
        },
        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: [
                    { text: "આગળનો ઉધાર: ", fontSize: 8, color: "#666666" },
                    { text: ` ${totalCarriedForward}`, fontSize: 9, bold: true, color: "#2a2a2a" },
                  ],
                  margin: [4, 0, 4, 0],
                },
              ],
            ],
          },
          layout: "noBorders",
        }
      ],
      margin: [0, 0, 0, 2],
    },



    {
      text: "સભ્યોની વિગતવાર માહિતી",
      fontSize: 10,
      bold: true,
      color: "#2a2a2a",
      margin: [0, 0, 0, 2],
    },

    {
      table: {
        headerRows: 1,
        widths: [25, 100, 55, 50, 55, 40, 55, 55, 60],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 || i === 1) ? 1.5 : 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#999999",
        vLineColor: () => "#cccccc",
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 1,
        paddingBottom: () => 1,
      },
    },
  ];


  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [20, 50, 20, 40],

    footer: (currentPage: number, pageCount: number) => ({
      text: `પાનું ${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 8,
      color: "#888888",
      margin: [0, 10, 0, 0],
    }),

    defaultStyle: {
      font: "Gujarati",
      fontSize: 7,
      color: "#2a2a2a",
    },

    content,
  };

  const fileName = `${mandalName}_${selectedMonth}_Report.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
}