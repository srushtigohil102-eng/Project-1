import PDFDocument from 'pdfkit';

export interface IPayslipData {
  // Company Info
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  
  // Employee Info
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate?: string;
  panNumber?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  
  // Payslip Details
  month: string;
  year: number;
  paymentDate: string;
  payPeriod: string;
  
  // Financials
  earnings: Array<{ name: string; amount: number; }>;
  deductions: Array<{ name: string; amount: number; }>;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  totalEarnings: number;
}

export const generatePayslipPDF = (data: IPayslipData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        info: {
          Title: `Payslip - ${data.employeeName}`,
          Author: 'HRMS Enterprise',
          Subject: `Salary Slip ${data.month} ${data.year}`
        }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ===== COLORS =====
      const primaryColor = '#1a237e';
      const secondaryColor = '#283593';
      const accentColor = '#e8eaf6';
      const borderColor = '#c5cae9';
      const headerBgColor = '#3949ab';

      // ===== COMPANY HEADER =====
      // Company Logo Placeholder (Left aligned)
      doc.rect(50, 40, 60, 60).fill(accentColor);
      doc.fillColor(primaryColor);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('HRMS', 70, 55, { align: 'center' })
        .fontSize(10).font('Helvetica')
        .text('Enterprise', 70, 72, { align: 'center' });

      // Company Name (Center)
      doc.fillColor(primaryColor);
      doc.fontSize(18).font('Helvetica-Bold')
        .text('HRMS ENTERPRISE', 120, 45, { align: 'center' });
      
      doc.fontSize(9).font('Helvetica')
        .text('Human Resource Management System', 120, 67, { align: 'center' });

      // Company Details (Right)
      doc.fontSize(8).font('Helvetica')
        .text('www.hrms.com', 400, 45, { align: 'right' })
        .text('support@hrms.com', 400, 57, { align: 'right' })
        .text('+91 98765 43210', 400, 69, { align: 'right' });

      // Divider Line
      doc.moveDown(1);
      doc.strokeColor(primaryColor);
      doc.lineWidth(1.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      
      // ===== SALARY SLIP TITLE =====
      doc.moveDown(0.5);
      doc.fillColor(primaryColor);
      doc.fontSize(16).font('Helvetica-Bold')
        .text('SALARY SLIP', { align: 'center' });
      
      doc.fontSize(10).font('Helvetica')
        .text(`${data.month} ${data.year}`, { align: 'center' });

      doc.moveDown(0.5);
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== EMPLOYEE INFORMATION SECTION =====
      doc.moveDown(1);
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('EMPLOYEE INFORMATION', { underline: true });
      doc.moveDown(0.3);

      // Employee Details Table (2 columns)
      const leftX = 50;
      const rightX = 300;
      const rowHeight = 22;
      let infoY = doc.y;

      const employeeInfo = [
        { label: 'Employee Name', value: data.employeeName },
        { label: 'Employee ID', value: data.employeeId },
        { label: 'Designation', value: data.designation },
        { label: 'Department', value: data.department },
        { label: 'Date of Joining', value: data.joiningDate || 'N/A' },
        { label: 'PAN Number', value: data.panNumber || 'N/A' },
      ];

      // Left column
      const leftColInfo = employeeInfo.slice(0, 3);
      const rightColInfo = employeeInfo.slice(3);

      leftColInfo.forEach((item, index) => {
        const y = infoY + (index * rowHeight);
        // Background for alternating rows
        if (index % 2 === 0) {
          doc.fillColor('#f5f5f5')
            .rect(leftX, y - 3, 230, rowHeight).fill();
        }
        doc.fillColor('#333')
          .font('Helvetica-Bold').fontSize(9)
          .text(item.label + ':', leftX + 5, y)
          .font('Helvetica')
          .text(item.value, leftX + 110, y);
      });

      // Right column
      rightColInfo.forEach((item, index) => {
        const y = infoY + (index * rowHeight);
        if (index % 2 === 0) {
          doc.fillColor('#f5f5f5')
            .rect(rightX, y - 3, 250, rowHeight).fill();
        }
        doc.fillColor('#333')
          .font('Helvetica-Bold').fontSize(9)
          .text(item.label + ':', rightX + 5, y)
          .font('Helvetica')
          .text(item.value, rightX + 105, y);
      });

      // Bank Details
      if (data.bankDetails) {
        const bankY = infoY + (3 * rowHeight);
        doc.fillColor('#f5f5f5')
          .rect(leftX, bankY - 3, 480, rowHeight).fill();
        doc.fillColor('#333')
          .font('Helvetica-Bold').fontSize(9)
          .text('Bank Details:', leftX + 5, bankY)
          .font('Helvetica')
          .text(
            `${data.bankDetails.bankName} | Acct: ${data.bankDetails.accountNumber} | IFSC: ${data.bankDetails.ifscCode}`,
            leftX + 110, bankY
          );
      }

      doc.moveDown(1.5);
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== EARNINGS SECTION =====
      doc.moveDown(1);
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('EARNINGS', { underline: true });
      doc.moveDown(0.3);

      // Earnings Table Header
      const earnHeaderY = doc.y;
      doc.fillColor(headerBgColor);
      doc.rect(50, earnHeaderY - 3, 500, 25).fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Description', 55, earnHeaderY + 2)
        .text('Amount (₹)', 450, earnHeaderY + 2, { align: 'right' });

      doc.moveDown(0.8);
      let earnTotal = 0;
      
      data.earnings.forEach((item, index) => {
        const y = doc.y;
        // Alternate row background
        if (index % 2 === 0) {
          doc.fillColor('#fafafa')
            .rect(50, y - 2, 500, 22).fill();
        }
        doc.fillColor('#333');
        doc.font('Helvetica').fontSize(9)
          .text(item.name, 55, y)
          .text(item.amount.toLocaleString('en-IN'), 450, y, { align: 'right' });
        earnTotal += item.amount;
        doc.moveDown(0.6);
      });

      // Gross Salary (Earnings Total)
      doc.moveDown(0.2);
      doc.fillColor('#e8f5e9');
      doc.rect(50, doc.y - 3, 500, 28).fill();
      doc.fillColor('#2e7d32');
      doc.font('Helvetica-Bold').fontSize(11)
        .text('Total Earnings (Gross Salary)', 55, doc.y)
        .text(earnTotal.toLocaleString('en-IN'), 450, doc.y, { align: 'right' });

      doc.moveDown(1.2);
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== DEDUCTIONS SECTION =====
      doc.moveDown(1);
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('DEDUCTIONS', { underline: true });
      doc.moveDown(0.3);

      // Deductions Table Header
      const dedHeaderY = doc.y;
      doc.fillColor(headerBgColor);
      doc.rect(50, dedHeaderY - 3, 500, 25).fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Description', 55, dedHeaderY + 2)
        .text('Amount (₹)', 450, dedHeaderY + 2, { align: 'right' });

      doc.moveDown(0.8);
      let dedTotal = 0;
      
      data.deductions.forEach((item, index) => {
        const y = doc.y;
        if (index % 2 === 0) {
          doc.fillColor('#fafafa')
            .rect(50, y - 2, 500, 22).fill();
        }
        doc.fillColor('#333');
        doc.font('Helvetica').fontSize(9)
          .text(item.name, 55, y)
          .text(item.amount.toLocaleString('en-IN'), 450, y, { align: 'right' });
        dedTotal += item.amount;
        doc.moveDown(0.6);
      });

      // Total Deductions
      doc.moveDown(0.2);
      doc.fillColor('#fce4ec');
      doc.rect(50, doc.y - 3, 500, 28).fill();
      doc.fillColor('#c62828');
      doc.font('Helvetica-Bold').fontSize(11)
        .text('Total Deductions', 55, doc.y)
        .text(dedTotal.toLocaleString('en-IN'), 450, doc.y, { align: 'right' });

      doc.moveDown(1.2);
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== NET PAY SECTION =====
      doc.moveDown(0.8);
      const netY = doc.y;
      
      // Net Salary Box
      doc.fillColor('#1a237e');
      doc.rect(50, netY, 500, 45).fill();
      
      doc.fillColor('#ffffff');
      doc.fontSize(16).font('Helvetica-Bold')
        .text('NET SALARY', 60, netY + 10);
      
      doc.fontSize(18)
        .text(`₹ ${data.netSalary.toLocaleString('en-IN')}`, 400, netY + 10, { align: 'right' });

      doc.moveDown(2);

      // ===== AMOUNT IN WORDS =====
      doc.fillColor('#333');
      doc.fontSize(10).font('Helvetica')
        .text(`Amount in Words: ${numberToWords(data.netSalary)}`, { align: 'center' });

      // ===== PAYMENT DETAILS =====
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica')
        .text(`Payment Date: ${data.paymentDate}`, { align: 'center' })
        .text(`Pay Period: ${data.payPeriod || `${data.month} ${data.year}`}`, { align: 'center' });

      // ===== FOOTER =====
      doc.moveDown(1);
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      doc.moveDown(0.3);
      doc.fillColor('#888');
      doc.fontSize(8).font('Helvetica')
        .text('This is a computer generated document. No signature required.', { align: 'center' })
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

      // Watermark (optional - faint background)
      // doc.fillColor('#f0f0f0').fontSize(60).font('Helvetica-Bold')
      //   .text('PAID', 200, 400, { align: 'center', opacity: 0.1 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper: Convert number to words
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