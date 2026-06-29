const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:4000/api/enquiries', {
      name: 'Test System',
      phone: '1234567890',
      email: 'sys@test.com',
      service: 'build',
      details: { test: true }
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
}
test();
