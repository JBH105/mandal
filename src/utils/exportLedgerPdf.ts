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
  /* ================= FONT SETUP ================= */

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

  /* ================= CALCULATE METRICS ================= */

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

  /* ================= TABLE BODY ================= */

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

  // Data rows
  rows.forEach((row: any, index: number) => {
    const installmentInfo = getDisplayInstallmentValue(row);
    const interestInfo = getDisplayInterestValue(row);
    const carriedForward = calculateCarriedForwardAmount(row?.subUser?._id);

    const rowColor = index % 2 === 0 ? "#f5f5f5" : "#ffffff";

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
      { text: carriedForward > 0 ? `₹${carriedForward}` : "-", alignment: "right", fontSize: 7, fillColor: rowColor },
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

  /* ================= PDF CONTENT ================= */

  const content: any[] = [
    // 🎯 HEADER
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                { text: mandalName, fontSize: 16, bold: true, color: "#2a2a2a", alignment: "center" },
                { text: `મહિનો: ${selectedMonth}`, fontSize: 11, color: "#666666", alignment: "center", margin: [0, 3, 0, 0] },
              ],
              fillColor: "#e8e8e8",
              border: [false, false, false, false],
              margin: [0, 8, 0, 8],
            },
          ],
        ],
      },
      layout: "noBorders",
      margin: [0, 0, 0, 15],
    },

    // 📊 KEY METRICS (Gray & White)
    {
      columns: [
        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    { text: "કુલ સભ્યો", fontSize: 8, color: "#666666", alignment: "center" },
                    { text: rows.length.toString(), fontSize: 20, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 5, 0, 0] },
                  ],
                  fillColor: "#f0f0f0",
                  border: [false, false, false, false],
                  margin: [0, 10, 0, 10],
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
                  stack: [
                    { text: "કુલ હપ્તો", fontSize: 8, color: "#666666", alignment: "center" },
                    { text: `₹${totalInstallment}`, fontSize: 20, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 5, 0, 0] },
                  ],
                  fillColor: "#ffffff",
                  border: [true, true, true, true],
                  borderColor: ["#cccccc", "#cccccc", "#cccccc", "#cccccc"],
                  margin: [0, 10, 0, 10],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => "#cccccc",
            vLineColor: () => "#cccccc",
          },
          margin: [0, 0, 3, 0],
        },

        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    { text: "કુલ વ્યાજ", fontSize: 8, color: "#666666", alignment: "center" },
                    { text: `₹${totalInterest}`, fontSize: 20, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 5, 0, 0] },
                  ],
                  fillColor: "#f0f0f0",
                  border: [false, false, false, false],
                  margin: [0, 10, 0, 10],
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
                  stack: [
                    { text: "કુલ યોગ", fontSize: 8, color: "#666666", alignment: "center" },
                    { text: `₹${grandTotal}`, fontSize: 20, bold: true, color: "#2a2a2a", alignment: "center", margin: [0, 5, 0, 0] },
                  ],
                  fillColor: "#ffffff",
                  border: [true, true, true, true],
                  borderColor: ["#cccccc", "#cccccc", "#cccccc", "#cccccc"],
                  margin: [0, 10, 0, 10],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => "#cccccc",
            vLineColor: () => "#cccccc",
          },
        },
      ],
      margin: [0, 0, 0, 12],
    },

    // 📈 SECONDARY METRICS
    {
      columns: [
        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  columns: [
                    { text: "કુલ દંડ:", fontSize: 8, color: "#666666", width: "auto" },
                    { text: `₹${totalFine}`, fontSize: 9, bold: true, color: "#2a2a2a", width: "*", alignment: "right" },
                  ],
                  fillColor: "#e8e8e8",
                  border: [false, false, false, false],
                  margin: [8, 6, 8, 6],
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
                  columns: [
                    { text: "કુલ પેન્ડિંગ:", fontSize: 8, color: "#666666", width: "auto" },
                    { text: `₹${totalPending}`, fontSize: 9, bold: true, color: "#2a2a2a", width: "*", alignment: "right" },
                  ],
                  fillColor: "#ffffff",
                  border: [true, true, true, true],
                  borderColor: ["#cccccc", "#cccccc", "#cccccc", "#cccccc"],
                  margin: [8, 6, 8, 6],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => "#cccccc",
            vLineColor: () => "#cccccc",
          },
          margin: [0, 0, 3, 0],
        },
        {
          width: "*",
          table: {
            widths: ["*"],
            body: [
              [
                {
                  columns: [
                    { text: "આગળનો ઉધાર:", fontSize: 8, color: "#666666", width: "auto" },
                    { text: `₹${totalCarriedForward}`, fontSize: 9, bold: true, color: "#2a2a2a", width: "*", alignment: "right" },
                  ],
                  fillColor: "#e8e8e8",
                  border: [false, false, false, false],
                  margin: [8, 6, 8, 6],
                },
              ],
            ],
          },
          layout: "noBorders",
        },
      ],
      margin: [0, 0, 0, 18],
    },

    // 📋 TABLE TITLE
    {
      text: "સભ્યોની વિગતવાર માહિતી",
      fontSize: 11,
      bold: true,
      color: "#2a2a2a",
      margin: [0, 0, 0, 8],
    },

    // 📊 DATA TABLE
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
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    },
  ];

  /* ================= PDF DEFINITION ================= */

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