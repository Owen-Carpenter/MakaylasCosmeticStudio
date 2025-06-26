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
  const previewText = `Your payment receipt for ${serviceName} - Makayla's Cosmetic Studio`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 font-sans">
          <Container className="mx-auto p-6 max-w-md">
            <Section className="bg-white p-6 rounded-lg shadow-lg border border-amber-100">
              {/* Header with branding */}
              <Section className="text-center mb-6 p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg">
                <Heading className="text-2xl font-bold text-white mb-1">Makayla&apos;s Cosmetic Studio</Heading>
                <Text className="text-amber-50 text-sm">Beauty & Wellness Services</Text>
              </Section>

              <Heading className="text-xl font-bold text-gray-900 mb-2 text-center">Payment Receipt ✨</Heading>
              <Text className="text-gray-700">Hello {name},</Text>
                              <Text className="text-gray-700">Thank you for choosing Makayla&apos;s Cosmetic Studio! Your payment has been processed and your beauty appointment is confirmed.</Text>
              
              <Section className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-md my-4 border border-amber-200">
                <Heading className="text-md font-bold text-gray-900 mb-3">Receipt Details</Heading>
                <Row className="mt-2">
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Receipt #:</Text></Column>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm">{bookingId}</Text></Column>
                </Row>
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Service:</Text></Column>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm">{serviceName}</Text></Column>
                </Row>
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Date:</Text></Column>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm">{date}</Text></Column>
                </Row>
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Time:</Text></Column>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm">{time}</Text></Column>
                </Row>
                <Hr className="my-2 border-amber-200" />
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-800 text-sm font-bold">Total Paid:</Text></Column>
                  <Column className="w-1/2"><Text className="text-amber-700 text-sm font-bold">{amount}</Text></Column>
                </Row>
              </Section>
              
              <Section className="text-center my-6">
                <Button 
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-6 py-3 rounded-md font-medium shadow-md"
                  href={`${baseUrl}/dashboard`}
                >
                  View Your Appointment
                </Button>
              </Section>

              {/* Beauty preparation tips */}
              <Section className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-md my-4 border border-pink-200">
                <Text className="text-gray-800 text-sm font-medium mb-2">💄 Preparation Tips:</Text>
                <Text className="text-gray-600 text-xs">• Arrive 5-10 minutes early for your appointment</Text>
                <Text className="text-gray-600 text-xs">• Come with a clean face (if applicable to your service)</Text>
                <Text className="text-gray-600 text-xs">• Bring any inspiration photos or preferences</Text>
              </Section>
              
              <Text className="text-gray-600 text-sm">
                We&apos;re excited to pamper you! If you have any questions about your upcoming appointment, please don&apos;t hesitate to contact us at (501) 575-7209.
              </Text>
              
              <Hr className="my-4 border-gray-200" />
              
              <Text className="text-gray-500 text-xs text-center">
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