import assert from "node:assert/strict";
import test from "node:test";
import { roomPhotoSource } from "./photo-viewer";

test("사진 조회 URL의 서명과 경로를 변경하지 않는다", () => {
  const url =
    "https://photos.example.com/room%20photo.jpg?X-Amz-Signature=fixture%2Bsignature&X-Amz-Expires=900";
  assert.equal(roomPhotoSource(url), url);
});

for (const url of [
  "http://photos.example.com/photo.jpg",
  "javascript:alert(1)",
  "data:image/svg+xml,<svg></svg>",
  "blob:https://example.com/photo",
  "https://user:password@example.com/photo.jpg",
  "//example.com/photo.jpg",
  "/private/photo.jpg",
  "not a url",
]) {
  test(`안전한 HTTPS 사진 주소가 아니면 이미지 요청을 만들지 않는다: ${url.split(":")[0]}`, () => {
    assert.equal(roomPhotoSource(url), null);
  });
}
