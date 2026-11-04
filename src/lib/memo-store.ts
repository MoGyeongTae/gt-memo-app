import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export type Memo = {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'memos';

function load(): Memo[] {
  try {
    const raw = Storage.getItemSync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Memo[]) : [];
  } catch {
    return [];
  }
}

let memos: Memo[] = load();
const listeners = new Set<() => void>();

function commit(next: Memo[]) {
  memos = next;
  Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMemos() {
  return useSyncExternalStore(subscribe, () => memos);
}

export function getMemo(id: string) {
  return memos.find((memo) => memo.id === id);
}

export function addMemo(content: string) {
  const now = Date.now();
  const memo: Memo = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    createdAt: now,
    updatedAt: now,
  };
  commit([memo, ...memos]);
  return memo;
}

export function updateMemo(id: string, content: string) {
  commit(memos.map((memo) => (memo.id === id ? { ...memo, content, updatedAt: Date.now() } : memo)));
}

export function deleteMemo(id: string) {
  commit(memos.filter((memo) => memo.id !== id));
}

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
