// 메모 API: URL 과 처리 함수를 연결한다.
//
// | 메서드 | 경로         | 설명         |
// |--------|--------------|--------------|
// | GET    | /memos       | 메모 목록    |
// | GET    | /memos/:id   | 메모 한 개   |
// | POST   | /memos       | 메모 만들기  |
// | PUT    | /memos/:id   | 메모 수정    |
// | DELETE | /memos/:id   | 메모 삭제    |
import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

import { Router } from 'express';

import { HttpError } from './http-error.ts';

/** 메모 한 개. 앱의 TypeScript Memo 타입과 모양이 같다. */
export type Memo = {
  id: string;
  content: string;
  /** 1970-01-01 부터 지난 밀리초 (JS 의 Date.now() 와 같은 단위) */
  createdAt: number;
  updatedAt: number;
};

const MAX_ID_LENGTH = 100;

// DB 컬럼 이름(created_at)을 앱에서 쓰는 이름(createdAt)으로 바꿔서 꺼낸다.
const MEMO_COLUMNS = 'id, content, created_at AS createdAt, updated_at AS updatedAt';

/**
 * 메모 API 라우터를 만든다.
 * DB 를 인자로 받아서 쓰기 때문에, 테스트할 때 다른 DB 를 넣어줄 수도 있다.
 */
export function createMemoRouter(db: DatabaseSync): Router {
  const router = Router();

  // GET /memos — 삭제되지 않은 메모를 최신순으로 돌려준다.
  router.get('/', (_req, res) => {
    const memos = db
      .prepare(`SELECT ${MEMO_COLUMNS} FROM memos WHERE deleted_at IS NULL ORDER BY created_at DESC`)
      .all();
    res.json(memos);
  });

  // GET /memos/:id — ":id" 자리에 온 값은 req.params.id 로 꺼낸다.
  router.get('/:id', (req, res) => {
    res.json(findMemo(db, req.params.id));
  });

  // POST /memos — 새 메모를 만들고 201 Created 와 함께 돌려준다.
  router.post('/', (req, res) => {
    const content = parseContent(req.body?.content);
    const id = req.body?.id === undefined ? randomUUID() : parseId(req.body.id);
    const now = Date.now();
    const createdAt = req.body?.createdAt === undefined ? now : parseTime(req.body.createdAt);

    // 지운 메모까지 포함해서 같은 ID 가 있는지 확인한다.
    const exists = db.prepare('SELECT 1 FROM memos WHERE id = ?').get(id);
    if (exists) {
      throw new HttpError(400, `이미 있는 메모 ID 입니다: ${id}`);
    }

    // SQL 의 ? 자리에 값을 순서대로 넣는다. 값을 문자열로 이어붙이지 않아야 SQL 인젝션을 막을 수 있다.
    // RETURNING 은 방금 넣은 행을 바로 돌려준다.
    const memo = db
      .prepare(
        `INSERT INTO memos (id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         RETURNING ${MEMO_COLUMNS}`,
      )
      .get(id, content, createdAt, now);

    res.status(201).json(memo);
  });

  // PUT /memos/:id — 내용을 바꾸고 수정 시각을 갱신한다.
  router.put('/:id', (req, res) => {
    const content = parseContent(req.body?.content);

    const memo = db
      .prepare(
        `UPDATE memos SET content = ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL
         RETURNING ${MEMO_COLUMNS}`,
      )
      .get(content, Date.now(), req.params.id);

    // 바뀐 행이 없으면 undefined → 없는 메모
    if (!memo) throw new HttpError(404, '메모를 찾을 수 없습니다');
    res.json(memo);
  });

  // DELETE /memos/:id — 실제로 지우지 않고 deleted_at 만 기록한다 (soft delete).
  router.delete('/:id', (req, res) => {
    const now = Date.now();
    const result = db
      .prepare('UPDATE memos SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL')
      .run(now, now, req.params.id);

    // changes: 실제로 바뀐 행 수. 0 이면 원래 없던(또는 이미 지운) 메모다.
    if (result.changes === 0) throw new HttpError(404, '메모를 찾을 수 없습니다');
    res.status(204).end(); // 204 No Content: 성공했지만 돌려줄 본문은 없음
  });

  return router;
}

function findMemo(db: DatabaseSync, id: string) {
  const memo = db
    .prepare(`SELECT ${MEMO_COLUMNS} FROM memos WHERE id = ? AND deleted_at IS NULL`)
    .get(id);
  if (!memo) throw new HttpError(404, '메모를 찾을 수 없습니다');
  return memo;
}

// ── 요청 값 검사 ──────────────────────────────────────────────
// 요청 본문(req.body)은 클라이언트가 보낸 JSON 이라 타입을 믿을 수 없다(any).
// 그래서 `unknown` 으로 받아서 직접 확인한 뒤에만 쓴다.

/** 앞뒤 공백을 지운 내용을 돌려준다. 문자열이 아니거나 비어 있으면 400. */
function parseContent(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, '메모 내용(content)은 비어 있지 않은 문자열이어야 합니다');
  }
  return value.trim();
}

function parseId(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ID_LENGTH) {
    throw new HttpError(400, `메모 ID 는 1~${MAX_ID_LENGTH}자 문자열이어야 합니다`);
  }
  return value;
}

function parseTime(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new HttpError(400, 'createdAt 은 밀리초 단위의 정수여야 합니다');
  }
  return value;
}
