import { Types } from "mongoose";
export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const randomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
export const daysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
export const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `EMP${year}${random}`;
};
export const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n) => {
        if (n < 20)
            return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000)
            return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
        if (n < 100000)
            return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
        if (n < 10000000)
            return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
        return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
    };
    return convert(Math.floor(num)) + " Rupees Only";
};
export const getMonthName = (month) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
};
export const isValidObjectId = (id) => {
    return Types.ObjectId.isValid(id);
};
export const calculateAge = (dob) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};
export const calculatePF = (basicSalary) => {
    return basicSalary * 0.12;
};
export const calculateProfessionalTax = (salary) => {
    if (salary <= 30000)
        return 0;
    if (salary <= 50000)
        return 150;
    if (salary <= 75000)
        return 300;
    return 500;
};
export const calculateTDS = (salary) => {
    if (salary <= 500000)
        return 0;
    if (salary <= 1000000)
        return salary * 0.05;
    if (salary <= 1500000)
        return salary * 0.10;
    return salary * 0.15;
};
export const generatePayslipHTML = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company { font-size: 24px; font-weight: bold; }
        .title { font-size: 20px; margin-top: 10px; }
        .employee-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        .total { font-weight: bold; background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">HRMS Enterprise</div>
        <div class="title">Salary Slip - ${getMonthName(data.month)} ${data.year}</div>
      </div>
      
      <div class="employee-details">
        <strong>Employee Name:</strong> ${data.employeeName}<br>
        <strong>Employee ID:</strong> ${data.employeeId}<br>
        <strong>Designation:</strong> ${data.designation}<br>
        <strong>Department:</strong> ${data.department}
      </div>
      
      <table>
        <tr><th>Earnings</th><th>Amount (₹)</th></tr>
        ${data.earnings.map((e) => `<tr><td>${e.name}</td><td>₹${e.amount.toLocaleString()}</td></tr>`).join('')}
        <tr class="total"><td>Gross Salary</td><td>₹${data.grossSalary.toLocaleString()}</td></tr>
      </table>
      
      <table>
        <tr><th>Deductions</th><th>Amount (₹)</th></tr>
        ${data.deductions.map((d) => `<tr><td>${d.name}</td><td>₹${d.amount.toLocaleString()}</td></tr>`).join('')}
        <tr class="total"><td>Total Deductions</td><td>₹${data.totalDeductions.toLocaleString()}</td></tr>
      </table>
      
      <table>
        <tr class="total"><td>Net Salary</td><td>₹${data.netSalary.toLocaleString()}</td></tr>
      </table>
      
      <div class="footer">
        <p>Amount in Words: ${data.amountInWords}</p>
        <p>This is a computer generated document. No signature required.</p>
      </div>
    </body>
    </html>
  `;
};
