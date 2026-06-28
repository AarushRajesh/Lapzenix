const axios = require('axios');

exports.notify = async (text) => {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_KEY;
  if (!phone || !apiKey) {
    console.log('CallMeBot credentials not configured, skipping WhatsApp notification.');
    return;
  }
  
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;
  axios.get(url).catch((err) => {
    console.error('CallMeBot notification failed:', err.message);
  });
};
