// Test script to create sample appointment data for notification testing
// Run this with: node test-notification.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual values
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_SERVICE_KEY = 'your_service_key';
const TEST_EMAIL = 'your-email@example.com'; // Use your real email to receive test

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestAppointments() {
  try {
    // Create appointment for tomorrow (24-hour reminder test)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    // Create appointment for 1 hour from now (1-hour reminder test)
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    const todayDate = new Date().toISOString().split('T')[0];
    const oneHourTime = `${oneHourFromNow.getHours().toString().padStart(2, '0')}:${oneHourFromNow.getMinutes().toString().padStart(2, '0')}`;

    console.log('Creating test appointments...');

    // Test appointment for 24-hour reminder
    const { data: appointment1, error: error1 } = await supabase
      .from('bookings')
      .insert({
        customer_name: 'Test Customer 24h',
        customer_email: TEST_EMAIL,
        service_name: 'Test Service - 24h Reminder',
        appointment_date: tomorrowDate,
        appointment_time: '14:00',
        status: 'confirmed',
        amount: 50.00,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error1) {
      console.error('Error creating 24h test appointment:', error1);
    } else {
      console.log('✅ Created 24-hour test appointment:', appointment1.id);
    }

    // Test appointment for 1-hour reminder
    const { data: appointment2, error: error2 } = await supabase
      .from('bookings')
      .insert({
        customer_name: 'Test Customer 1h',
        customer_email: TEST_EMAIL,
        service_name: 'Test Service - 1h Reminder',
        appointment_date: todayDate,
        appointment_time: oneHourTime,
        status: 'confirmed',
        amount: 75.00,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error2) {
      console.error('Error creating 1h test appointment:', error2);
    } else {
      console.log('✅ Created 1-hour test appointment:', appointment2.id);
    }

    console.log('\n🎉 Test appointments created!');
    console.log('Now you can:');
    console.log('1. Visit /api/notifications/test-reminders to see them');
    console.log('2. POST to /api/notifications/test-reminders to send test emails');
    console.log('\nDon\'t forget to delete these test appointments when done!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Cleanup function
async function cleanupTestAppointments() {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .like('customer_name', 'Test Customer%');

    if (error) {
      console.error('Error cleaning up:', error);
    } else {
      console.log('✅ Test appointments cleaned up');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run based on command line argument
const action = process.argv[2];
if (action === 'cleanup') {
  cleanupTestAppointments();
} else {
  createTestAppointments();
} 