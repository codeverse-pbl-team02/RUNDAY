import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { hasRecentAuthentication, performDeletion } from './deletion';

initializeApp();
const uploadBucket = defineString('USER_UPLOAD_BUCKET', { default: '' });

export const deleteAccount = onCall({
  region: 'asia-northeast3', timeoutSeconds: 120, memory: '256MiB', maxInstances: 5,
}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  if (request.data?.confirmation !== 'DELETE') throw new HttpsError('invalid-argument', 'Confirmation required.');
  if (!hasRecentAuthentication(request.auth.token.auth_time, Date.now() / 1000)) {
    throw new HttpsError('failed-precondition', 'Reauthenticate before deleting your account.');
  }
  // Never accept a target UID from the client.
  const uid = request.auth.uid;
  const db = getFirestore();
  const marker = db.doc(`_rundayAccountDeletions/${uid}`);
  try {
    await performDeletion({
      mark: () => marker.set({ requestedAt: FieldValue.serverTimestamp() }),
      removeDocuments: () => db.recursiveDelete(db.doc(`rundayUsers/${uid}`)),
      removeFiles: async () => {
        const name = uploadBucket.value();
        if (name) await getStorage().bucket(name).deleteFiles({ prefix: `rundayUsers/${uid}/` });
      },
      removeIdentity: async () => {
        try { await getAuth().deleteUser(uid); }
        catch (error) {
          if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
        }
      },
      clearMarker: () => marker.delete(),
      onMarkerError: (error) => logger.error('Account removed; deletion marker cleanup required', { uid, error }),
    });
    return { deleted: true };
  } catch (error) {
    logger.error('Account deletion incomplete; owner may retry', { uid, error });
    throw new HttpsError('internal', 'Deletion incomplete. Reauthenticate and retry.');
  }
});
