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
  const reminderTitle = isUrgent ? 'Your beauty appointment starts soon!' : 'Beauty appointment reminder';
  const reminderMessage = isUrgent 
    ? 'Your beauty appointment at Makayla&apos;s Cosmetic Studio is starting in 1 hour' 
    : 'Your beauty appointment at Makayla&apos;s Cosmetic Studio is scheduled for tomorrow';

  return (
    <Html>
      <Head />
      <Preview>
        {reminderTitle} - {serviceName} on {date} at {time}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Header with exact brand colors */}
          <Section style={header}>
            <Text style={logo}>Makayla&apos;s Cosmetic Studio</Text>
            <Text style={headerSubtitle}>Beauty & Wellness Services</Text>
            <Text style={headerReminder}>
              {isUrgent ? '⏰ Appointment Starting Soon' : '📅 Appointment Reminder'}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            
            {/* Greeting */}
            <Text style={greeting}>Hello {name},</Text>
            
            {/* Main Message */}
            <Text style={message}>
              {reminderMessage}. We&apos;re excited to pamper you and help you look and feel your absolute best! ✨
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
                  <Text style={detailIcon}>💄</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Beauty Service</Text>
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
                  <Text style={detailIcon}>📍</Text>
                  <Section style={detailContent}>
                    <Text style={detailLabel}>Location</Text>
                    <Text style={detailValue}>278 U.S. 65 Suite C, Conway, AR 72032</Text>
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

            {/* Beauty Tips Section */}
            <Section style={{...tipsCard, ...(isUrgent ? urgentTipsCard : {})}}>
              <Text style={tipsTitle}>
                {isUrgent ? '⚡ Quick Beauty Reminders' : '💡 Beauty Preparation Tips'}
              </Text>
              <Section style={tipsList}>
                {isUrgent ? (
                  <>
                    <Text style={tipItem}>• Please head to our studio now - we&apos;re excited to see you!</Text>
                    <Text style={tipItem}>• Call us at (501) 575-7209 if you&apos;re running late</Text>
                    <Text style={tipItem}>• Have your booking confirmation ready</Text>
                  </>
                ) : (
                  <>
                    <Text style={tipItem}>• Arrive 5-10 minutes early for check-in</Text>
                    <Text style={tipItem}>• Come with a clean face (if applicable to your service)</Text>
                    <Text style={tipItem}>• Bring inspiration photos or share your beauty goals</Text>
                    <Text style={tipItem}>• Contact us at (501) 575-7209 if you need to reschedule</Text>
                  </>
                )}
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Footer Actions */}
            <Section style={footerActions}>
              <Text style={footerTitle}>Need to make changes?</Text>
              <Text style={footerText}>
                If you need to reschedule or have any beauty-related questions, we&apos;re here to help make you look and feel amazing!
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
              This reminder was sent from Makayla&apos;s Cosmetic Studio. If you have any questions about your beauty appointment, please don&apos;t hesitate to contact us at (501) 575-7209.
            </Text>
            <Text style={copyright}>
              © 2024 Makayla&apos;s Cosmetic Studio. All rights reserved.<br/>
              278 U.S. 65 Suite C, Conway, AR 72032
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Brand-aligned styles with exact website colors
const main = {
  backgroundColor: '#fefdf8', // Cream background matching website
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
  background: 'linear-gradient(135deg, #D3AF37 0%, #B8860B 100%)', // Exact brand colors
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px 0',
  letterSpacing: '0.5px',
};

const headerReminder = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  padding: '8px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  display: 'inline-block',
};

const content = {
  padding: '40px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937', // High contrast dark text
  margin: '0 0 16px 0',
};

const message = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151', // Good contrast gray
  margin: '0 0 32px 0',
};

const appointmentCard = {
  backgroundColor: '#fefdf8', // Light cream background
  border: '2px solid #D3AF37', // Brand gold border
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '24px 0',
};

const cardHeader = {
  backgroundColor: '#D3AF37', // Primary brand color
  padding: '16px 24px',
};

const cardTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
};

const cardBody = {
  padding: '24px',
};

const detailRow = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 16px 0',
};

const detailIcon = {
  fontSize: '20px',
  marginRight: '12px',
  minWidth: '24px',
};

const detailContent = {
  flex: '1',
};

const detailLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280', // Medium gray for labels
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const detailValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937', // High contrast for values
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  background: 'linear-gradient(135deg, #D3AF37 0%, #B8860B 100%)', // Brand gradient
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 15px rgba(211, 175, 55, 0.3)', // Brand-colored shadow
};

const urgentButton = {
  backgroundColor: '#B8441F', // Destructive color from brand palette
  background: 'linear-gradient(135deg, #B8441F 0%, #9A3A1A 100%)',
  animation: 'pulse 2s infinite',
};

const tipsCard = {
  backgroundColor: '#fef7ed', // Light orange background
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const urgentTipsCard = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
};

const tipsTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#1f2937', // High contrast
  margin: '0 0 16px 0',
};

const tipsList = {
  margin: '0',
};

const tipItem = {
  fontSize: '14px',
  color: '#4b5563', // Good contrast
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const footerActions = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const footerTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937', // High contrast
  margin: '0 0 8px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280', // Medium contrast
  margin: '0 0 20px 0',
  lineHeight: '1.5',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#D3AF37', // Brand color
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 20px',
  border: '2px solid #D3AF37', // Brand border
  borderRadius: '6px',
  display: 'inline-block',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const footerNote = {
  fontSize: '14px',
  color: '#6b7280', // Medium contrast
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const copyright = {
  fontSize: '12px',
  color: '#9ca3af', // Light gray but still readable
  margin: '0',
  lineHeight: '1.4',
}; 