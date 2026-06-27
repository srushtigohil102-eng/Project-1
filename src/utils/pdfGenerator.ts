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

// Generate payslip PDF and return as Buffer (for streaming)
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
      
      // Collect PDF data chunks
      doc.on('data', (chunk) => buffers.push(chunk));
      
      // Resolve with complete buffer
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      
      doc.on('error', (err) => reject(err));

      // ===== COLORS =====
      const primaryColor = '#1a237e';
      const secondaryColor = '#283593';
      const accentColor = '#e8eaf6';
      const borderColor = '#c5cae9';
      const headerBgColor = '#3949ab';

      let yPos = 40;

      // ===== COMPANY HEADER =====
      doc.rect(50, yPos, 60, 60).fill(accentColor);
      doc.fillColor(primaryColor);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('HRMS', 70, yPos + 15, { align: 'center' })
        .fontSize(10).font('Helvetica')
        .text('Enterprise', 70, yPos + 32, { align: 'center' });

      doc.fillColor(primaryColor);
      doc.fontSize(18).font('Helvetica-Bold')
        .text('HRMS ENTERPRISE', 120, yPos + 5, { align: 'center' });
      
      doc.fontSize(9).font('Helvetica')
        .text('Human Resource Management System', 120, yPos + 27, { align: 'center' });

      doc.fontSize(8).font('Helvetica')
        .text('support@hrms.com', 400, yPos + 5, { align: 'right' })
        .text('+91 98765 43210', 400, yPos + 17, { align: 'right' });

      yPos += 75;

      doc.strokeColor(primaryColor);
      doc.lineWidth(1.5);
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      
      yPos += 15;

      doc.fillColor(primaryColor);
      doc.fontSize(16).font('Helvetica-Bold')
        .text('SALARY SLIP', 50, yPos, { align: 'center' });
      
      yPos += 20;
      doc.fontSize(10).font('Helvetica')
        .text(`${data.month} ${data.year}`, 50, yPos, { align: 'center' });

      yPos += 25;
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

      yPos += 20;

      // ===== EMPLOYEE INFORMATION =====
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('EMPLOYEE INFORMATION', 50, yPos, { underline: true });
      
      yPos += 25;

      const leftX = 50;
      const rightX = 300;
      const rowHeight = 22;

      const leftInfo = [
        { label: 'Employee Name:', value: data.employeeName },
        { label: 'Employee ID:', value: data.employeeId },
        { label: 'Designation:', value: data.designation },
      ];

      const rightInfo = [
        { label: 'Department:', value: data.department },
        { label: 'Date of Joining:', value: data.joiningDate || 'N/A' },
        { label: 'PAN Number:', value: data.panNumber || 'N/A' },
      ];

      leftInfo.forEach((item, i) => {
        const y = yPos + (i * rowHeight);
        doc.fillColor('#333');
        doc.font('Helvetica-Bold').fontSize(9)
          .text(item.label, leftX, y);
        doc.font('Helvetica')
          .text(item.value, leftX + 110, y);
      });

      rightInfo.forEach((item, i) => {
        const y = yPos + (i * rowHeight);
        doc.fillColor('#333');
        doc.font('Helvetica-Bold').fontSize(9)
          .text(item.label, rightX, y);
        doc.font('Helvetica')
          .text(item.value, rightX + 100, y);
      });

      yPos += (leftInfo.length * rowHeight) + 5;

      if (data.bankDetails) {
        doc.fillColor('#333');
        doc.font('Helvetica-Bold').fontSize(9)
          .text('Bank Details:', leftX, yPos);
        doc.font('Helvetica')
          .text(
            `${data.bankDetails.bankName} | Acct: ${data.bankDetails.accountNumber} | IFSC: ${data.bankDetails.ifscCode}`,
            leftX + 95, yPos
          );
        yPos += 25;
      } else {
        yPos += 5;
      }

      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

      yPos += 20;

      // ===== EARNINGS =====
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('EARNINGS', 50, yPos, { underline: true });
      
      yPos += 25;

      const earnStartY = yPos;
      doc.fillColor(headerBgColor);
      doc.rect(50, earnStartY, 350, 22).fill();
      doc.rect(400, earnStartY, 150, 22).fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold').fontSize(9)
        .text('Description', 55, earnStartY + 5)
        .text('Amount (₹)', 450, earnStartY + 5, { align: 'right' });

      yPos = earnStartY + 22;
      let earnTotal = 0;
      
      data.earnings.forEach((item, i) => {
        const y = yPos;
        if (i % 2 === 0) {
          doc.fillColor('#fafafa')
            .rect(50, y, 500, 20).fill();
        }
        doc.fillColor('#333');
        doc.font('Helvetica').fontSize(9)
          .text(item.name, 55, y + 3)
          .text(item.amount.toLocaleString('en-IN'), 450, y + 3, { align: 'right' });
        earnTotal += item.amount;
        yPos += 20;
      });

      yPos += 5;
      doc.fillColor('#e8f5e9');
      doc.rect(50, yPos, 350, 25).fill();
      doc.rect(400, yPos, 150, 25).fill();
      
      doc.fillColor('#2e7d32');
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Total Earnings (Gross Salary)', 55, yPos + 6)
        .text(earnTotal.toLocaleString('en-IN'), 450, yPos + 6, { align: 'right' });

      yPos += 30;
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

      yPos += 20;

      // ===== DEDUCTIONS =====
      doc.fillColor(secondaryColor);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('DEDUCTIONS', 50, yPos, { underline: true });
      
      yPos += 25;

      const dedStartY = yPos;
      doc.fillColor(headerBgColor);
      doc.rect(50, dedStartY, 350, 22).fill();
      doc.rect(400, dedStartY, 150, 22).fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold').fontSize(9)
        .text('Description', 55, dedStartY + 5)
        .text('Amount (₹)', 450, dedStartY + 5, { align: 'right' });

      yPos = dedStartY + 22;
      let dedTotal = 0;
      
      data.deductions.forEach((item, i) => {
        const y = yPos;
        if (i % 2 === 0) {
          doc.fillColor('#fafafa')
            .rect(50, y, 500, 20).fill();
        }
        doc.fillColor('#333');
        doc.font('Helvetica').fontSize(9)
          .text(item.name, 55, y + 3)
          .text(item.amount.toLocaleString('en-IN'), 450, y + 3, { align: 'right' });
        dedTotal += item.amount;
        yPos += 20;
      });

      yPos += 5;
      doc.fillColor('#fce4ec');
      doc.rect(50, yPos, 350, 25).fill();
      doc.rect(400, yPos, 150, 25).fill();
      
      doc.fillColor('#c62828');
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Total Deductions', 55, yPos + 6)
        .text(dedTotal.toLocaleString('en-IN'), 450, yPos + 6, { align: 'right' });

      yPos += 35;

      // ===== NET SALARY =====
      doc.strokeColor('#1a237e');
      doc.lineWidth(2);
      doc.rect(50, yPos, 500, 50).stroke();
      
      doc.fillColor('#1a237e');
      doc.rect(50, yPos, 500, 50).fill();
      
      doc.fillColor('#ffffff');
      doc.fontSize(16).font('Helvetica-Bold')
        .text('NET SALARY', 60, yPos + 14);
      
      doc.fontSize(18)
        .text(`₹ ${data.netSalary.toLocaleString('en-IN')}`, 400, yPos + 12, { align: 'right' });

      yPos += 65;

      // ===== AMOUNT IN WORDS =====
      doc.fillColor('#333');
      doc.fontSize(10).font('Helvetica')
        .text(`Amount in Words: ${numberToWords(data.netSalary)}`, 50, yPos, { align: 'center' });

      yPos += 25;

      // ===== PAYMENT DETAILS =====
      doc.fontSize(9).font('Helvetica')
        .text(`Payment Date: ${data.paymentDate}`, 50, yPos, { align: 'center' })
        .text(`Pay Period: ${data.payPeriod || `${data.month} ${data.year}`}`, 50, yPos + 15, { align: 'center' });

      yPos += 45;

      // ===== FOOTER =====
      doc.strokeColor(borderColor);
      doc.lineWidth(1);
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

      yPos += 15;
      doc.fillColor('#888');
      doc.fontSize(8).font('Helvetica')
        .text('This is a computer generated document. No signature required.', 50, yPos, { align: 'center' })
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, yPos + 15, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper: Convert number to words
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  
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