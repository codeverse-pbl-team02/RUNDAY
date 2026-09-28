export function authError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-email': '이메일 주소를 확인해 주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/wrong-password': '비밀번호를 확인해 주세요.',
    'auth/user-not-found': '로그인 정보를 확인해 주세요.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다. 로그인 또는 비밀번호 찾기를 이용해 주세요.',
    'auth/weak-password': '비밀번호를 더 안전하게 설정해 주세요.',
    'auth/password-does-not-meet-requirements': '비밀번호가 서비스의 보안 조건에 맞지 않습니다.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/network-request-failed': '인터넷 연결을 확인하고 다시 시도해 주세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도할 수 있습니다.',
    'auth/cancelled-popup-request': '로그인 요청이 취소됐습니다.',
    'auth/popup-blocked': '브라우저에서 로그인 팝업을 허용해 주세요.',
    'auth/unauthorized-domain': '현재 주소에서 로그인을 사용할 수 없습니다. 관리자에게 문의해 주세요.',
    'auth/operation-not-allowed': '이 로그인 방식은 아직 준비 중입니다.',
    'auth/requires-recent-login': '계속하려면 다시 본인 인증해 주세요.',
    'auth/user-disabled': '사용할 수 없는 계정입니다. 관리자에게 문의해 주세요.',
    'permission-denied': '회원 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.',
    'unavailable': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    'functions/unauthenticated': '로그인 또는 본인 인증을 다시 진행해 주세요.',
    'functions/failed-precondition': '탈퇴를 진행하려면 본인 인증을 다시 진행해 주세요.',
    'functions/not-found': '계정 관리 서비스를 준비 중입니다. 관리자에게 문의해 주세요.',
    'functions/internal': '탈퇴 처리를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    'functions/unavailable': '계정 관리 서버에 연결할 수 없습니다. 다시 시도해 주세요.',
  };
  if (code) return messages[code] || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  return error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
}
