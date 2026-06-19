import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, PageBreak, Footer, Header, BorderStyle, WidthType, Table, TableRow, TableCell } from 'docx';

const outDocx = '/mnt/documents/MaceyRunners-Loan-Proposal-v3.docx';
const logoPath = '/dev-server/src/assets/logo.png';
const logo = fs.readFileSync(logoPath);
const accent = 'D29A2E';
const text = '111111';
const owner = 'Emanuel Macey';
const company = 'MaceyRunners Delivery & Errands Service';
const address = '464 East Ruimveldt, Georgetown, Guyana';
const contact = '721-9769 | maceyrunners@gmail.com';
const dateText = 'June 19, 2026';

const page = { size: { width: 12240, height: 15840 }, margin: { top: 1260, right: 900, bottom: 900, left: 900 } };
const noBorders = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } };
const baseText = (textValue, opts = {}) => new TextRun({ text: textValue, font: 'Times New Roman', size: opts.size ?? 28, bold: opts.bold ?? false, color: opts.color ?? text, italics: opts.italics ?? false, break: opts.break ?? 0 });
const body = (txt) => new Paragraph({ spacing: { after: 180, line: 360 }, children: [baseText(txt, { size: 28 })] });
const list = (txt) => new Paragraph({ indent: { left: 480 }, spacing: { after: 120, line: 340 }, children: [baseText(txt, { size: 28 })] });
const section = (txt) => new Paragraph({ spacing: { before: 120, after: 160 }, children: [baseText(txt, { size: 32, bold: true })] });
const centerLabel = (txt) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 140 }, children: [baseText(txt, { size: 28, bold: true })] });

const header = new Header({
  children: [new Table({
    width: { size: 10440, type: WidthType.DXA },
    columnWidths: [1200, 8040, 1200],
    borders: { ...noBorders, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 1200, type: WidthType.DXA }, borders: noBorders, children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 56, height: 56 } })] })] }),
      new TableCell({ width: { size: 8040, type: WidthType.DXA }, borders: noBorders, children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [baseText('MACEYRUNNERS DELIVERY & ERRANDS', { size: 40, bold: true, color: accent })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 2 } }, children: [baseText(address, { size: 24 })] }),
      ] }),
      new TableCell({ width: { size: 1200, type: WidthType.DXA }, borders: noBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 56, height: 56 } })] })] }),
    ] })]
  })]
});
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [baseText(`${address} | ${contact}`, { size: 22 })] })] });

const children = [
  new Paragraph({ spacing: { before: 280, after: 180 }, children: [baseText('BUSINESS PROPOSAL', { size: 36, bold: true })] }),
  new Paragraph({ spacing: { after: 220 }, children: [baseText('FOR LOAN FINANCING – GYD $2,500,000', { size: 34, bold: true })] }),
  new Paragraph({ spacing: { after: 140 }, children: [baseText('Business Name: ', { size: 28, bold: true }), baseText(company, { size: 28 })] }),
  new Paragraph({ spacing: { after: 140 }, children: [baseText('Owner: ', { size: 28, bold: true }), baseText(owner, { size: 28 })] }),
  new Paragraph({ spacing: { after: 140 }, children: [baseText('Location: ', { size: 28, bold: true }), baseText(address, { size: 28 })] }),
  new Paragraph({ spacing: { after: 220 }, children: [baseText('Date: ', { size: 28, bold: true }), baseText(dateText, { size: 28 })] }),
  section('1. Executive Summary'),
  body('MaceyRunners Delivery & Errands Service is a growing Guyana-based delivery business serving customers across Georgetown and surrounding communities. The business provides quick, reliable delivery and errand solutions for food, groceries, packages, and everyday customer requests through a digital ordering platform and rider network.'),
  body('We are requesting a loan of GYD $2,500,000 to expand operational capacity through the purchase of additional motorcycles, delivery bags, staff support, marketing, platform enhancement, and working capital. This financing will position the business for stronger daily coverage, faster delivery performance, and improved customer experience after reopening.'),
  section('2. Business Description'),
  body('MaceyRunners operates as a technology-supported delivery and errand service with a strong focus on speed, accessibility, and convenience. The business model is designed to meet the growing demand for same-day local delivery while maintaining a lean structure that can scale efficiently as order volume increases.'),
  new Paragraph({ children: [new PageBreak()] }),
  centerLabel('Services Offered:'),
  list('Food delivery from restaurants and shops'),
  list('Grocery and household item delivery'),
  list('Package and parcel pickup/drop-off'),
  list('Errand services for individuals and businesses'),
  list('Priority delivery for urgent customer requests'),
  section('3. Market Analysis'),
  body('The business serves an urban market where customers value fast service, convenience, and reliable communication. Georgetown has strong daily demand for delivery support from households, workers, students, and small businesses that need timely movement of food, groceries, documents, and retail items.'),
  centerLabel('Target Market:'),
  list('Busy households and working professionals'),
  list('Students and parents requiring convenience purchases'),
  list('Small businesses needing same-day deliveries'),
  list('Online shoppers and marketplace customers'),
  centerLabel('Competitive Advantage:'),
  list('Fast local delivery with improved rider capacity'),
  list('Digital platform for orders, updates, and customer convenience'),
  list('Flexible service mix covering both deliveries and errands'),
  list('Strong local brand presence and customer familiarity'),
  new Paragraph({ children: [new PageBreak()] }),
  section('4. Purpose of the Loan'),
  body('The GYD $2,500,000 loan will be used as follows:'),
  list('Motorcycles (5 bikes @ GYD $270,000): GYD $1,350,000'),
  list('Delivery bags (5 bags @ GYD $11,000): GYD $55,000'),
  list('Marketing and brand promotion: GYD $45,000'),
  list('Online platform enhancement: GYD $30,000'),
  list('Salary support / staffing: GYD $520,000'),
  list('Working capital reserve: GYD $500,000'),
  body('This investment will expand delivery coverage, improve operational readiness, support staffing during ramp-up, and strengthen the platform used by customers to place and track orders.'),
  section('5. Financial Projections'),
  list('Projected Monthly Revenue: GYD $1,500,000'),
  list('Projected Monthly Expenses: GYD $700,000'),
  list('Projected Monthly Profit: GYD $800,000'),
  body('Estimated monthly expenses include fuel (GYD $120,000), salary (GYD $520,000), marketing (GYD $10,000), service fees (GYD $30,000), and server maintenance (GYD $20,000). These projections show sufficient monthly margin to support loan repayment while maintaining growth.'),
  section('6. Loan Repayment Plan'),
  body('We propose to repay the loan over 24–36 months through monthly installments funded from business revenue and operating profit. With projected monthly profit of GYD $800,000, the business is positioned to meet repayment obligations while continuing to invest in service quality and market expansion.'),
  new Paragraph({ children: [new PageBreak()] }),
  section('7. Management & Operations'),
  body('The business is led by Emanuel Macey and supported by a rider-focused operating model. Daily operations include order intake, dispatch coordination, customer communication, delivery execution, and platform management. With additional bikes and staff support, MaceyRunners will be able to improve delivery capacity, reduce delays, and operate with stronger consistency.'),
  section('8. Risk Assessment'),
  centerLabel('Potential Risks:'),
  list('Fuel cost increases and general operating cost inflation'),
  list('Competition from informal riders and other delivery services'),
  list('Temporary fluctuations in customer demand'),
  list('Maintenance downtime affecting rider availability'),
  centerLabel('Mitigation Strategies:'),
  list('Maintain disciplined pricing and route efficiency'),
  list('Use marketing to strengthen visibility and repeat usage'),
  list('Keep working capital reserves for short-term stability'),
  list('Schedule preventive maintenance and stagger rider availability'),
  new Paragraph({ children: [new PageBreak()] }),
  section('9. Conclusion'),
  body('MaceyRunners Delivery & Errands Service is positioned for structured growth, with a clear use for financing and a realistic path to stronger revenue. The requested loan will directly improve delivery capacity, staffing readiness, customer experience, and digital operations.'),
  body('We respectfully request the bank’s support in approving this financing so the business can reopen stronger, scale responsibly, and serve more customers across Georgetown with speed and reliability.'),
  new Paragraph({ spacing: { before: 240, after: 160 }, children: [baseText('....................................', { size: 28 })] }),
  new Paragraph({ spacing: { after: 140 }, children: [baseText('Prepared by:', { size: 28, bold: true })] }),
  new Paragraph({ spacing: { after: 120 }, children: [baseText(owner, { size: 28 })] }),
  new Paragraph({ spacing: { after: 120 }, children: [baseText(company, { size: 28 })] }),
  new Paragraph({ spacing: { after: 120 }, children: [baseText(contact, { size: 28 })] }),
];

const doc = new Document({ sections: [{ properties: { page }, headers: { default: header }, footers: { default: footer }, children }], styles: { default: { document: { run: { font: 'Times New Roman', size: 28, color: text } } } } });
fs.writeFileSync(outDocx, await Packer.toBuffer(doc));
console.log(outDocx);
