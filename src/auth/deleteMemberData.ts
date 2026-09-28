import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, writeBatch, type Firestore } from 'firebase/firestore';

export async function deleteMemberData(db: Firestore, uid: string) {
  const profile = doc(db, 'rundayUsers', uid);
  if ((await getDoc(profile)).exists()) {
    // Security rules reject new runs after this lock, including writes from another tab.
    await updateDoc(profile, { deleting: true, updatedAt: serverTimestamp() });
  }
  const runs = collection(db, 'rundayUsers', uid, 'runs');
  while (true) {
    const page = await getDocs(query(runs, limit(100)));
    if (page.empty) break;
    const batch = writeBatch(db);
    for (const record of page.docs) batch.delete(record.ref);
    await batch.commit();
  }
  await deleteDoc(profile);
}
