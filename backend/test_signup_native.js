const http = require('http');

const data = JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    phone: '1234567890',
    role: 'buyer',
    campus_id: '1',
    password: 'password'
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
