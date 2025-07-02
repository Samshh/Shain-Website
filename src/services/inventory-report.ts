import { db } from "@/firebase"
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"

export interface InventoryReport {
  id?: string
  branch_id: string
  branch?: string
  report_date?: Timestamp
  reported_at?: string
  shift: string
  submitted_at?: Timestamp
  submitted_by: string
}

const branchRef = collection(db, "branch")
const inventoryReportRef = collection(db, "inventory_report")

export const getAllInventoryReport = async (): Promise<InventoryReport[]> => {
  const snapshot = await getDocs(inventoryReportRef)
  return Promise.all(snapshot.docs.map(async (docSnap) => {
    const { branch_id, report_date, shift, submitted_at, submitted_by } = docSnap.data()
    const branchDoc = await getDoc(doc(branchRef, branch_id))
    const branchName = branchDoc.exists() ? branchDoc.data().name : "Unknown"
    const reportedAt = report_date?.toDate().toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    })

    return {
      id: docSnap.id,
      branch_id,
      branch: branchName,
      report_date,
      reported_at: reportedAt,
      shift,
      submitted_at,
      submitted_by,
    }
  }))
}

export const createInventoryReport = async (
  data: Omit<InventoryReport, "id" | "branch" | "reported_at" | "submitted_at" | "report_date">
) => {
  const payload = {
    ...data,
    report_date: Timestamp.now(),
    submitted_at: Timestamp.now(),
  }
  const docRef = await addDoc(inventoryReportRef, payload)
  return { id: docRef.id, ...payload }
}

export const updateInventoryReport = async (
  id: string,
  updates: Partial<Omit<InventoryReport, "id" | "branch" | "reported_at">>
) => updateDoc(doc(inventoryReportRef, id), updates)

export const deleteInventoryReport = async (id: string) =>
  deleteDoc(doc(inventoryReportRef, id))
