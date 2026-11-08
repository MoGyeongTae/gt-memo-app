import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { type NoteColor, randomNoteColor, toNoteColor } from '@/lib/note-colors';
import { isRichHtml, plainTextToHtml } from '@/lib/rich-text';

export type Memo = {
  id: string;
  /** 리치 에디터가 만든 HTML (`<html>...</html>`). 글자만 필요하면 htmlToPlainText 를 쓴다. */
  content: string;
  /** 포스트잇 색. 만들 때 정해지고, 목록과 상세 화면에서 같은 색으로 보인다. */
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
};

type MemoStore = {
  memos: Memo[];
  addMemo: (content: string, color?: NoteColor) => void;
  updateMemo: (id: string, content: string) => void;
  deleteMemo: (id: string) => void;
};

/** zustand 이전 버전이 메모 배열을 그대로 저장하던 키 */
const LEGACY_KEY = 'memos';

/**
 * kv-store 의 동기 API 를 쓰는 저장소.
 * 동기로 읽어야 앱이 켜지자마자 메모가 채워진 상태로 시작한다 (빈 화면 깜빡임 없음).
 */
const memoStorage: StateStorage = {
  getItem: (name) => {
    const value = Storage.getItemSync(name);
    if (value !== null) return value;

    // 이전 형식(배열만 저장)으로 남아 있는 메모를 zustand 형식으로 옮겨 읽는다.
    const legacy = Storage.getItemSync(LEGACY_KEY);
    return legacy ? JSON.stringify({ state: { memos: JSON.parse(legacy) }, version: 0 }) : null;
  },
  setItem: (name, value) => {
    Storage.setItemSync(name, value);
  },
  removeItem: (name) => {
    Storage.removeItemSync(name);
  },
};

export const useMemoStore = create<MemoStore>()(
  persist(
    (set) => ({
      memos: [],
      addMemo: (content, color = randomNoteColor()) => {
        const now = Date.now();
        const memo: Memo = {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          content,
          color,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ memos: [memo, ...state.memos] }));
      },
      updateMemo: (id, content) =>
        set((state) => ({
          memos: state.memos.map((memo) =>
            memo.id === id ? { ...memo, content, updatedAt: Date.now() } : memo,
          ),
        })),
      deleteMemo: (id) => set((state) => ({ memos: state.memos.filter((memo) => memo.id !== id) })),
    }),
    {
      name: 'memo-store',
      storage: createJSONStorage(() => memoStorage),
      // 함수(액션)는 저장하지 않고 메모 목록만 저장한다.
      partialize: (state) => ({ memos: state.memos }),
      // 저장 형식 버전. 형식이 바뀔 때마다 올리고, migrate 에서 예전 데이터를 새 형식으로 바꾼다.
      // - 0: 색 없음
      // - 1: 메모마다 color 저장
      // - 2: content 를 일반 텍스트 대신 리치 에디터 HTML 로 저장
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { memos?: Partial<Memo>[] };
        let memos = state.memos ?? [];
        if (version < 1) {
          // 색이 없던 예전 메모에 랜덤 색을 한 번 정해서 저장한다.
          memos = memos.map((memo) => ({ ...memo, color: toNoteColor(memo.color) }));
        }
        if (version < 2) {
          // 일반 텍스트 본문을 줄마다 <p> 로 감싼 HTML 로 바꾼다.
          memos = memos.map((memo) => {
            const content = memo.content ?? '';
            return { ...memo, content: isRichHtml(content) ? content : plainTextToHtml(content) };
          });
        }
        return { memos: memos as Memo[] };
      },
    },
  ),
);

export type MemoSection = {
  /** 'YYYY-MM' */
  key: string;
  title: string;
  /** 이 달의 전체 메모 수 (limit 으로 잘리기 전) */
  total: number;
  data: Memo[][];
};

export function monthKey(memo: Memo) {
  const date = new Date(memo.createdAt);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthTitle(key: string) {
  const [year, month] = key.split('-');
  return `${year}년 ${Number(month)}월`;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

/**
 * 년/월 단위로 묶고, 각 섹션 안에서는 columns 개씩 한 줄로 묶는다.
 * limit 을 주면 섹션마다 최신 메모 limit 개까지만 담는다.
 */
export function groupByMonth(list: Memo[], columns: number, limit = Infinity): MemoSection[] {
  const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
  const groups = new Map<string, Memo[]>();

  for (const memo of sorted) {
    const key = monthKey(memo);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(memo);
  }

  return [...groups.entries()].map(([key, items]) => ({
    key,
    title: monthTitle(key),
    total: items.length,
    data: chunk(items.slice(0, limit), columns),
  }));
}
