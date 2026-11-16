const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = 3456;
const RPC = 'http://127.0.0.1:28114';

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${HOST}:${PORT}`).pathname;
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(html);
    return;
  }
  if (req.method === 'POST' && pathname === '/api/rpc') {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 12000) return json(res, 413, {error: 'Request too large'});
    }
    let payload;
    try { payload = JSON.parse(raw); } catch { return json(res, 400, {error: 'Invalid JSON'}); }
    if (!['get_transaction','get_tip_block_number','get_live_cell'].includes(payload.method)) return json(res, 400, {error:'Method not allowed'});
    if (!Array.isArray(payload.params)) return json(res, 400, {error: 'Invalid params'});
    if (payload.method === 'get_transaction' && !(payload.params.length === 1 && /^0x[a-fA-F0-9]{64}$/.test(payload.params[0]))) return json(res,400,{error:'Invalid transaction hash'});
    if (payload.method === 'get_live_cell' && !(payload.params.length === 2 && payload.params[0] && /^0x[a-fA-F0-9]{64}$/.test(payload.params[0].tx_hash) && /^0x[0-9a-fA-F]+$/.test(payload.params[0].index) && typeof payload.params[1] === 'boolean')) return json(res,400,{error:'Invalid live cell parameters'});
    if (payload.method === 'get_tip_block_number' && payload.params.length !== 0) return json(res,400,{error:'Invalid params'});
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      let upstream;
      try {
        upstream = await fetch(RPC, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:1,jsonrpc:'2.0',method:payload.method,params:payload.params}), signal:controller.signal});
      } finally { clearTimeout(timeout); }
      const result = await upstream.json();
      json(res, upstream.ok ? 200 : 502, result);
    } catch (error) {
      json(res, 502, {error:`Không kết nối được OffCKB tại ${RPC}. Hãy kiểm tra lệnh offckb node.`, detail:error.message});
    }
    return;
  }
  json(res, 404, {error:'Not found'});
}).listen(PORT, HOST, () => {
  console.log(`CKB Week 1 Dashboard: http://${HOST}:${PORT}`);
  console.log(`Using OffCKB RPC: ${RPC}`);
  console.log('Press Ctrl+C to stop.');
});
