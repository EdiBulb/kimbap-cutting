// 게임 화면은 720x1280 논리 해상도로 그리고, Phaser가 기기 화면에 맞춰 늘려요.
export const GAME_W = 720;
export const GAME_H = 1280;

// ---- 김밥 (단위: mm) ----
export const ROLL_MM = 200; // 김밥 한 줄 길이
export const DIA_MM = 36; // 김밥 지름
export const SPEED_MM = 18; // 들어오는 속도 (mm/s, 일정)
export const VIEW_MM = 110; // 화면 가로에 보이는 길이

// mm → px
export const PX = GAME_W / VIEW_MM;
export const ROLL_CY = GAME_H * 0.52;
export const ROLL_H = DIA_MM * PX;
export const ROLL_TOP = ROLL_CY - ROLL_H / 2;
export const ROLL_BOT = ROLL_CY + ROLL_H / 2;

// ---- 썰기 판정 ----
export const MIN_SWIPE_PX = 60; // 이만큼은 아래로 그어야 썰기로 인정
export const MAX_SLOPE = 1.2; // 최대 기울기 (약 50도)
export const MIN_GAP_MM = 0.3; // 이보다 가까운 칼질은 겹친 것으로 처리
export const CHOP_SEC = 0.22; // 칼 내려찍는 모션 시간

// ---- 스타일 ----
export const FONT = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
export const COLOR = {
  gold: 0xffd66b,
  goldCss: '#ffd66b',
  brownCss: '#3b2416',
  rice: 0xf6f1e4,
  sesame: 0xefe2bf,
};
