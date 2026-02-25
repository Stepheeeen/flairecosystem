import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('http://localhost:3000/api/companies/vellion');
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

test();
