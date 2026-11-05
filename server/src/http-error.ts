/**
 * HTTP 상태 코드를 담은 에러.
 * 처리 함수에서 `throw new HttpError(404, '...')` 하면
 * index.ts 의 에러 처리 미들웨어가 받아서 그 상태 코드로 응답한다.
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
