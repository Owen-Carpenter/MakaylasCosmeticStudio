#!/usr/bin/env node

// Simple console script to test notification system
// Usage: node scripts/test-notifications.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testNotifications() {
  console.log('🔔 Notification System Tester\n');

  try {
    // Get base URL
    const baseUrl = await question('Enter your app URL (e.g., http://localhost:3000 or https://yourdomain.com): ');
    
    // Get test email
    const testEmail = await question('Enter your email address to receive test notifications: ');

    console.log('\n📋 What would you like to do?');
    console.log('1. Preview pending reminders (no emails sent)');
    console.log('2. Create test appointments and send reminders');
    console.log('3. Send reminders for existing appointments');
    
    const choice = await question('\nEnter your choice (1-3): ');

    if (choice === '1') {
      await previewReminders(baseUrl);
    } else if (choice === '2') {
      await createTestAndSend(baseUrl, testEmail);
    } else if (choice === '3') {
      await sendExistingReminders(baseUrl);
    } else {
      console.log('❌ Invalid choice');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

async function previewReminders(baseUrl) {
  console.log('\n🔍 Checking for pending reminders...');
  
  try {
    const response = await fetch(`${baseUrl}/api/notifications/test-reminders`);
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📊 Results:');
      console.log(`📅 24-hour reminders: ${data.data.appointments24h.count} appointments`);
      console.log(`⏰ 1-hour reminders: ${data.data.appointments1h.count} appointments`);
      
      if (data.data.appointments24h.count > 0) {
        console.log('\n📅 24-hour reminder appointments:');
        data.data.appointments24h.appointments.forEach(apt => {
          console.log(`  - ${apt.customer_name} (${apt.customer_email}): ${apt.service_name} on ${apt.appointment_date} at ${apt.appointment_time}`);
        });
      }
      
      if (data.data.appointments1h.count > 0) {
        console.log('\n⏰ 1-hour reminder appointments:');
        data.data.appointments1h.appointments.forEach(apt => {
          console.log(`  - ${apt.customer_name} (${apt.customer_email}): ${apt.service_name} on ${apt.appointment_date} at ${apt.appointment_time}`);
        });
      }
      
      if (data.data.appointments24h.count === 0 && data.data.appointments1h.count === 0) {
        console.log('\n💡 No appointments found that need reminders.');
        console.log('   Try option 2 to create test appointments!');
      }
    } else {
      console.log('❌ Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Failed to fetch reminders:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Your app is running');
    console.log('   - You\'re logged in as admin in your browser');
    console.log('   - The URL is correct');
  }
}

async function createTestAndSend(baseUrl, testEmail) {
  console.log('\n🔧 This feature requires database access.');
  console.log('Please run this SQL in your Supabase SQL editor:\n');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
  const oneHourFromNow = new Date();
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
  const todayDate = new Date().toISOString().split('T')[0];
  const oneHourTime = `${oneHourFromNow.getHours().toString().padStart(2, '0')}:${oneHourFromNow.getMinutes().toString().padStart(2, '0')}`;
  
  console.log(`-- Test appointments for ${testEmail}`);
  console.log(`-- First, create a test user (if it doesn't exist)`);
  console.log(`INSERT INTO users (id, name, email, role, created_at) VALUES`);
  console.log(`('11111111-1111-1111-1111-111111111111', 'Test Customer 24h', '${testEmail}', 'customer', NOW()),`);
  console.log(`('22222222-2222-2222-2222-222222222222', 'Test Customer 1h', '${testEmail}', 'customer', NOW())`);
  console.log(`ON CONFLICT (id) DO NOTHING;`);
  console.log(``);
  console.log(`-- Then create the test bookings`);
  console.log(`INSERT INTO bookings (id, user_id, service_id, service_name, appointment_date, appointment_time, status, payment_status, amount_paid, created_at) VALUES`);
  console.log(`('test-booking-24h-${Date.now()}', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Test Service - 24h Reminder', '${tomorrowDate}', '14:00', 'confirmed', 'paid', 50.00, NOW()),`);
  console.log(`('test-booking-1h-${Date.now()}', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Test Service - 1h Reminder', '${todayDate}', '${oneHourTime}', 'confirmed', 'paid', 75.00, NOW());`);
  
  console.log('\n📋 After running the SQL:');
  console.log('1. Run this script again and choose option 1 to preview');
  console.log('2. Run this script again and choose option 3 to send emails');
  
  const cleanup = await question('\nWould you like the cleanup SQL too? (y/n): ');
  if (cleanup.toLowerCase() === 'y') {
    console.log('\n🧹 Cleanup SQL (run after testing):');
    console.log(`DELETE FROM bookings WHERE customer_name LIKE 'Test Customer%';`);
  }
}

async function sendExistingReminders(baseUrl) {
  console.log('\n📤 Sending reminders for existing appointments...');
  
  try {
    const response = await fetch(`${baseUrl}/api/notifications/test-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'both' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Success!');
      console.log(`📧 Total emails sent: ${data.data.sent || 0}`);
      console.log(`❌ Errors: ${data.data.errors || 0}`);
      
      if (data.data.breakdown) {
        console.log(`📅 24-hour reminders: ${data.data.breakdown['24-hour'].sent} sent, ${data.data.breakdown['24-hour'].errors} errors`);
        console.log(`⏰ 1-hour reminders: ${data.data.breakdown['1-hour'].sent} sent, ${data.data.breakdown['1-hour'].errors} errors`);
      }
      
      if (data.data.sent > 0) {
        console.log('\n📬 Check your email inbox for the reminder notifications!');
      } else {
        console.log('\n💡 No emails were sent. Try creating test appointments first (option 2).');
      }
    } else {
      console.log('❌ Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Failed to send reminders:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Your app is running');
    console.log('   - You\'re logged in as admin in your browser');
    console.log('   - The URL is correct');
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Start the script
testNotifications(); 