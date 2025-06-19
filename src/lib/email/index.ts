import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';
import PaymentReceipt from './templates/PaymentReceipt';
import AppointmentCancellation from './templates/AppointmentCancellation';
import AppointmentReminder from './templates/AppointmentReminder';
import React from 'react';
import 'server-only';
import { getBaseUrl } from '@/lib/utils/url';
import { getFormattedSender } from '@/lib/utils/email';

// Initialize Resend with API key - only works on server
let resend: Resend | null = null;
if (typeof window === 'undefined') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Base URL for application links
const BASE_URL = getBaseUrl();

/**
 * Send a payment receipt email
 */
export async function sendPaymentReceiptEmail({
  email,
  name,
  bookingId,
  serviceName,
  date,
  time,
  amount
}: {
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
}) {
  try {
    if (!resend) {
      console.error('Resend not initialized. This function can only be called from server components.');
      return { success: false, error: 'Email sending is only available server-side' };
    }
    
    // Render the React email component to HTML
    const html = await renderAsync(
      React.createElement(PaymentReceipt, {
        name,
        bookingId,
        serviceName,
        date,
        time,
        amount,
        baseUrl: BASE_URL
      })
    );

    // Send the email using Resend
    const fromEmail = getFormattedSender('Servify');
    console.log('Sending payment receipt email with from:', fromEmail, 'to:', email);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Payment Receipt for ${serviceName}`,
      html
    });

    if (error) {
      console.error('Error sending payment receipt email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendPaymentReceiptEmail:', error);
    return { success: false, error };
  }
}

/**
 * Send an appointment cancellation email
 */
export async function sendAppointmentCancellationEmail({
  email,
  name,
  bookingId,
  serviceName,
  date,
  time
}: {
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  try {
    if (!resend) {
      console.error('Resend not initialized. This function can only be called from server components.');
      return { success: false, error: 'Email sending is only available server-side' };
    }
    
    // Render the React email component to HTML
    const html = await renderAsync(
      React.createElement(AppointmentCancellation, {
        name,
        bookingId,
        serviceName,
        date,
        time,
        baseUrl: BASE_URL
      })
    );

    // Send the email using Resend
    const fromEmail = getFormattedSender('Servify');
    console.log('Sending cancellation email with from:', fromEmail, 'to:', email);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your appointment for ${serviceName} has been cancelled`,
      html
    });

    if (error) {
      console.error('Error sending appointment cancellation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendAppointmentCancellationEmail:', error);
    return { success: false, error };
  }
}

/**
 * Send an appointment reminder email
 */
export async function sendAppointmentReminderEmail({
  email,
  name,
  bookingId,
  serviceName,
  date,
  time,
  reminderType
}: {
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  reminderType: '24-hour' | '1-hour';
}) {
  try {
    if (!resend) {
      console.error('Resend not initialized. This function can only be called from server components.');
      return { success: false, error: 'Email sending is only available server-side' };
    }
    
    // Render the React email component to HTML
    const html = await renderAsync(
      React.createElement(AppointmentReminder, {
        name,
        bookingId,
        serviceName,
        date,
        time,
        reminderType,
        baseUrl: BASE_URL
      })
    );

    // Send the email using Resend
    const fromEmail = getFormattedSender('Servify');
    console.log('Sending appointment reminder email with from:', fromEmail, 'to:', email, 'type:', reminderType);
    
    const reminderTitle = reminderType === '24-hour' 
      ? 'Appointment Reminder - Tomorrow'
      : 'Appointment Starting Soon';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${reminderTitle} - ${serviceName}`,
      html
    });

    if (error) {
      console.error('Error sending appointment reminder email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendAppointmentReminderEmail:', error);
    return { success: false, error };
  }
} 