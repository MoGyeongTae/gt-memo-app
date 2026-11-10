import { Box, Button, Column, Row, Text } from '@expo/ui/jetpack-compose';
import {
  background,
  fillMaxHeight,
  fillMaxSize,
  padding,
  paddingAll,
  size,
  width,
} from '@expo/ui/jetpack-compose/modifiers';
import { createWidget } from 'expo-widgets';
import type { ReactNode } from 'react';

export type WidgetNote = {
  id: string;
  title: string;
  /** 서식을 뺀 본문. 위젯은 HTML 을 표시할 수 없다. */
  body: string;
  /** 포스트잇 색 (#RRGGBB) */
  color: string;
  /** 앱의 포스트잇과 같은 "월.일" 형식의 작성일 */
  date: string;
};

export type MemoWidgetProps = {
  notes: WidgetNote[];
};

// 이 함수는 문자열로 바뀌어 위젯 런타임에서 따로 실행된다.
// 그래서 바깥 상수나 훅을 쓸 수 없고, 필요한 값은 함수 안에 두거나 props 로 받아야 한다.
const MemoWidget = (props: MemoWidgetProps) => {
  'widget';

  // target 의 "open:" 동작은 patches/ 의 expo-widgets 패치가 처리한다. 누르면 해당 주소로 앱이 열린다.
  // 위젯은 자기 폭을 알 수 없고 Row 를 균등하게 나누는 수단도 없어서 폭을 고정한다.
  const noteWidth = 156;
  const textColor = '#262626';
  // 홈 화면 앱이 위젯을, 메모가 한 장이면 포스트잇 한 장을 기준으로 모서리를 둥글게 자른다.
  // 잘리는 영역이 종이에 닿지 않도록 포스트잇 안쪽으로 종이를 들여놓는다.
  // 위쪽은 테이프 자리(8dp)가 이미 같은 역할을 한다.
  const edgeInset = 8;

  // 위젯에는 그림자와 음수 위치가 없어서 Box 레이어로 앱의 포스트잇을 흉내 낸다.
  // 색은 #RRGGBBAA 순서다. 아래 레이어부터 그림자, 종이, 날짜, 테이프 순으로 쌓인다.
  // 흐림 없는 그림자를 대각선으로 어긋나게 두면 모서리에 턱이 생겨서 아래쪽으로만 내린다.
  const renderPostIt = (
    target: string,
    modifiers: ReturnType<typeof width>[],
    paper: ReactNode,
    date: string,
  ) => (
    <Button
      // @ts-expect-error Android 위젯도 target 을 읽지만 타입에는 빠져 있다.
      target={target}
      modifiers={modifiers}>
      <Box contentAlignment="topCenter" modifiers={[fillMaxSize()]}>
        <Box modifiers={[fillMaxSize(), padding(edgeInset, 11, edgeInset, edgeInset)]}>
          <Box modifiers={[fillMaxSize(), background('#00000029')]} />
        </Box>
        <Box modifiers={[fillMaxSize(), padding(edgeInset, 8, edgeInset, edgeInset + 3)]}>
          {paper}
        </Box>
        {date !== '' ? (
          <Box
            contentAlignment="bottomEnd"
            modifiers={[fillMaxSize(), padding(0, 0, edgeInset + 12, edgeInset + 10)]}>
            <Text color="#00000066" style={{ fontSize: 11 }}>
              {date}
            </Text>
          </Box>
        ) : null}
        <Box modifiers={[size(56, 16), background('#0000001A'), paddingAll(1)]}>
          <Box modifiers={[fillMaxSize(), background('#FFFFFF99')]} />
        </Box>
      </Box>
    </Button>
  );

  const renderNote = (note: WidgetNote) =>
    renderPostIt(
      'open:gtmemoapp://memo/' + note.id,
      [width(noteWidth), fillMaxHeight()],
      <Column modifiers={[fillMaxSize(), background(note.color), padding(12, 14, 12, 8)]}>
        {note.title !== '' ? (
          <Text color={textColor} maxLines={1} style={{ fontSize: 14, fontWeight: 'bold' }}>
            {note.title}
          </Text>
        ) : null}
        {/* 오른쪽 아래 날짜와 겹치지 않도록 앱보다 한 줄 적게 보여준다. */}
        <Text color={textColor} maxLines={note.title !== '' ? 3 : 4} style={{ fontSize: 13 }}>
          {note.body}
        </Text>
      </Column>,
      note.date,
    );

  const first =
    props.notes.length === 0
      ? renderPostIt(
          'open:gtmemoapp://',
          [width(noteWidth), fillMaxHeight()],
          <Box
            contentAlignment="center"
            modifiers={[fillMaxSize(), background('#FFF59D'), paddingAll(12)]}>
            <Text color={textColor} style={{ fontSize: 14 }}>
              앱에서 포스트잇을 길게 눌러 메모를 골라주세요
            </Text>
          </Box>,
          '',
        )
      : renderNote(props.notes[0]);

  return (
    <Row horizontalAlignment="center" modifiers={[fillMaxSize()]}>
      {first}
      {props.notes.length > 1 ? renderNote(props.notes[1]) : null}
    </Row>
  );
};

export default createWidget<MemoWidgetProps>('MemoWidget', MemoWidget, { notes: [] });
