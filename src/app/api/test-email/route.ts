import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check email configuration
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      gymEmail: process.env.GYM_EMAIL
    };

    console.log('📧 Email configuration check:', {
      host: emailConfig.host ? 'Set' : 'Not set',
      port: emailConfig.port ? 'Set' : 'Not set',
      user: emailConfig.user ? 'Set' : 'Not set',
      pass: emailConfig.pass ? 'Set' : 'Not set',
      gymEmail: emailConfig.gymEmail ? 'Set' : 'Not set'
    });

    // Check if all required variables are set
    if (!emailConfig.host || !emailConfig.user || !emailConfig.pass || !emailConfig.gymEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing email configuration',
        missing: Object.entries(emailConfig)
          .filter(([key, value]) => !value)
          .map(([key]) => key)
      }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: parseInt(emailConfig.port!),
      secure: false,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    // Verify connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ SMTP verification failed:', error);
          reject(error);
        } else {
          console.log('✅ SMTP connection verified');
          resolve(success);
        }
      });
    });

    // Get test email from request
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Test email address is required'
      }, { status: 400 });
    }

    // Send test email
    const mailOptions = {
      from: emailConfig.gymEmail,
      to: testEmail,
      subject: 'Test Email - BMI Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">✅ Email Test Successful</h1>
          <p>This is a test email from your BMI Tracker application.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${emailConfig.host}</li>
              <li><strong>SMTP Port:</strong> ${emailConfig.port}</li>
              <li><strong>From Email:</strong> ${emailConfig.gymEmail}</li>
              <li><strong>To Email:</strong> ${testEmail}</li>
            </ul>
          </div>
          <p style="text-align: center; color: #666;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      config: {
        host: emailConfig.host,
        port: emailConfig.port,
        from: emailConfig.gymEmail,
        to: testEmail
      }
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 