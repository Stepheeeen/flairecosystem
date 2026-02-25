import axios from 'axios';
import fs from 'fs';

async function testApi() {
  try {
    const res = await axios.get('http://127.0.0.1:3000/api/products');
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("API Error Response:", err.response.status, err.response.data);
    } else {
      console.error("Fetch Error:", err.message);
    }
  }
}
testApi();
