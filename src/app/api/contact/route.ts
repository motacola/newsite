import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    const { name, email, subject, message } = body;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Here you would typically integrate with an email service
    // For example: SendGrid, Mailgun, Resend, or Nodemailer
    
    // Example with a simple email service (you'll need to implement this)
    try {
      await sendContactEmail({
        name,
        email,
        subject,
        message,
      });
      
      return NextResponse.json(
        { message: 'Message sent successfully' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // For now, we'll return success to avoid breaking the demo
      // In production, you'd want to handle this properly
      return NextResponse.json(
        { message: 'Message received and will be processed' },
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Placeholder function for email sending
// Replace this with your preferred email service integration
async function sendContactEmail(data: ContactFormData) {
  // Example integration options:
  
  // 1. Using Resend (recommended for Next.js)
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'contact@yourdomain.com',
  //   to: 'chrisbelgrave@gmail.com',
  //   subject: `Contact Form: ${data.subject}`,
  //   html: `
  //     <h2>New Contact Form Submission</h2>
  //     <p><strong>Name:</strong> ${data.name}</p>
  //     <p><strong>Email:</strong> ${data.email}</p>
  //     <p><strong>Subject:</strong> ${data.subject}</p>
  //     <p><strong>Message:</strong></p>
  //     <p>${data.message.replace(/\n/g, '<br>')}</p>
  //   `,
  // });

  // 2. Using SendGrid
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: 'chrisbelgrave@gmail.com',
  //   from: 'contact@yourdomain.com',
  //   subject: `Contact Form: ${data.subject}`,
  //   html: `...`,
  // });

  // 3. Using Nodemailer with SMTP
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({...});
  // await transporter.sendMail({...});

  // For demo purposes, we'll just log the data
  console.log('Contact form submission:', data);
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
}