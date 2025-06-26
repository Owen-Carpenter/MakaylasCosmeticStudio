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
  const previewText = `Your ${serviceName} appointment has been cancelled - Makayla's Cosmetic Studio`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 font-sans">
          <Container className="mx-auto p-6 max-w-md">
            <Section className="bg-white p-6 rounded-lg shadow-lg border border-rose-100">
              {/* Header with branding */}
              <Section className="text-center mb-6 p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg">
                <Heading className="text-2xl font-bold text-white mb-1">Makayla&apos;s Cosmetic Studio</Heading>
                <Text className="text-amber-50 text-sm">Beauty & Wellness Services</Text>
              </Section>

              <Heading className="text-xl font-bold text-gray-900 mb-2 text-center">Appointment Cancelled</Heading>
              <Text className="text-gray-700">Hello {name},</Text>
              <Text className="text-gray-700">Your beauty appointment has been successfully cancelled as requested. We understand that schedules can change!</Text>
              
              <Section className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-md my-4 border border-rose-200">
                <Heading className="text-md font-bold text-gray-900 mb-3">Cancelled Appointment Details</Heading>
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
                  <Column className="w-1/2"><Text className="text-rose-600 text-sm font-medium">Cancelled ❌</Text></Column>
                </Row>
              </Section>
              
              <Section className="text-center my-6">
                <Button 
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-6 py-3 rounded-md font-medium shadow-md"
                  href={`${baseUrl}/services`}
                >
                  Book Another Service ✨
                </Button>
              </Section>

              {/* Rebooking encouragement */}
              <Section className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-md my-4 border border-amber-200">
                <Text className="text-gray-800 text-sm font-medium mb-2">💄 We&apos;d Love to See You Again!</Text>
                <Text className="text-gray-600 text-xs">• Browse our full range of beauty services</Text>
                <Text className="text-gray-600 text-xs">• Check out our latest lash and brow treatments</Text>
                <Text className="text-gray-600 text-xs">• Book online 24/7 for your convenience</Text>
              </Section>
              
              <Text className="text-gray-600 text-sm">
                If you didn&apos;t request this cancellation or have any questions, please contact us immediately at (501) 575-7209. We&apos;re always here to help with your beauty needs!
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

export default AppointmentCancellation; 