// 메모 서버의 시작점.
//
// 하는 일:
// 1. 설정(포트, DB 파일 경로)을 환경 변수에서 읽는다.
// 2. SQLite 데이터베이스를 연다.
// 3. Express 앱에 미들웨어와 라우터를 붙이고 HTTP 서버를 띄운다.
import path from 'node:path';

import express, { type ErrorRequestHandler } from 'express';

import { openDatabase } from './db.ts';
import { HttpError } from './http-error.ts';
import { createMemoRouter } from './memos.ts';

// import.meta.dirname 은 이 파일이 있는 폴더(server/src)다.
// 그래서 어느 폴더에서 실행하든 DB 파일은 항상 server/memo.db 에 생긴다.
const DATABASE_PATH = process.env.DATABASE_PATH ?? path.join(import.meta.dirname, '..', 'memo.db');
const PORT = Number(process.env.PORT ?? 3000);

const db = openDatabase(DATABASE_PATH);
const app = express();

// ── 미들웨어 ──────────────────────────────────────────────────
// 미들웨어는 모든 요청이 처리 함수에 닿기 전에 순서대로 거치는 함수다.
// next() 를 불러야 다음 단계로 넘어간다.

// 요청마다 "GET /memos 200 3ms" 같은 로그를 남긴다.
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// 웹 브라우저에서 호출할 때 필요한 CORS 허용. (네이티브 앱은 CORS 와 상관없다)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// 요청 본문의 JSON 을 읽어서 req.body 에 넣어준다.
app.use(express.json());

// ── 라우트 ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.send('ok');
});

// /memos 로 시작하는 요청은 메모 라우터가 처리한다.
app.use('/memos', createMemoRouter(db));

// 어떤 라우트에도 맞지 않으면 404
app.use((_req, _res) => {
  throw new HttpError(404, '없는 경로입니다');
});

// ── 에러 처리 ─────────────────────────────────────────────────
// 인자가 4개인 미들웨어는 Express 가 "에러 처리용" 으로 인식한다.
// 처리 함수에서 throw 한 에러가 모두 여기로 모인다.
const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  // express.json() 이 잘못된 JSON 을 받으면 status 400 인 에러를 던진다.
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: '요청 본문이 올바른 JSON 이 아닙니다' });
    return;
  }
  // 예상하지 못한 에러: 자세한 내용은 서버 로그에만 남기고, 응답에는 일반적인 문구만 보낸다.
  console.error(error);
  res.status(500).json({ error: '서버 에러가 발생했습니다' });
};
app.use(handleError);

// ── 서버 시작 ─────────────────────────────────────────────────
// '0.0.0.0' 으로 열어야 같은 와이파이의 폰에서도 PC 의 IP 로 접속할 수 있다.
// ('127.0.0.1' 로 열면 이 PC 안에서만 접속된다)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`메모 서버 시작: http://localhost:${PORT} (DB: ${DATABASE_PATH})`);
});

// Ctrl+C 를 누르면 처리 중인 요청을 마무리하고 DB 를 닫은 뒤 종료한다.
process.on('SIGINT', () => {
  console.log('서버를 종료합니다');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
