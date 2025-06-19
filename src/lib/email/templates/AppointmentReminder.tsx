import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentReminderProps {
  name: string;
  serviceName: string;
  date: string;
  time: string;
  reminderType: '24-hour' | '1-hour';
  baseUrl: string;
  bookingId: string;
}

export default function AppointmentReminder({
  name = 'Valued Customer',
  serviceName = 'Your Service',
  date = 'Tomorrow',
  time = '10:00 AM',
  reminderType = '24-hour',
  baseUrl = 'https://yourdomain.com',
  bookingId = '12345'
}: AppointmentReminderProps) {
  const isUrgent = reminderType === '1-hour';
  const reminderTitle = isUrgent ? 'Your appointment starts soon!' : 'Appointment reminder';
  const reminderMessage = isUrgent 
    ? 'Your appointment is starting in 1 hour' 
    : 'Your appointment is scheduled for tomorrow';

  return (
    <Html>
      <Head />
      <Preview>
        {reminderTitle} - {serviceName} on {date} at {time}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Servify</Text>
            <Text style={headerSubtitle}>
              {isUrgent ? '⏰ Appointment Starting Soon' : '📅 Appointment Reminder'}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            
            {/* Greeting */}
            <Text style={greeting}>Hello {name},</Text>
            
            {/* Main Message */}
            <Text style={message}>
              {reminderMessage}. We&apos;re looking forward to seeing you!
            </Text>

            {/* Appointment Card */}
            <Section style={appointmentCard}>
              <Section style={cardHeader}>
                <Text style={cardTitle}>
                  {isUrgent ? '🔔 ' : '📋 '}Appointment Details
                </Text>
              </Section>
              
              <Section style={cardBody}>
                <Section style={detailRow}>
                  <Text style={detailIcon}>🏢</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Service</Text>
                    <Text style={detailValue}>{serviceName}</Text>
                  </Section>
                </Section>
                
                <Section style={detailRow}>
                  <Text style={detailIcon}>📅</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Date</Text>
                    <Text style={detailValue}>{date}</Text>
                  </Section>
                </Section>
                
                <Section style={detailRow}>
                  <Text style={detailIcon}>⏰</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Time</Text>
                    <Text style={detailValue}>{time}</Text>
                  </Section>
                </Section>
                
                <Section style={detailRow}>
                  <Text style={detailIcon}>🎫</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Booking ID</Text>
                    <Text style={detailValue}>{bookingId}</Text>
                  </Section>
                </Section>
              </Section>
            </Section>

            {/* Action Button */}
            <Section style={buttonSection}>
              <Button
                style={{...primaryButton, ...(isUrgent ? urgentButton : {})}}
                href={`${baseUrl}/appointments/${bookingId}`}
              >
                {isUrgent ? '🚀 View Appointment Now' : '📋 View Appointment Details'}
              </Button>
            </Section>

            {/* Tips Section */}
            <Section style={{...tipsCard, ...(isUrgent ? urgentTipsCard : {})}}>
              <Text style={tipsTitle}>
                {isUrgent ? '⚡ Quick Reminders' : '💡 Preparation Tips'}
              </Text>
              <Section style={tipsList}>
                {isUrgent ? (
                  <>
                    <Text style={tipItem}>• Please head to your appointment location now</Text>
                    <Text style={tipItem}>• Call us immediately if you&apos;re running late</Text>
                    <Text style={tipItem}>• Have your booking confirmation ready</Text>
                  </>
                ) : (
                  <>
                    <Text style={tipItem}>• Plan to arrive 5-10 minutes early</Text>
                    <Text style={tipItem}>• Bring any necessary documents or items</Text>
                    <Text style={tipItem}>• Contact us if you need to reschedule</Text>
                  </>
                )}
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Footer Actions */}
            <Section style={footerActions}>
              <Text style={footerTitle}>Need to make changes?</Text>
                             <Text style={footerText}>
                 If you need to reschedule or have any questions, we&apos;re here to help.
               </Text>
              <Button
                style={secondaryButton}
                href={`${baseUrl}/appointments/${bookingId}`}
              >
                Manage Appointment
              </Button>
            </Section>

          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerNote}>
              This reminder was sent from Servify. If you have any questions, please don&apos;t hesitate to contact us.
            </Text>
            <Text style={copyright}>
              © 2024 Servify. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Modern, clean styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const content = {
  padding: '40px',
};

const greeting = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const message = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px 0',
};

const appointmentCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '24px 0',
};

const cardHeader = {
  backgroundColor: '#f3f4f6',
  padding: '16px 24px',
  borderBottom: '1px solid #e5e7eb',
};

const cardTitle = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const cardBody = {
  padding: '24px',
};

const detailRow = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 20px 0',
  padding: '0',
};

const detailIcon = {
  fontSize: '20px',
  margin: '0 16px 0 0',
  width: '24px',
  textAlign: 'center' as const,
};

const detailContent = {
  flex: '1',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
};

const urgentButton = {
  backgroundColor: '#ef4444',
  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
};

const tipsCard = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const urgentTipsCard = {
  backgroundColor: '#fee2e2',
  border: '1px solid #f87171',
};

const tipsTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const tipsList = {
  margin: '0',
};

const tipItem = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerActions = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const footerTitle = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid #667eea',
  borderRadius: '8px',
  color: '#667eea',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerNote = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
};

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}; 