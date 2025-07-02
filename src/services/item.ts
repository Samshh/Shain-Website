import { db } from "@/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";

export interface Item {
  id: string;
  category: string;
  name: string;
  stock: number;
  unit: string;
}

const itemRef = collection(db, "item");

// READ
export const getAllItems = async (): Promise<Item[]> => {
  try {
    const snapshot = await getDocs(itemRef);
    return snapshot.docs.map((doc) => {
      const { category, name, critical_level, unit } = doc.data();
      return { id: doc.id, category, name, stock: critical_level, unit };
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// CREATE
export const createItem = async (item: Omit<Item, "id">) => {
  try {
    const docRef = await addDoc(itemRef, {
      category: item.category,
      name: item.name,
      created_at: Timestamp.now(),
      critical_level: item.stock,
      unit: item.unit,
    });

    return { id: docRef.id, ...item };
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

// UPDATE
export const updateItem = async (id: string, item: Partial<Item>) => {
  try {
    const docToUpdate = doc(db, "item", id);
    await updateDoc(docToUpdate, {
      ...(item.category && { category: item.category }),
      ...(item.name && { name: item.name }),
      ...(item.stock !== undefined && { critical_level: item.stock }),
      ...(item.unit && { unit: item.unit }),
    });
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

// DELETE
export const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, "item", id));
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};
