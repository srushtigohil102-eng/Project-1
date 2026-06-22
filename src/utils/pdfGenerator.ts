import PDFDocument from 'pdfkit';

export interface IPayslipData {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentDate: Date;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

export const generatePayslipPDF = (data: IPayslipData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => reject(err));

      // ===== HEADER SECTION =====
      doc.fontSize(20).font('Helvetica-Bold')
        .text('HRMS Enterprise', { align: 'center' });
      
      doc.moveDown(0.3);
      doc.fontSize(16).font('Helvetica-Bold')
        .text('SALARY SLIP', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
        .text(`${data.month} ${data.year}`, { align: 'center' });

      doc.moveDown(1);
      doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // ===== EMPLOYEE DETAILS =====
      doc.fontSize(12).font('Helvetica-Bold')
        .text('Employee Details', { underline: true });
      doc.moveDown(0.3);

      const employeeDetails = [
        { label: 'Name:', value: data.employeeName },
        { label: 'Employee ID:', value: data.employeeId },
        { label: 'Designation:', value: data.designation },
        { label: 'Department:', value: data.department },
      ];

      // Left side details
      let yPos = doc.y;
      employeeDetails.forEach((item, index) => {
        doc.font('Helvetica-Bold').text(item.label, 50, yPos + (index * 25), { continued: true });
        doc.font('Helvetica').text(` ${item.value}`);
      });

      // Right side - Payment date
      doc.font('Helvetica-Bold').text('Payment Date:', 350, yPos, { continued: true });
      doc.font('Helvetica').text(` ${data.paymentDate.toLocaleDateString('en-IN')}`);

      doc.moveDown(1.5);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // ===== EARNINGS TABLE =====
      doc.font('Helvetica-Bold').fontSize(12)
        .text('EARNINGS', { underline: true });
      doc.moveDown(0.3);

      const earnY = doc.y;
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Description', 50, earnY)
        .text('Amount (₹)', 450, earnY, { align: 'right' });
      
      doc.moveDown(0.5);
      data.earnings.forEach((item) => {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10)
          .text(item.name, 50, y)
          .text(item.amount.toLocaleString('en-IN'), 450, y, { align: 'right' });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.3);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      // Gross Salary
      const grossY = doc.y;
      doc.font('Helvetica-Bold').fontSize(11)
        .text('Gross Salary', 50, grossY)
        .text(data.grossSalary.toLocaleString('en-IN'), 450, grossY, { align: 'right' });
      doc.moveDown(1);

      // ===== DEDUCTIONS TABLE =====
      doc.font('Helvetica-Bold').fontSize(12)
        .text('DEDUCTIONS', { underline: true });
      doc.moveDown(0.3);

      const dedY = doc.y;
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Description', 50, dedY)
        .text('Amount (₹)', 450, dedY, { align: 'right' });
      
      doc.moveDown(0.5);
      data.deductions.forEach((item) => {
        const y = doc.y;
        doc.font('Helvetica').fontSize(10)
          .text(item.name, 50, y)
          .text(item.amount.toLocaleString('en-IN'), 450, y, { align: 'right' });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.3);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      // Total Deductions
      const totalDedY = doc.y;
      doc.font('Helvetica-Bold').fontSize(11)
        .text('Total Deductions', 50, totalDedY)
        .text(data.totalDeductions.toLocaleString('en-IN'), 450, totalDedY, { align: 'right' });
      doc.moveDown(0.5);

      // ===== NET SALARY =====
      doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);
      
      const netY = doc.y;
      doc.font('Helvetica-Bold').fontSize(14)
        .text('NET SALARY', 50, netY)
        .text(`₹ ${data.netSalary.toLocaleString('en-IN')}`, 450, netY, { align: 'right' });
      
      doc.moveDown(1);
      doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // ===== AMOUNT IN WORDS =====
      doc.fontSize(10).font('Helvetica')
        .text(`Amount in Words: ${numberToWords(data.netSalary)}`, { align: 'center' });

      doc.moveDown(1);
      
      // ===== FOOTER =====
      doc.fontSize(9).font('Helvetica')
        .text('This is a computer generated document. No signature required.', { align: 'center' });
      
      doc.fontSize(8)
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

      if (data.bankDetails) {
        doc.moveDown(0.5);
        doc.fontSize(9)
          .text(`Bank: ${data.bankDetails.bankName} | Account: ${data.bankDetails.accountNumber} | IFSC: ${data.bankDetails.ifscCode}`, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(Math.floor(num)) + ' Rupees Only';
}