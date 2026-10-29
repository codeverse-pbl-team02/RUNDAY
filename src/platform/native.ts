import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const privacyPolicyUrl = 'https://dramatic-bait-2f3.notion.site/Rundy_-17a220ff753d80a0b757de50c6c034f3';

export async function openPrivacyPolicy() {
  if (isNative) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: privacyPolicyUrl });
  } else window.open(privacyPolicyUrl, '_blank', 'noopener,noreferrer');
}

export async function nativeGoogleCredential() {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const { GoogleAuthProvider } = await import('firebase/auth');
  const result = await FirebaseAuthentication.signInWithGoogle();
  if (!result.credential?.idToken) throw new Error('Google 로그인 정보를 받지 못했습니다. 다시 시도해 주세요.');
  return GoogleAuthProvider.credential(result.credential.idToken, result.credential.accessToken);
}
