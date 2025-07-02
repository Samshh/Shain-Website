import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export interface Branch {
  id: string;
  name: string;
  location: string;
}

const branchRef = collection(db, "branch");

export const getAllBranches = async (): Promise<Branch[]> => {
  try {
    const snapshot = await getDocs(branchRef);
    return snapshot.docs.map((doc) => {
      const { name, location } = doc.data();
      return { id: doc.id, name, location };
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

export const getBranchById = async (id: string): Promise<Branch | null> => {
  try {
    const docRef = doc(db, "branch", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const { name, location } = docSnap.data();
    return { id: docSnap.id, name, location };
  } catch (error) {
    console.error("Error fetching branch by ID:", error);
    throw error;
  }
};
