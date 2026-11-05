// SQLite 데이터베이스를 열고 메모 테이블을 준비한다.
//
// `node:sqlite` 는 Node 에 내장된 SQLite 모듈이다. 따로 설치할 패키지가 없다.
// DatabaseSync 는 "동기" API 라서 await 없이 바로 결과가 돌아온다.
// (SQLite 는 파일을 직접 읽어서 아주 빠르기 때문에, 작은 서버에서는 동기로 써도 충분하다)
import { DatabaseSync } from 'node:sqlite';

export function openDatabase(path: string): DatabaseSync {
  const db = new DatabaseSync(path); // 파일이 없으면 새로 만든다.

  // WAL 모드: 쓰는 중에도 다른 요청이 읽을 수 있어서 서버에 잘 맞는다.
  db.exec('PRAGMA journal_mode = WAL');

  // 테이블이 없을 때만 만든다. 서버를 다시 켜도 기존 데이터는 그대로 남는다.
  // 시각은 앱(JS)의 Date.now() 와 같은 "1970년부터 지난 밀리초" 정수로 저장한다.
  db.exec(`
    CREATE TABLE IF NOT EXISTS memos (
      id          TEXT    PRIMARY KEY NOT NULL, -- 앱이 오프라인에서 만든 ID 도 받을 수 있게 문자열
      content     TEXT    NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL,
      -- 삭제한 시각. NULL 이면 살아있는 메모.
      -- 행을 바로 지우지 않고 표시만 해두면(soft delete), 나중에 다른 기기와 동기화할 때
      -- "이 메모는 지워졌다"는 사실을 전달할 수 있다.
      deleted_at  INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos (created_at);
  `);

  return db;
}
