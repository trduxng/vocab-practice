const sql = require('mssql');
require('dotenv').config();

const serverClean = (process.env.DB_SERVER || '').replace(/"/g, '');
const serverParts = serverClean.split('\\').filter(Boolean);
const host = serverParts[0];
const instance = serverParts[1];

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: host,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        instanceName: instance,
        encrypt: true,
        trustServerCertificate: true
    },
    connectTimeout: 30000
};

console.log('--- DIAGNOSTIC START ---');
console.log('Host:', host);
console.log('Instance:', instance);
console.log('Port:', config.port);
console.log('Connecting...');

sql.connect(config).then(() => {
    console.log('✅ SUCCESS: Connected to SQL Server!');
    process.exit(0);
}).catch(err => {
    console.error('❌ FAIL: Connection Error');
    console.error(err);
    process.exit(1);
});
