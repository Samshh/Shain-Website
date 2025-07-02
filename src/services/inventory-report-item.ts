import { db } from "@/firebase"
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"

export interface InventoryItemReport {
  id?: string
  item_id: string
  item?: string
  quantity: number
  remarks: string
  created_at?: Timestamp
}

const itemRef = collection(db, "item")
const inventoryItemReportRef = collection(db, "inventory_report_item")

export const getAllInventoryItemReport = async (): Promise<InventoryItemReport[]> => {
  const snapshot = await getDocs(inventoryItemReportRef)
  return Promise.all(snapshot.docs.map(async (docSnap) => {
    const { item_id, quantity, remarks, created_at } = docSnap.data()
    const itemDoc = await getDoc(doc(itemRef, item_id))
    const itemName = itemDoc.exists() ? itemDoc.data().name : "Unknown"

    return {
      id: docSnap.id,
      item_id,
      item: itemName,
      quantity,
      remarks,
      created_at,
    }
  }))
}

export const createInventoryItemReport = async (
  data: Omit<InventoryItemReport, "id" | "item" | "created_at">
) => {
  const payload = { ...data, created_at: Timestamp.now() }
  const docRef = await addDoc(inventoryItemReportRef, payload)
  return { id: docRef.id, ...payload }
}

export const updateInventoryItemReport = async (
  id: string,
  updates: Partial<Omit<InventoryItemReport, "id" | "item" | "created_at">>
) => updateDoc(doc(inventoryItemReportRef, id), updates)

export const deleteInventoryItemReport = async (id: string) =>
  deleteDoc(doc(inventoryItemReportRef, id))
