import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
  Hr,
  Button,
} from '@react-email/components';

interface PaymentReceiptProps {
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
  baseUrl?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  name = 'Valued Customer',
  bookingId = 'booking-123456',
  serviceName = 'Premium Service',
  date = 'January 1, 2024',
  time = '10:00 AM',
  amount = '$99.00',
      baseUrl,
}) => {
  const previewText = `Your payment receipt for ${serviceName} - Makayla&apos;s Cosmetic Studio`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#fefdf8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <Container style={{ margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
            <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              
              {/* Header with exact brand colors */}
              <Section style={{ textAlign: 'center', marginBottom: '32px', padding: '32px', background: 'linear-gradient(135deg, #D3AF37 0%, #B8860B 100%)', borderRadius: '12px' }}>
                <Heading style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Makayla&apos;s Cosmetic Studio
                </Heading>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', margin: '0', fontWeight: '500' }}>
                  Beauty & Wellness Services
                </Text>
              </Section>

              <Heading style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '24px', textAlign: 'center' }}>
                Payment Receipt ✨
              </Heading>
              
              <Text style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '8px' }}>
                Hello {name},
              </Text>
              
              <Text style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '32px' }}>
                Thank you for choosing Makayla&apos;s Cosmetic Studio! Your payment has been processed and your beauty appointment is confirmed.
              </Text>
              
              {/* Receipt details with brand colors */}
              <Section style={{ backgroundColor: '#fefdf8', padding: '24px', borderRadius: '8px', marginBottom: '32px', border: '2px solid #D3AF37' }}>
                <Heading style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                  Receipt Details
                </Heading>
                
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: '0' }}>Receipt #:</Text>
                  </Column>
                  <Column style={{ width: '60%' }}>
                    <Text style={{ fontSize: '14px', color: '#1f2937', margin: '0', fontWeight: '500' }}>{bookingId}</Text>
                  </Column>
                </Row>
                
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: '0' }}>Service:</Text>
                  </Column>
                  <Column style={{ width: '60%' }}>
                    <Text style={{ fontSize: '14px', color: '#1f2937', margin: '0', fontWeight: '500' }}>{serviceName}</Text>
                  </Column>
                </Row>
                
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: '0' }}>Date:</Text>
                  </Column>
                  <Column style={{ width: '60%' }}>
                    <Text style={{ fontSize: '14px', color: '#1f2937', margin: '0', fontWeight: '500' }}>{date}</Text>
                  </Column>
                </Row>
                
                <Row style={{ marginBottom: '20px' }}>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: '0' }}>Time:</Text>
                  </Column>
                  <Column style={{ width: '60%' }}>
                    <Text style={{ fontSize: '14px', color: '#1f2937', margin: '0', fontWeight: '500' }}>{time}</Text>
                  </Column>
                </Row>
                
                <Hr style={{ margin: '16px 0', borderColor: '#D3AF37', borderWidth: '1px' }} />
                
                <Row>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0' }}>Total Paid:</Text>
                  </Column>
                  <Column style={{ width: '60%' }}>
                    <Text style={{ fontSize: '16px', fontWeight: '700', color: '#B8860B', margin: '0' }}>{amount}</Text>
                  </Column>
                </Row>
              </Section>
              
              {/* Action button with brand colors */}
              <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Button 
                  style={{ 
                    background: 'linear-gradient(135deg, #D3AF37 0%, #B8860B 100%)', 
                    color: '#ffffff', 
                    padding: '14px 28px', 
                    borderRadius: '8px', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 4px 15px rgba(211, 175, 55, 0.3)'
                  }}
                  href={`${baseUrl}/dashboard`}
                >
                  View Your Appointment
                </Button>
              </Section>

              {/* Beauty preparation tips */}
              <Section style={{ backgroundColor: '#fef7ed', padding: '20px', borderRadius: '8px', marginBottom: '32px', border: '1px solid #fed7aa' }}>
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                  💄 Preparation Tips:
                </Text>
                <Text style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                  • Arrive 5-10 minutes early for your appointment
                </Text>
                <Text style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                  • Come with a clean face (if applicable to your service)
                </Text>
                <Text style={{ fontSize: '14px', color: '#4b5563', margin: '0', lineHeight: '1.5' }}>
                  • Bring any inspiration photos or preferences
                </Text>
              </Section>
              
              <Text style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '32px' }}>
                We&apos;re excited to pamper you! If you have any questions about your upcoming appointment, please don&apos;t hesitate to contact us at (501) 575-7209.
              </Text>
              
              <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb', borderWidth: '1px' }} />
              
              <Text style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4', margin: '0' }}>
                &copy; {new Date().getFullYear()} Makayla&apos;s Cosmetic Studio. All rights reserved.<br/>
                278 U.S. 65 Suite C, Conway, AR 72032
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentReceipt; 