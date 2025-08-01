import * as nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Create client with service role key for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Add debugging for email configuration
console.log('Email configuration check:');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'Set' : 'Not set');
console.log('SMTP_PORT:', process.env.SMTP_PORT ? 'Set' : 'Not set');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');
console.log('GYM_EMAIL:', process.env.GYM_EMAIL ? 'Set' : 'Not set');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

export async function sendNotifications(bmiRecord: any) {
  try {
    
    const { data: notification, error } = await supabase
      .from('Notification')
      .insert({
        memberId: bmiRecord.memberId,
        bmiRecordId: bmiRecord.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Notification creation error:', error);
      return;
    }

    console.log('✅ Notification record created with ID:', notification.id);

    if (bmiRecord.member.phone) {
      console.log('📱 Sending WhatsApp message...');
      await sendWhatsAppMessage(bmiRecord, notification.id);
    } else {
      console.log('📱 No phone number found, skipping WhatsApp');
    }

    if (bmiRecord.member.email) {
      console.log('📧 Sending email...');
      await sendEmailReport(bmiRecord, notification.id);
    } else {
      console.log('📧 No email found, skipping email');
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
    console.log('WhatsApp message:', message);
    
    await supabase
      .from('Notification')
      .update({ whatsappSent: true, whatsappStatus: 'sent' })
      .eq('id', notificationId);
  } catch (error) {
    console.error('WhatsApp error:', error);
    await supabase
      .from('Notification')
      .update({ whatsappStatus: 'failed' })
      .eq('id', notificationId);
  }
}

async function sendEmailReport(bmiRecord: any, notificationId: number) {
  try {
    console.log('📧 Starting email report generation...');
    
    // Check if email configuration is complete
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.GYM_EMAIL) {
      console.error('❌ Email configuration incomplete. Missing required environment variables.');
      console.error('Required: SMTP_HOST, SMTP_USER, SMTP_PASS, GYM_EMAIL');
      await supabase
        .from('Notification')
        .update({ emailStatus: 'failed', emailSent: false })
        .eq('id', notificationId);
      return;
    }
    
    const isNewCustomer = bmiRecord.member.customerType === 'new';
    console.log('📧 Generating PDF for customer type:', isNewCustomer ? 'new' : 'existing');
    
    const pdfBuffer = await generateHealthReportPDF(bmiRecord, isNewCustomer);
    console.log('📧 PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    const mailOptions = {
      from: process.env.GYM_EMAIL,
      to: bmiRecord.member.email,
      subject: getEmailSubject(bmiRecord.member, isNewCustomer),
      html: getEmailTemplate(bmiRecord, isNewCustomer),
      attachments: [{
        filename: `${bmiRecord.member.name.replace(/\s+/g, '-')}-Health-Report.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };
    
    console.log('📧 Sending email to:', bmiRecord.member.email);
    console.log('📧 From:', process.env.GYM_EMAIL);
    console.log('📧 Subject:', mailOptions.subject);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    console.log('📧 Message ID:', result.messageId);
    
    await supabase
      .from('Notification')
      .update({ emailSent: true, emailStatus: 'sent' })
      .eq('id', notificationId);
      
    console.log('✅ Notification record updated successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      command: (error as any)?.command
    });
    
    await supabase
      .from('Notification')
      .update({ emailStatus: 'failed', emailSent: false })
      .eq('id', notificationId);
  }
}

function getEmailSubject(member: any, isNewCustomer: boolean): string {
  return isNewCustomer 
    ? `🎉 Your Fitness Report Is Ready - Welcome to ${process.env.GYM_NAME}!`
    : `🎉 Your Updated Fitness Report Is Ready`;
}

function getEmailTemplate(bmiRecord: any, isNewCustomer: boolean): string {
  if (isNewCustomer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 10px;">🎉 Your Fitness Report Is Ready</h1>
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
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 10px;">🎉 Your Fitness Report Is Ready</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">Hi ${bmiRecord.member.name}, here is your latest BMI assessment:</p>
          <div style="background: linear-gradient(135deg, #e8f5e8, #d4edda); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-bottom: 15px;">Your BMI Assessment:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>BMI:</strong> ${bmiRecord.bmi}</li>
              <li style="padding: 5px 0;"><strong>Category:</strong> ${bmiRecord.category}</li>
              <li style="padding: 5px 0;"><strong>Weight:</strong> ${bmiRecord.weight} kg</li>
              <li style="padding: 5px 0;"><strong>Height:</strong> ${bmiRecord.height} cm</li>
              <li style="padding: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
            <p style="color: #666;">📞 Call/WhatsApp: <strong>${process.env.GYM_CONTACT}</strong></p>
            <p style="color: #666;">📍 Visit: <strong>${process.env.GYM_ADDRESS}</strong></p>
            <p style="color: #666;">Your detailed health report is attached as PDF.</p>
          </div>
        </div>
      </div>
    `;
  }
}

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

// Register default font
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
});

// Create styles for PDF
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#2563eb',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 350, // Increased from 280
    height: 175, // Increased from 140
    objectFit: 'contain',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    color: '#1f2937',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#374151',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    width: '40%',
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  value: {
    fontSize: 12,
    width: '60%',
    color: '#1f2937',
    fontFamily: 'Helvetica',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 11,
    color: '#1f2937',
    fontFamily: 'Helvetica',
  },
  conclusion: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 15,
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  conclusionText: {
    fontSize: 12,
    color: '#1f2937',
    marginLeft: 10,
    fontFamily: 'Helvetica',
  },

  link: {
    fontSize: 12,
    color: '#2563eb',
    textDecoration: 'underline',
    fontFamily: 'Helvetica',
  },
  message: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 15,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
            marketingImageContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            height: '100%',
          },
          marketingImage: {
            width: '95%',
            height: '95%',
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          },
  parameter: { width: '40%' },
  valueCell: { width: '30%' },
  reference: { width: '30%' },
});

export async function generateHealthReportPDF(bmiRecord: any, isNewCustomer: boolean): Promise<Buffer> {
  try {
    console.log('Starting PDF generation with @react-pdf/renderer...');
    
    const gymName = process.env.GYM_NAME || 'Your Gym Name';
    
    // Get the absolute path to the logo
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    
        // Get uploaded marketing image info based on customer type
    let marketingImageSrc = '';
    let customerType = '';
    
    // Determine which image category to use based on member's customer type
    const targetCategory = bmiRecord.member.customerType === 'new' ? 'new' : 'existing';
    
    if (process.env.UPLOADED_IMAGE_INFO) {
      try {
        const imageInfo = JSON.parse(process.env.UPLOADED_IMAGE_INFO);
        
        // Check if the uploaded image matches the customer type
        if (imageInfo.category === targetCategory) {
          
          if (imageInfo.filePath) {
            // Use the URL directly (Supabase Storage URL)
            marketingImageSrc = imageInfo.filePath;
            customerType = imageInfo.category;
          }
        }
        
        if (!marketingImageSrc) {
          // Try to find existing images of the correct category from Supabase Storage
          try {
            const { data: files } = await (supabase as any).storage
              .from('marketing-images')
              .list('', {
                search: targetCategory
              });

            if (files && files.length > 0) {
              // Sort by timestamp (newest first) and take the first one
              const sortedFiles = files.sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
              const selectedFile = sortedFiles[0];
              
              const { data: urlData } = (supabase as any).storage
                .from('marketing-images')
                .getPublicUrl(selectedFile.name);
              
              marketingImageSrc = urlData.publicUrl;
              customerType = targetCategory;
            }
          } catch (error) {
            console.error('Error finding marketing images:', error);
          }
        }
      } catch (e) {
        console.error('Error parsing uploaded image info:', e);
      }
    }

    const personalRows = [
      ['Name -', bmiRecord.member.name],
      ['Contact -', bmiRecord.member.phone],
      ['Email -', bmiRecord.member.email || 'Not provided'],
      ['DOB -', bmiRecord.member.dateOfBirth ? new Date(bmiRecord.member.dateOfBirth).toLocaleDateString() : 'Not provided'],
      ['Relationship Status -', bmiRecord.member.relationshipStatus || 'Not provided'],
      ['Service looking -', bmiRecord.member.serviceLooking || 'Member'],
      ['Platform -', bmiRecord.member.platform || 'Member'],
    ];

    const bmiRows = [
      ['Age', bmiRecord.age || '-', '-'],
      ['Present Body Weight', bmiRecord.weight || '-', '-'],
      ['Ideal body weight', bmiRecord.idealBodyWeight || '-', '-'],
      ['Total Fat %', bmiRecord.totalFatPercentage || '-', '12 to 15'],
      ['Subcutaneous fat', bmiRecord.subcutaneousFat || '-', '-'],
      ['Visceral fat', bmiRecord.visceralFat || '-', '2 - 5%'],
      ['Muscle Mass', bmiRecord.muscleMass || '-', '-'],
      ['Resting Metabolism', bmiRecord.restingMetabolism || '-', '-'],
      ['Biological Age', bmiRecord.biologicalAge || '-', '-'],
      ['Body Mass index', bmiRecord.bmi || '-', '(18.5 to 24.9, it falls within the Healthy Weight range)'],
    ];

    // Generate PDF using React PDF renderer with error handling
    let pdfBuffer;
    try {
      pdfBuffer = await renderToBuffer(
        React.createElement(Document, {}, [
          // Page 1: Personal Details
          React.createElement(Page, { key: 'page1', size: 'A4', style: pdfStyles.page }, [
            React.createElement(View, { key: 'header1', style: pdfStyles.headerContainer }, [
              React.createElement(Image, { key: 'logo1', src: logoPath, style: pdfStyles.logo, cache: false })
            ]),
            React.createElement(Text, { key: 'title1', style: pdfStyles.title }, `Personal Details of ${bmiRecord.member.name} :`),
            React.createElement(Text, { key: 'subtitle1', style: pdfStyles.subtitle }, `Attend By: ${bmiRecord.attendedBy || 'Staff'}`),
            React.createElement(View, { key: 'section1', style: pdfStyles.section }, 
              personalRows.map((row, index) => 
                React.createElement(View, { key: `row${index}`, style: pdfStyles.row }, [
                  React.createElement(Text, { key: `label${index}`, style: pdfStyles.label }, row[0]),
                  React.createElement(Text, { key: `value${index}`, style: pdfStyles.value }, row[1])
                ])
              )
            )
          ]),
          
          // Page 2: BMI Report
          React.createElement(Page, { key: 'page2', size: 'A4', style: pdfStyles.page }, [
            React.createElement(View, { key: 'header2', style: pdfStyles.headerContainer }, [
              React.createElement(Image, { key: 'logo2', src: logoPath, style: pdfStyles.logo, cache: false })
            ]),
            React.createElement(Text, { key: 'title2', style: pdfStyles.title }, `BMI Report of ${bmiRecord.member.name} :`),
            React.createElement(View, { key: 'section2', style: pdfStyles.section }, [
              React.createElement(View, { key: 'tableHeader', style: pdfStyles.tableHeader }, [
                React.createElement(Text, { key: 'paramHeader', style: [pdfStyles.tableHeaderCell, pdfStyles.parameter] }, 'Parameter'),
                React.createElement(Text, { key: 'valueHeader', style: [pdfStyles.tableHeaderCell, pdfStyles.valueCell] }, 'Value'),
                React.createElement(Text, { key: 'refHeader', style: [pdfStyles.tableHeaderCell, pdfStyles.reference] }, 'Reference')
              ]),
              ...bmiRows.map((row, index) => 
                React.createElement(View, { key: `bmiRow${index}`, style: pdfStyles.tableRow }, [
                  React.createElement(Text, { key: `param${index}`, style: [pdfStyles.tableCell, pdfStyles.parameter] }, row[0]),
                  React.createElement(Text, { key: `value${index}`, style: [pdfStyles.tableCell, pdfStyles.valueCell] }, row[1]),
                  React.createElement(Text, { key: `ref${index}`, style: [pdfStyles.tableCell, pdfStyles.reference] }, row[2])
                ])
              ),
              ...(bmiRecord.healthConclusion ? [
                React.createElement(Text, { key: 'conclusion', style: pdfStyles.conclusion }, 'Health Report Conclusion -'),
                React.createElement(Text, { key: 'conclusionText', style: pdfStyles.conclusionText }, `• "${String(bmiRecord.healthConclusion)}"`)
              ] : [])
            ])
          ]),
          
          // Page 3: Marketing Image
          React.createElement(Page, { key: 'page3', size: 'A4', style: pdfStyles.page }, [
            React.createElement(View, { key: 'marketingImageContainer', style: pdfStyles.marketingImageContainer }, 
              marketingImageSrc && marketingImageSrc !== '' ? 
                React.createElement(Image, { 
                  key: 'marketingImage', 
                  src: marketingImageSrc, 
                  style: pdfStyles.marketingImage,
                  cache: false
                }) :
                React.createElement(View, { key: 'noImagePlaceholder', style: { flex: 1, justifyContent: 'center', alignItems: 'center' } }, [
                  React.createElement(Text, { key: 'placeholder1', style: { fontSize: 16, color: '#666', textAlign: 'center' } }, 'No marketing image uploaded'),
                  React.createElement(Text, { key: 'placeholder2', style: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 } }, 'Upload a marketing image through the admin panel')
                ])
            )
          ]),
          
          // Page 4: Custom Message
          React.createElement(Page, { key: 'page4', size: 'A4', style: pdfStyles.page }, [
            React.createElement(View, { key: 'header4', style: pdfStyles.headerContainer }, [
              React.createElement(Image, { key: 'logo4', src: logoPath, style: pdfStyles.logo, cache: false })
            ]),
            React.createElement(Text, { key: 'title4', style: pdfStyles.title }, 'Check out our gym location & Reviews on the map:'),
            React.createElement(Text, { key: 'link', style: pdfStyles.link }, `${gymName} Link: https://g.co/kgs/mQtKEQ`),
            React.createElement(Text, { key: 'message', style: pdfStyles.message }, 
              'Experience a personalised tour of our gym and explore our latest offers with one of our trainers. Don\'t miss out!'
            )
          ])
        ])
      );
    } catch (renderError) {
      console.error('PDF render error:', renderError);
      const errorMessage = renderError instanceof Error ? renderError.message : 'Unknown PDF generation error';
      throw new Error(`PDF generation failed: ${errorMessage}`);
    }

    return pdfBuffer;

  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
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
