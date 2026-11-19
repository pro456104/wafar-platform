#!/usr/bin/env node
// Creates the private development bucket through the S3 gateway, idempotently,
// with a documented `--reset` path that empties it first (T003).
import { readdirSync } from 'node:fs';

const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:8333';
const region = process.env.S3_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET ?? 'wafar';
const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? '';
const reset = process.argv.includes('--reset');

const encoder = new TextEncoder();

function hex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmac(key, value) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? encoder.encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value)));
}

/** The SigV4 signature for one request; the gateway checks it like S3 does. */
export async function signedHeaders(method, path, body = '') {
  const url = new URL(path, endpoint);
  const now = new Date();
  const amzDate = `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256(body);
  const headers = {
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  const signedList = Object.keys(headers).sort();
  const canonicalHeaders = signedList.map((name) => `${name}:${headers[name]}\n`).join('');
  const signedHeadersValue = signedList.join(';');
  const canonicalRequest = [
    method,
    url.pathname,
    '',
    canonicalHeaders,
    signedHeadersValue,
    payloadHash,
  ].join('\n');
  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    await sha256(canonicalRequest),
  ].join('\n');
  const signingKey = await hmac(
    await hmac(await hmac(await hmac(`AWS4${secretAccessKey}`, dateStamp), region), 's3'),
    'aws4_request',
  );
  const signature = hex(await hmac(signingKey, stringToSign));
  return {
    ...headers,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeadersValue}, Signature=${signature}`,
  };
}

async function request(method, path) {
  const headers = await signedHeaders(method, path);
  const response = await fetch(new URL(path, endpoint), { method, headers });
  return response;
}

async function main() {
  if (reset) {
    const listed = await request('GET', `/${bucket}?list-type=2`);
    if (listed.ok) {
      const xml = await listed.text();
      for (const match of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) {
        await request('DELETE', `/${bucket}/${match[1]}`);
      }
      process.stdout.write(`reset: emptied ${bucket}\n`);
    }
  }
  const created = await request('PUT', `/${bucket}`);
  if (created.status === 200 || created.status === 409) {
    process.stdout.write(`bucket ready: ${bucket}\n`);
    return;
  }
  process.stderr.write(`bucket init failed: ${created.status}\n`);
  process.exitCode = 1;
}

if (process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].replaceAll('\\', '/'))) {
  await main();
}

export { request, main, readdirSync };
