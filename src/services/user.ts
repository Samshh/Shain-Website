import { db, auth } from "@/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export interface User {
  id: string;
  branch_id: string;
  firebase_uid: string;
  role: "admin" | "branch_manager";
  username: string;
  branch_name?: string;
  created_at?: string;
}

const userRef = collection(db, "user");
const branchRef = collection(db, "branch");

export const getUserRole = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User is not authenticated");

  const q = query(userRef, where("firebase_uid", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return snapshot.docs[0].data().role;
};

export const getUsername = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User is not authenticated");

  const q = query(userRef, where("firebase_uid", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return snapshot.docs[0].data().username;
};

export const getUserBranch = async (): Promise<string | null> => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User is not authenticated");

  const q = query(userRef, where("firebase_uid", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const userData = snapshot.docs[0].data();
  const branchId = userData.branch_id;

  if (!branchId) return null;

  const branchDocRef = doc(branchRef, String(branchId));
  const branchDoc = await getDoc(branchDocRef);

  if (!branchDoc.exists()) return null;

  const branchData = branchDoc.data();
  return branchData.name as string;
};

// Get all users with branch names resolved
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(userRef);
    const users = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const { branch_id, firebase_uid, role, username, created_at } =
          docSnap.data();

        let branchName = "No Branch";
        if (branch_id && branch_id !== "0") {
          const branchDoc = await getDoc(doc(branchRef, String(branch_id)));
          if (branchDoc.exists()) {
            branchName = branchDoc.data().name;
          }
        }

        const createdAtStr =
          created_at instanceof Timestamp
            ? created_at.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown";

        return {
          id: docSnap.id,
          branch_id: String(branch_id),
          firebase_uid,
          role,
          username,
          branch_name: branchName,
          created_at: createdAtStr,
        };
      })
    );

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Update an existing user (admin function)
export const updateUser = async (
  id: string,
  updates: Partial<{
    branch_id: string;
    role: "admin" | "branch_manager";
    username: string;
  }>
) => {
  try {
    const docRef = doc(db, "user", id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete a user (admin function)
export const deleteUser = async (id: string) => {
  try {
    await deleteDoc(doc(db, "user", id));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Get user by Firebase UID
export const getUserByFirebaseUID = async (
  firebaseUID: string
): Promise<User | null> => {
  try {
    const q = query(userRef, where("firebase_uid", "==", firebaseUID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const { branch_id, firebase_uid, role, username, created_at } =
      docSnap.data();

    let branchName = "No Branch";
    if (branch_id && branch_id !== "0") {
      const branchDoc = await getDoc(doc(branchRef, String(branch_id)));
      if (branchDoc.exists()) {
        branchName = branchDoc.data().name;
      }
    }

    const createdAtStr =
      created_at instanceof Timestamp
        ? created_at.toDate().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Unknown";

    return {
      id: docSnap.id,
      branch_id: String(branch_id),
      firebase_uid,
      role,
      username,
      branch_name: branchName,
      created_at: createdAtStr,
    };
  } catch (error) {
    console.error("Error fetching user by Firebase UID:", error);
    throw error;
  }
};

export const updateUserCredentials = async ({
  currentEmail,
  currentPassword,
  newEmail,
  newPassword,
  newUsername,
}: {
  currentEmail: string;
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
  newUsername?: string;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated");

  // Step 1: Re-authenticate
  const credential = EmailAuthProvider.credential(
    currentEmail,
    currentPassword
  );
  await reauthenticateWithCredential(user, credential);

  // Step 2: Update email
  if (newEmail) {
    await updateEmail(user, newEmail);
  }

  // Step 3: Update password
  if (newPassword) {
    await updatePassword(user, newPassword);
  }

  // Step 4: Update Firestore username
  if (newUsername) {
    const q = query(userRef, where("firebase_uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, "user", snapshot.docs[0].id);
      await updateDoc(docRef, { username: newUsername });
    }
  }
};

// Get current user profile data
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated");

  const q = query(userRef, where("firebase_uid", "==", user.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("User profile not found");
  }

  const userData = snapshot.docs[0].data();

  // Get branch name if branch_id exists
  let branchName = "No Branch Assigned";
  if (userData.branch_id && userData.branch_id !== "0") {
    try {
      const branchDoc = await getDoc(doc(db, "branch", userData.branch_id));
      if (branchDoc.exists()) {
        branchName = branchDoc.data().name;
      }
    } catch (error) {
      console.error("Error fetching branch:", error);
    }
  }

  return {
    id: snapshot.docs[0].id,
    username: userData.username,
    email: user.email,
    role: userData.role,
    branch_id: userData.branch_id,
    branch_name: branchName,
    created_at: userData.created_at,
    firebase_uid: userData.firebase_uid,
  };
};
