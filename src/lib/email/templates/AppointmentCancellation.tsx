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

interface AppointmentCancellationProps {
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  baseUrl?: string;
}

export const AppointmentCancellation: React.FC<AppointmentCancellationProps> = ({
  name = 'Valued Customer',
  bookingId = 'booking-123456',
  serviceName = 'Premium Service',
  date = 'January 1, 2024',
  time = '10:00 AM',
      baseUrl,
}) => {
  const previewText = `Your appointment for ${serviceName} has been cancelled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-rose-50 font-sans">
          <Container className="mx-auto p-6 max-w-md">
            <Section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <Heading className="text-xl font-bold text-gray-900 mb-2">Appointment Cancellation</Heading>
              <Text className="text-gray-700">Hello {name},</Text>
              <Text className="text-gray-700">Your appointment has been successfully cancelled as requested.</Text>
              
              <Section className="bg-rose-50 p-4 rounded-md my-4 border border-rose-100">
                <Heading className="text-md font-bold text-gray-900">Cancelled Appointment Details</Heading>
                <Row className="mt-2">
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Booking #:</Text></Column>
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
                <Row>
                  <Column className="w-1/2"><Text className="text-gray-700 text-sm font-medium">Status:</Text></Column>
                  <Column className="w-1/2"><Text className="text-rose-600 text-sm font-medium">Cancelled</Text></Column>
                </Row>
              </Section>
              
              <Section className="text-center my-6">
                <Button 
                  className="bg-rose-600 text-white px-5 py-3 rounded-md font-medium"
                  href={`${baseUrl}/services`}
                >
                  Book Another Appointment
                </Button>
              </Section>
              
              <Text className="text-gray-600 text-sm">
                If you didn&apos;t request this cancellation or have any questions, please contact our customer service team immediately.
              </Text>
              
              <Hr className="my-4 border-gray-200" />
              
              <Text className="text-gray-500 text-xs text-center">
                &copy; {new Date().getFullYear()} Servify. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AppointmentCancellation; 