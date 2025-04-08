require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const testMessage = async () => {
  try {
    const response = await client.messages.create({
      body: 'This is a test message from Twilio!',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+91 7695960911',  // Your verified recipient phone number
    });
    console.log(`Message sent successfully: ${response.sid}`);
  } catch (error) {
    console.error('Failed to send test message:', error.message);
    console.error('Full error details:', error);
  }
};

testMessage();
