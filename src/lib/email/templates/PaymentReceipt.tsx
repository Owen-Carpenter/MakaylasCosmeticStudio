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
  const previewText = `Your payment receipt for ${serviceName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-emerald-50 font-sans">
          <Container className="mx-auto p-6 max-w-md">
            <Section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <Heading className="text-xl font-bold text-gray-900 mb-2">Payment Receipt</Heading>
              <Text className="text-gray-700">Hello {name},</Text>
              <Text className="text-gray-700">Thank you for your payment. Your booking has been confirmed.</Text>
              
              <Section className="bg-emerald-50 p-4 rounded-md my-4 border border-emerald-100">
                <Heading className="text-md font-bold text-gray-900">Receipt Details</Heading>
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
                <Hr className="my-2 border-emerald-200" />
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-800 text-sm font-bold">Total Paid:</Text></Column>
                  <Column className="w-1/2"><Text className="text-emerald-700 text-sm font-bold">{amount}</Text></Column>
                </Row>
              </Section>
              
              <Section className="text-center my-6">
                <Button 
                  className="bg-emerald-600 text-white px-5 py-3 rounded-md font-medium"
                  href={`${baseUrl}/dashboard`}
                >
                  View Appointment
                </Button>
              </Section>
              
              <Text className="text-gray-600 text-sm">
                If you have any questions, please contact our customer service team.
              </Text>
              
              <Hr className="my-4 border-gray-200" />
              
              <Text className="text-gray-500 text-xs text-center">
                &copy; {new Date().getFullYear()} Makaylas Cosmetic Studio. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentReceipt; 