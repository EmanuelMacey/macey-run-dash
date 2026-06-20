import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, Footer, Header, PageNumber, LevelFormat } from "docx";
import fs from "fs";

const LOGO = fs.readFileSync("src/assets/maceyrunners-logo.png");
const BRAND = "1E3A8A"; // royal blue
const ACCENT = "F97316"; // orange

const FONT = "Calibri";

const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 120, line: 300 },
  alignment: opts.align || AlignmentType.LEFT,
  children: [new TextRun({ text, font: FONT, size: opts.size || 22, bold: opts.bold, color: opts.color, italics: opts.italics })],
});

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 160 },
  children: [new TextRun({ text, font: FONT, size: 36, bold: true, color: BRAND })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: "111827" })],
});

const Bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children: [new TextRun({ text, font: FONT, size: 22 })],
});

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const cell = (text, opts = {}) => new TableCell({
  borders,
  width: { size: opts.width, type: WidthType.DXA },
  shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR, color: "auto" } : undefined,
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  children: [new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT, size: 22, bold: opts.bold, color: opts.color || "111827" })],
  })],
});

const tableTwo = (rows, w1 = 6240, w2 = 3120) => new Table({
  width: { size: w1 + w2, type: WidthType.DXA },
  columnWidths: [w1, w2],
  rows: rows.map(([a, b, opts = {}]) => new TableRow({
    children: [
      cell(a, { width: w1, bold: opts.header, shade: opts.shade }),
      cell(b, { width: w2, bold: opts.header, shade: opts.shade, align: AlignmentType.RIGHT }),
    ],
  })),
});

const PB = () => new Paragraph({ children: [new PageBreak()] });

// COVER
const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 240 },
    children: [new ImageRun({ type: "png", data: LOGO, transformation: { width: 160, height: 160 } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "MACEYRUNNERS", font: FONT, size: 56, bold: true, color: BRAND })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
    children: [new TextRun({ text: "Delivery & Errands Service", font: FONT, size: 28, color: "475569" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "BUSINESS PLAN", font: FONT, size: 44, bold: true, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
    children: [new TextRun({ text: "Loan Financing Proposal — GYD $2,500,000", font: FONT, size: 24, italics: true, color: "475569" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Prepared by: Emanuel Macey, Founder & CEO", font: FONT, size: 22, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "464 East Ruimveldt, Georgetown, Guyana", font: FONT, size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Tel: +592 721-9769  |  Email: maceyrunners@gmail.com", font: FONT, size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 },
    children: [new TextRun({ text: "www.maceyrunners.com", font: FONT, size: 22, color: BRAND, bold: true })] }),
  PB(),
];

// EXECUTIVE SUMMARY
const execSummary = [
  H1("1. Executive Summary"),
  P("MaceyRunners is a Guyanese-owned delivery and errands service headquartered in Georgetown. Founded by Emanuel Macey, the company combines a custom-built digital platform (web app, PWA, real-time tracking) with a fleet of motorcycle riders to provide fast, affordable, and trackable deliveries across Georgetown and surrounding communities."),
  P("We are seeking GYD $2,500,000 in loan financing to scale the fleet to five motorcycles, hire and equip five full-time riders, expand marketing, enhance our online platform, and secure working capital for the first three months of operations."),
  P("With a projected monthly revenue of GYD $1,500,000 and projected monthly profit of GYD $800,000, the business is positioned to repay the loan comfortably within 24 months while generating sustainable long-term cash flow."),
  H2("Key Highlights"),
  Bullet("Loan amount requested: GYD $2,500,000"),
  Bullet("Projected monthly revenue: GYD $1,500,000"),
  Bullet("Projected monthly profit: GYD $800,000"),
  Bullet("Fleet expansion: 5 motorcycles, 5 insulated delivery bags, 5 riders"),
  Bullet("Service guarantee: 15–30 minute delivery window in Georgetown"),
  Bullet("Technology: Proprietary platform with GPS tracking, in-app chat, MMG payment integration"),
  PB(),
];

// BUSINESS DESCRIPTION
const bizDesc = [
  H1("2. Business Description"),
  H2("Company Overview"),
  P("MaceyRunners operates as a technology-enabled last-mile logistics company. We serve customers through three primary verticals: food and parcel deliveries, errand services (over 70 sub-services across 10 tiers), and a marketplace connecting customers to local vendors."),
  H2("Mission"),
  P("To deliver convenience, speed, and reliability to every household and business in Guyana — affordably and on time, every time."),
  H2("Vision"),
  P("To become Guyana's most trusted on-demand delivery and errands platform, empowering riders with steady income and small businesses with reliable last-mile logistics."),
  H2("Ownership"),
  P("MaceyRunners is wholly owned and operated by Emanuel Macey (Founder & CEO), supported by a small leadership team including the COO and CFO."),
  PB(),
];

// MARKET ANALYSIS
const market = [
  H1("3. Market Analysis"),
  H2("Target Market"),
  P("Our primary market is Georgetown residents and businesses aged 18–55 who value time-saving services. This includes working professionals, parents, students, the elderly, restaurants, pharmacies, and small retailers needing reliable delivery partners."),
  H2("Market Need"),
  P("Georgetown's growing population, rising disposable income from the oil sector, and increasing smartphone adoption have created strong demand for fast, trackable delivery services. Existing options are limited, inconsistent, and often lack real-time visibility."),
  H2("Competitive Advantage"),
  Bullet("Proprietary technology platform with live GPS tracking and in-app communication"),
  Bullet("15–30 minute delivery guarantee — free delivery if exceeded without valid communication"),
  Bullet("Transparent pricing in GYD with a flat $100 service fee and per-kilometer rates"),
  Bullet("Local ownership and customer service in English and Guyanese Creolese"),
  Bullet("Multiple payment options: MMG pre-payment and Cash on Delivery"),
  PB(),
];

// LOAN PURPOSE
const loanTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [5400, 1800, 2160],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell("Item", { width: 5400, bold: true, shade: BRAND, color: "FFFFFF" }),
      cell("Qty", { width: 1800, bold: true, shade: BRAND, color: "FFFFFF", align: AlignmentType.CENTER }),
      cell("Amount (GYD)", { width: 2160, bold: true, shade: BRAND, color: "FFFFFF", align: AlignmentType.RIGHT }),
    ]}),
    new TableRow({ children: [cell("Motorcycles (delivery bikes @ $270,000 each)", { width: 5400 }), cell("5", { width: 1800, align: AlignmentType.CENTER }), cell("$1,350,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [cell("Insulated delivery bags (@ $11,000 each)", { width: 5400 }), cell("5", { width: 1800, align: AlignmentType.CENTER }), cell("$55,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [cell("Marketing & advertising campaign", { width: 5400 }), cell("—", { width: 1800, align: AlignmentType.CENTER }), cell("$45,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [cell("Online platform enhancement", { width: 5400 }), cell("—", { width: 1800, align: AlignmentType.CENTER }), cell("$30,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [cell("Salaries (first month — 5 riders + staff)", { width: 5400 }), cell("—", { width: 1800, align: AlignmentType.CENTER }), cell("$520,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [cell("Working capital (fuel, fees, contingency)", { width: 5400 }), cell("—", { width: 1800, align: AlignmentType.CENTER }), cell("$500,000", { width: 2160, align: AlignmentType.RIGHT })] }),
    new TableRow({ children: [
      cell("TOTAL LOAN REQUESTED", { width: 5400, bold: true, shade: "FEF3C7" }),
      cell("", { width: 1800, shade: "FEF3C7" }),
      cell("$2,500,000", { width: 2160, bold: true, align: AlignmentType.RIGHT, shade: "FEF3C7" }),
    ]}),
  ],
});

const loanPurpose = [
  H1("4. Loan Purpose & Use of Funds"),
  P("The requested loan of GYD $2,500,000 will be allocated across six key investment areas to launch full operations and ensure profitability from month one."),
  loanTable,
  P(""),
];

// FINANCIALS
const revenueTable = tableTwo([
  ["Projected Monthly Revenue", "GYD $1,500,000", { header: true, shade: "DBEAFE" }],
  ["Average deliveries per rider per day", "10"],
  ["Active riders", "5"],
  ["Operating days per month", "26"],
  ["Average revenue per delivery (incl. fee)", "$1,154"],
]);

const expenseTable = tableTwo([
  ["Projected Monthly Expenses", "GYD $700,000", { header: true, shade: "FEE2E2" }],
  ["Fuel", "$120,000"],
  ["Salaries (riders + staff)", "$520,000"],
  ["Marketing", "$10,000"],
  ["Service fees (payment processing)", "$30,000"],
  ["Server & platform maintenance", "$20,000"],
]);

const profitTable = tableTwo([
  ["Projected Monthly Profit", "GYD $800,000", { header: true, shade: "DCFCE7" }],
  ["Projected Annual Profit", "GYD $9,600,000"],
  ["Estimated loan repayment period", "24 months"],
]);

const financials = [
  PB(),
  H1("5. Financial Projections"),
  H2("Revenue"),
  revenueTable,
  P(""),
  H2("Operating Expenses"),
  expenseTable,
  P(""),
  H2("Profitability & Repayment"),
  profitTable,
  P(""),
  P("Revenue model: Each rider completes approximately 10 deliveries per day at an average effective price of approximately $1,154 GYD per delivery (including the $100 platform service fee and standard per-kilometre charges). Across five riders operating 26 days per month, the business projects $1,500,000 GYD in monthly gross revenue.", { italics: true }),
];

// RISK
const risk = [
  PB(),
  H1("6. Risk Assessment & Mitigation"),
  H2("Operational Risks"),
  Bullet("Fuel price increases — mitigated by per-kilometer pricing that adjusts with cost"),
  Bullet("Rider turnover — mitigated by 60/40 revenue split favoring riders and stable salaries"),
  Bullet("Motorcycle breakdowns — mitigated by routine maintenance schedule and backup units"),
  H2("Market Risks"),
  Bullet("New competitors entering Georgetown — mitigated by first-mover advantage, brand loyalty, and superior technology"),
  Bullet("Seasonal demand fluctuations — offset by errands and marketplace verticals"),
  H2("Financial Risks"),
  Bullet("Cash flow gaps — mitigated by GYD $500,000 working capital buffer included in the loan"),
  Bullet("Payment defaults — mitigated by MMG pre-payment verification and admin-confirmed transactions"),
];

// CONCLUSION
const conclusion = [
  PB(),
  H1("7. Conclusion"),
  P("MaceyRunners is a market-ready, technology-driven delivery business with a proven platform, a defined service area, and a clear path to profitability. The requested loan of GYD $2,500,000 will allow us to launch a full five-rider operation, capture the growing Georgetown delivery market, and generate strong, repeatable monthly profit of GYD $800,000."),
  P("We are committed, transparent, and ready to put the funds to work. We respectfully request the bank's support in financing the next phase of MaceyRunners."),
  P(""),
  P(""),
  P("Sincerely,", { size: 22 }),
  P(""),
  P("_____________________________", { size: 22 }),
  P("Emanuel Macey", { bold: true, size: 24 }),
  P("Founder & CEO, MaceyRunners", { size: 22 }),
  P("Tel: +592 721-9769  |  maceyrunners@gmail.com", { size: 22 }),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "MaceyRunners — Business Plan", font: FONT, size: 18, color: "94A3B8", italics: true })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "MaceyRunners Delivery & Errands  •  Georgetown, Guyana  •  Page ", font: FONT, size: 18, color: "94A3B8" }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "94A3B8" }),
      ],
    })] }) },
    children: [
      ...cover,
      ...execSummary,
      ...bizDesc,
      ...market,
      ...loanPurpose,
      ...financials,
      ...risk,
      ...conclusion,
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync("/mnt/documents/MaceyRunners_Business_Plan.docx", buf);
console.log("OK", buf.length);
