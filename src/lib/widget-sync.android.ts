import { useMemoStore } from '@/lib/memo-store';
import { NOTE_HEX } from '@/lib/note-colors';
import { htmlToPlainText } from '@/lib/rich-text';
import MemoWidget, { type MemoWidgetProps } from '@/widgets/memo-widget';

type StoreState = ReturnType<typeof useMemoStore.getState>;

function toWidgetProps({ memos, widgetMemoIds }: StoreState): MemoWidgetProps {
  const notes = widgetMemoIds.flatMap((id) => {
    const memo = memos.find((item) => item.id === id);
    if (!memo) return [];
    const date = new Date(memo.createdAt);
    return [
      {
        id: memo.id,
        title: memo.title,
        body: htmlToPlainText(memo.content),
        color: NOTE_HEX[memo.color],
        date: `${date.getMonth() + 1}.${date.getDate()}`,
      },
    ];
  });
  return { notes };
}

/** 앱을 켤 때 한 번, 그 뒤로는 위젯에 보이는 내용이 바뀔 때마다 위젯을 갱신한다. */
export function startWidgetSync() {
  let last = '';
  const sync = (state: StoreState) => {
    const props = toWidgetProps(state);
    const next = JSON.stringify(props);
    if (next === last) return;
    last = next;
    MemoWidget.updateSnapshot(props);
  };

  sync(useMemoStore.getState());
  useMemoStore.subscribe(sync);
}
