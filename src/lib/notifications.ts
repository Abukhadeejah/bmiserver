import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';  // Replace PDFKit import
import { prisma } from './prisma';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotifications(bmiRecord: any) {
  try {
    const notification = await prisma.notification.create({
      data: {
        memberId: bmiRecord.memberId,
        bmiRecordId: bmiRecord.id,
      }
    });

    if (bmiRecord.member.phone) {
      await sendWhatsAppMessage(bmiRecord, notification.id);
    }

    if (bmiRecord.member.email) {
      await sendEmailReport(bmiRecord, notification.id);
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
}

async function sendWhatsAppMessage(bmiRecord: any, notificationId: number) {
  try {
    const isNewCustomer = bmiRecord.member.customerType === 'new';
    const message = getWhatsAppTemplate(bmiRecord, isNewCustomer);

    // For development, log the WhatsApp message (replace with actual WhatsApp API when ready)
    console.log('📱 WhatsApp Message would be sent to:', bmiRecord.member.phone);
    console.log('📱 Message content:', message);
    
    await prisma.notification.update({
      where: { id: notificationId },
      data: { whatsappSent: true, whatsappStatus: 'sent' }
    });
  } catch (error) {
    console.error('WhatsApp error:', error);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { whatsappStatus: 'failed' }
    });
  }
}

async function sendEmailReport(bmiRecord: any, notificationId: number) {
  try {
    const isNewCustomer = bmiRecord.member.customerType === 'new';
    const pdfBuffer = await generateHealthReportPDF(bmiRecord, isNewCustomer);
    
    const mailOptions = {
      from: process.env.GYM_EMAIL,
      to: bmiRecord.member.email,
      subject: getEmailSubject(bmiRecord.member, isNewCustomer),
      html: getEmailTemplate(bmiRecord, isNewCustomer),
      attachments: [{
        filename: `${bmiRecord.member.name.replace(/\s+/g, '-')}-Health-Report.pdf`,
        content: pdfBuffer
      }]
    };
    
    // Actually send the email
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully to:', bmiRecord.member.email);
    
    await prisma.notification.update({
      where: { id: notificationId },
      data: { emailSent: true, emailStatus: 'sent' }
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { emailStatus: 'failed' }
    });
  }
}

function getEmailSubject(member: any, isNewCustomer: boolean): string {
  return isNewCustomer 
    ? `🎉 Welcome ${member.name}! Your Fitness Report Is Ready`
    : `${member.name} - Your Fitness Report Is Ready`;
}

function getEmailTemplate(bmiRecord: any, isNewCustomer: boolean): string {
  if (isNewCustomer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 10px;">🎉 Welcome to ${process.env.GYM_NAME}!</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">Your fitness journey begins now!</p>
          
          <div style="background: linear-gradient(135deg, #e8f5e8, #d4edda); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-bottom: 15px;">Your First BMI Assessment:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>BMI:</strong> ${bmiRecord.bmi}</li>
              <li style="padding: 5px 0;"><strong>Category:</strong> ${bmiRecord.category}</li>
              <li style="padding: 5px 0;"><strong>Weight:</strong> ${bmiRecord.weight} kg</li>
              <li style="padding: 5px 0;"><strong>Height:</strong> ${bmiRecord.height} cm</li>
              <li style="padding: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3 style="color: #856404; margin-bottom: 15px;">🎁 Welcome Bonus - FREE Worth ₹3,500!</h3>
            <ul style="color: #856404;">
              <li>✅ Personalized Diet Plan</li>
              <li>✅ One-on-One Training Session</li>
              <li>✅ Complete Gym Tour with Expert</li>
            </ul>
            <p style="color: #d63384; font-weight: bold; margin-top: 15px;">⏰ Claim within 3 days of joining!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
            <p style="color: #666;">📞 Call/WhatsApp: <strong>${process.env.GYM_CONTACT}</strong></p>
            <p style="color: #666;">📍 Visit: <strong>${process.env.GYM_ADDRESS}</strong></p>
            <p style="color: #666;">Your detailed health report is attached as PDF.</p>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; text-align: center;">BMI Progress Update</h2>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">Hi ${bmiRecord.member.name}, here's your latest assessment</p>
          
          <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-bottom: 15px;">Current Results:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>BMI:</strong> ${bmiRecord.bmi}</li>
              <li style="padding: 5px 0;"><strong>Category:</strong> ${bmiRecord.category}</li>
              <li style="padding: 5px 0;"><strong>Weight:</strong> ${bmiRecord.weight} kg</li>
              <li style="padding: 5px 0;"><strong>Height:</strong> ${bmiRecord.height} cm</li>
              <li style="padding: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
            <p style="color: #28a745; font-weight: bold; font-size: 18px;">Keep pushing towards your fitness goals! 💪</p>
            <p style="color: #666;">📞 Contact: <strong>${process.env.GYM_CONTACT}</strong></p>
            <p style="color: #666;">Your detailed report is attached as PDF.</p>
          </div>
        </div>
      </div>
    `;
  }
}

// MISSING FUNCTION - This was causing the error
function getWhatsAppTemplate(bmiRecord: any, isNewCustomer: boolean): string {
  if (isNewCustomer) {
    return `🎉 *Welcome to ${process.env.GYM_NAME}!*

Hi ${bmiRecord.member.name},

Your first BMI assessment is complete:
📊 *BMI: ${bmiRecord.bmi}*
📈 Category: ${bmiRecord.category}
⚖️ Weight: ${bmiRecord.weight} kg
📏 Height: ${bmiRecord.height} cm

🎁 *New Member Special Offers:*
- Free Diet Plan (Worth ₹3,500)
- Personal Training Session
- Complete Gym Tour with Expert

${getBMIAdvice(bmiRecord.category)}

📞 Call/WhatsApp: ${process.env.GYM_CONTACT}
📍 Visit: ${process.env.GYM_ADDRESS}

Welcome to your fitness journey! 💪`;
  } else {
    return `🏋️ *BMI Update Ready!*

Hi ${bmiRecord.member.name},

Your latest assessment shows:
📊 *Current BMI: ${bmiRecord.bmi}*
📈 Category: ${bmiRecord.category}
⚖️ Weight: ${bmiRecord.weight} kg
📏 Height: ${bmiRecord.height} cm
📅 Recorded: ${new Date().toLocaleDateString()}

${getBMIAdvice(bmiRecord.category)}

Keep up the great work! 💪

Contact: ${process.env.GYM_CONTACT}
Visit: ${process.env.GYM_ADDRESS}`;
  }
}

function generateHealthReportPDF(bmiRecord: any, isNewCustomer: boolean): Promise<Buffer> {
  return new Promise((resolve) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header contact info (top right)
      doc.setFontSize(8);
      doc.text(`Contact: ${process.env.GYM_CONTACT}`, pageWidth - 60, 15);
      
      // Main title section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleText = `${bmiRecord.member.name} Your Fitness Report Is Ready`;
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (pageWidth - titleWidth) / 2, 35);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const byText = `By ${process.env.GYM_NAME}`;
      const byWidth = doc.getTextWidth(byText);
      doc.text(byText, (pageWidth - byWidth) / 2, 45);
      
      doc.setFontSize(12);
      const attendedText = `Attended By: ${bmiRecord.attendedBy || 'Staff'}`;
      const attendedWidth = doc.getTextWidth(attendedText);
      doc.text(attendedText, (pageWidth - attendedWidth) / 2, 55);
      
      // Personal Details Section
      let yPos = 75;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Personal Details of ${bmiRecord.member.name}:`, 20, yPos);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const personalDetails = [
        `Name - ${bmiRecord.member.name}`,
        `Contact - ${bmiRecord.member.phone}`,
        `Email - ${bmiRecord.member.email || 'Not provided'}`,
        `DOB - ${bmiRecord.member.dateOfBirth ? new Date(bmiRecord.member.dateOfBirth).toLocaleDateString() : 'Not provided'}`,
        `Relationship Status - ${bmiRecord.member.relationshipStatus || 'Not provided'}`,
        `Service looking - ${bmiRecord.member.serviceLooking || 'Member'}`,
        `Platform - ${bmiRecord.member.platform || 'Member'}`
      ];
      
      personalDetails.forEach(detail => {
        doc.text(detail, 20, yPos);
        yPos += 12;
      });
      
      // Add some spacing before BMI section
      yPos += 10;
      
      // BMI Report Section Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`BMI Report of ${bmiRecord.member.name}:`, 20, yPos);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const bmiDetails = [
        `Age - ${bmiRecord.age || 'Not provided'}`,
        `Present Body Weight - ${bmiRecord.weight} kg`,
        `Ideal body weight - ${bmiRecord.idealBodyWeight || 'Not measured'} kg`,
        `Total Fat % - ${bmiRecord.totalFatPercentage || 'Not measured'}%`,
        `Subcutaneous fat - ${bmiRecord.subcutaneousFat || 'Not measured'}%`,
        `Visceral fat - ${bmiRecord.visceralFat || 'Not measured'}`,
        `Muscle Mass - ${bmiRecord.muscleMass || 'Not measured'} kg`,
        `Resting Metabolism - ${bmiRecord.restingMetabolism || 'Not measured'} calories`,
        `Biological Age - ${bmiRecord.biologicalAge || 'Not measured'} years`,
        `Body Mass Index - ${bmiRecord.bmi} (${bmiRecord.category})`
      ];
      
      bmiDetails.forEach(detail => {
        doc.text(detail, 20, yPos);
        yPos += 10;
      });
      
      // Health Conclusion Section
      if (bmiRecord.healthConclusion) {
        yPos += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Health Report Conclusion:', 20, yPos);
        yPos += 12;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(bmiRecord.healthConclusion, 20, yPos);
        yPos += 20;
      }
      
      // New Customer Offers Section (matching original template)
      if (isNewCustomer) {
        yPos += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('If you Get Enrol Today then you can Avail', 20, yPos);
        
        yPos += 15;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Free Free Free', 20, yPos);
        
        yPos += 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Diet Sheet - Worth Rs-3,500/- absolutely FREE!', 20, yPos);
        
        yPos += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('If you sign up for a gym membership within the next 3 days', 20, yPos);
      }
      
      // Footer Section
      const footerY = doc.internal.pageSize.height - 30;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Use simple text instead of emojis to avoid character encoding issues
      doc.text(`Call/WhatsApp us at ${process.env.GYM_CONTACT}`, 20, footerY);
      doc.text(`Visit: ${process.env.GYM_ADDRESS}`, 20, footerY + 10);
      
      // Convert to buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      resolve(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Return empty buffer if PDF generation fails
      resolve(Buffer.from(''));
    }
  });
}

function getBMIAdvice(category: string): string {
  switch (category) {
    case 'Underweight':
      return '💡 Consider consulting a nutritionist to develop a healthy weight gain plan.';
    case 'Normal Weight':
    case 'Normal':
      return '✅ Great job! Maintain your current lifestyle with regular exercise and balanced diet.';
    case 'Overweight':
      return '⚠️ Consider a structured fitness plan and dietary adjustments to reach optimal health.';
    case 'Obese':
      return '🔴 We recommend immediate consultation with our fitness experts for a personalized plan.';
    default:
      return '📞 Contact our fitness experts for personalized advice.';
  }
}
