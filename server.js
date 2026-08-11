// HTTPS server for mobile camera access — NutriScan AI
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT_HTTPS = 8443;
const PORT_HTTP = 8080;
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const dev in interfaces) {
        for (const details of interfaces[dev]) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return '127.0.0.1';
}

const LOCAL_IP = getLocalIp();

// Generate self-signed certificate using Node.js crypto (no openssl needed)
function generateSelfSignedCert() {
    const certDir = path.join(__dirname, '.certs');
    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        console.log('🔑 Using existing SSL certificate');
        return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    }

    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    console.log('🔑 Generating self-signed SSL certificate...');

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Build a self-signed X.509 cert using Node 19+ crypto.X509Certificate
    // For older Node, we create a minimal ASN.1 structure
    const cert = generateMinimalCert(privateKey, publicKey);

    fs.writeFileSync(keyPath, privateKey);
    fs.writeFileSync(certPath, cert);
    console.log('✅ SSL certificate generated');

    return { key: privateKey, cert: cert };
}

function generateMinimalCert(privateKeyPem, publicKeyPem) {
    // Use Node's built-in createCertificate if available (Node 21+)
    // Otherwise fall back to a pre-generated cert approach
    
    // For maximum compatibility, generate via child_process with powershell
    const { execSync } = require('child_process');
    const certDir = path.join(__dirname, '.certs');
    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');
    
    // Write the private key first
    fs.writeFileSync(keyPath, privateKeyPem);
    
    // Use PowerShell to create a self-signed cert and export it
    try {
        const ps = `
$cert = New-SelfSignedCertificate -DnsName "localhost","${LOCAL_IP}" -CertStoreLocation "Cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(1) -KeyExportPolicy Exportable -KeySpec KeyExchange -FriendlyName "NutriScan AI Dev"
$certPath = "Cert:\\CurrentUser\\My\\$($cert.Thumbprint)"
Export-Certificate -Cert $certPath -FilePath "${certDir}\\cert.der" -Type CERT
$pwd = ConvertTo-SecureString -String "nutriscan" -Force -AsPlainText
Export-PfxCertificate -Cert $certPath -FilePath "${certDir}\\cert.pfx" -Password $pwd
`;
        execSync(`powershell -Command "${ps.replace(/\n/g, '; ')}"`, { stdio: 'pipe' });
        
        // Convert PFX to PEM using Node crypto
        const pfxData = fs.readFileSync(path.join(certDir, 'cert.pfx'));
        // Node can read PFX directly in the TLS options
        return { pfx: pfxData, passphrase: 'nutriscan' };
    } catch (e) {
        console.log('PowerShell cert generation failed:', e.message);
        return null;
    }
}

// MIME types
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    let urlPath = req.url.split('?')[0];
    
    // Proxy API requests to FastAPI backend
    if (urlPath === '/predict' || urlPath.startsWith('/history') || urlPath === '/ai-advice') {
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: req.url,
            method: req.method,
            headers: req.headers
        };
        // Remove host header so backend doesn't reject it
        delete options.headers.host;
        
        const proxy = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });
        
        proxy.on('error', (e) => {
            console.error('API Proxy Error:', e.message);
            res.writeHead(502);
            res.end('Bad Gateway: ML backend not running on port 8000');
        });
        
        req.pipe(proxy, { end: true });
        return;
    }

    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(FRONTEND_DIR, urlPath);
    if (!filePath.startsWith(FRONTEND_DIR)) { res.writeHead(403); res.end('Forbidden'); return; }

    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
    });
}

// --- Start servers ---
async function startServers() {
    // Start HTTP server
    const httpServer = http.createServer(handleRequest);
    httpServer.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`\n❌ HTTP Port ${PORT_HTTP} is already in use by another process.`);
            console.error(`👉 Close the process using port ${PORT_HTTP} or restart your terminal.\n`);
        } else {
            console.error('HTTP Server Error:', e);
        }
    });
    httpServer.listen(PORT_HTTP, '0.0.0.0', () => {
        console.log(`🌐 HTTP  → http://localhost:${PORT_HTTP}`);
    });

    // Try HTTPS with PowerShell-generated PFX cert
    const certDir = path.join(__dirname, '.certs');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
    
    const pfxPath = path.join(certDir, 'cert.pfx');
    
    if (!fs.existsSync(pfxPath)) {
        console.log('🔑 Generating SSL certificate via PowerShell...');
        const { execSync } = require('child_process');
        try {
            const psScript = `
$cert = New-SelfSignedCertificate -DnsName 'localhost','${LOCAL_IP}' -CertStoreLocation 'Cert:\\CurrentUser\\My' -NotAfter (Get-Date).AddYears(1) -KeyExportPolicy Exportable -FriendlyName 'NutriScan';
$pwd = ConvertTo-SecureString -String 'nutriscan' -Force -AsPlainText;
Export-PfxCertificate -Cert "Cert:\\CurrentUser\\My\\$($cert.Thumbprint)" -FilePath '${pfxPath.replace(/\\/g, '\\\\')}' -Password $pwd
`;
            execSync(`powershell -Command "${psScript.replace(/\r?\n/g, ' ')}"`, { stdio: 'pipe' });
            console.log('✅ SSL certificate created');
        } catch (e) {
            console.error('❌ Could not generate SSL cert:', e.message);
            console.log('\n⚠️  HTTPS not available. Camera will only work on localhost.');
            console.log(`📱 For mobile, use Chrome flag: chrome://flags/#unsafely-treat-insecure-origin-as-secure`);
            console.log(`   Add: http://${LOCAL_IP}:${PORT_HTTP}`);
            return;
        }
    }

    try {
        const pfxData = fs.readFileSync(pfxPath);
        const httpsServer = https.createServer({ pfx: pfxData, passphrase: 'nutriscan' }, handleRequest);
        
        httpsServer.listen(PORT_HTTPS, '0.0.0.0', () => {
            console.log('\n╔══════════════════════════════════════════════════════╗');
            console.log('║      🔒 NutriScan AI — HTTPS Server Running         ║');
            console.log('╠══════════════════════════════════════════════════════╣');
            console.log('║                                                      ║');
            console.log(`║  📱 MOBILE:  https://${LOCAL_IP}:${PORT_HTTPS}       ║`);
            console.log(`║  💻 PC:      https://localhost:${PORT_HTTPS}              ║`);
            console.log('║                                                      ║');
            console.log('║  ⚠️  Phone will show security warning.              ║');
            console.log('║     Tap "Advanced" → "Proceed anyway"               ║');
            console.log('║     Camera will work after that! 📷                  ║');
            console.log('║                                                      ║');
            console.log('╚══════════════════════════════════════════════════════╝');
        });
    } catch (e) {
        console.error('❌ HTTPS server failed:', e.message);
    }
}

startServers();
