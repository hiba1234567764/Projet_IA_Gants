const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

const app = initializeApp();
const db = getFirestore(app, 'gloves');

async function requireAdmin(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');

  const profile = await db.collection('users').doc(request.auth.uid).get();
  if (profile.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can manage accounts.');
  }
}

exports.setUserRole = onCall(async (request) => {
  await requireAdmin(request);
  const { uid, role } = request.data ?? {};

  if (typeof uid !== 'string' || !['user', 'admin'].includes(role)) {
    throw new HttpsError('invalid-argument', 'A valid uid and role are required.');
  }
  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'You cannot change your own role.');
  }

  await db.collection('users').doc(uid).update({ role });
  return { uid, role };
});

exports.deleteUserAccount = onCall(async (request) => {
  await requireAdmin(request);
  const { uid } = request.data ?? {};

  if (typeof uid !== 'string' || !uid) {
    throw new HttpsError('invalid-argument', 'A valid uid is required.');
  }
  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'You cannot delete your own account.');
  }

  await getAuth(app).deleteUser(uid);

  const scans = await db.collection('scans').where('uid', '==', uid).get();
  for (let index = 0; index < scans.docs.length; index += 400) {
    const batch = db.batch();
    scans.docs.slice(index, index + 400).forEach((scan) => batch.delete(scan.ref));
    await batch.commit();
  }
  await db.collection('users').doc(uid).delete();
  return { uid };
});
