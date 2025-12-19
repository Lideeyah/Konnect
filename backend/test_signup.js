const fetch = require('node-fetch');

async function testSignup() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test' + Date.now() + '@example.com',
                phone: '1234567890',
                role: 'buyer',
                campus_id: '1',
                password: 'password'
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testSignup();
