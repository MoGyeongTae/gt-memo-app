# memo-server

메모 앱용 Node.js 서버 (Express + SQLite).

Node 24 이상이 필요하다. Node 가 TypeScript 파일을 바로 실행하고 SQLite(`node:sqlite`)도
내장하고 있어서, 빌드 단계나 별도의 데이터베이스 설치가 없다.

## 실행

처음 한 번, 서버 의존성 설치 (저장소 루트에서):

```bash
npm --prefix server install
```

그다음부터는 저장소 루트에서:

```bash
npm run server   # 서버만 실행 (코드를 저장하면 자동 재시작)
npm run dev      # Expo 개발 서버와 함께 실행
```

- 주소: `http://localhost:3000` — 같은 와이파이의 폰에서는 `http://<PC의 IP>:3000`
- DB 파일: `server/memo.db` (처음 실행할 때 자동 생성, git 에는 올라가지 않음)

| 환경 변수       | 기본값           | 설명             |
|-----------------|------------------|------------------|
| `PORT`          | `3000`           | 포트             |
| `DATABASE_PATH` | `server/memo.db` | SQLite 파일 경로 |

## API

| 메서드 | 경로         | 본문                                 | 응답               |
|--------|--------------|--------------------------------------|--------------------|
| GET    | `/health`    |                                      | `ok`               |
| GET    | `/memos`     |                                      | 메모 배열 (최신순) |
| GET    | `/memos/:id` |                                      | 메모 / 404         |
| POST   | `/memos`     | `{ "content", "id"?, "createdAt"? }` | 201 + 메모         |
| PUT    | `/memos/:id` | `{ "content" }`                      | 메모 / 404         |
| DELETE | `/memos/:id` |                                      | 204 / 404          |

메모 JSON: `{ "id": string, "content": string, "createdAt": number, "updatedAt": number }`
(시각은 JS `Date.now()` 와 같은 밀리초)

삭제는 행을 지우지 않고 `deleted_at` 만 기록한다 (나중에 기기 간 동기화에 사용).

## 코드 구조

- `src/index.ts` — 설정, 미들웨어, 에러 처리, 서버 시작
- `src/memos.ts` — 메모 API (URL 과 처리 함수)
- `src/db.ts` — SQLite 열기, 테이블 만들기
- `src/http-error.ts` — 상태 코드를 담은 에러
