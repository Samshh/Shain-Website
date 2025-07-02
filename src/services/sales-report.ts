import { db } from "@/firebase"
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"

export interface SalesReport {
  id?: string
  branch_id: string
  branch?: string
  report_date: Timestamp
  shift: string
  total_sales: number
  transaction_count: number
  submitted_by: string
  submitted_at?: Timestamp
}

const branchRef = collection(db, "branch")
const salesReportRef = collection(db, "sales_report")

export const getAllSalesReport = async (): Promise<SalesReport[]> => {
  const snapshot = await getDocs(salesReportRef)
  return Promise.all(snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data()
    let branchName = "Unknown"
    const branchDoc = await getDoc(doc(branchRef, data.branch_id))
    if (branchDoc.exists()) branchName = branchDoc.data().name

    return {
      id: docSnap.id,
      branch_id: data.branch_id,
      report_date: data.report_date,
      shift: data.shift,
      total_sales: data.total_sales,
      transaction_count: data.transaction_count,
      submitted_by: data.submitted_by,
      submitted_at: data.submitted_at,
      branch: branchName,
    } as SalesReport
  }))
}

export const createSalesReport = async (
  data: Omit<SalesReport, "id" | "branch" | "submitted_at">
) => {
  const payload = { ...data, submitted_at: Timestamp.now() }
  const docRef = await addDoc(salesReportRef, payload)
  return { id: docRef.id, ...payload }
}

export const updateSalesReport = async (
  id: string,
  updates: Partial<Omit<SalesReport, "id" | "branch" | "submitted_at">>
) => updateDoc(doc(salesReportRef, id), updates)

export const deleteSalesReport = async (id: string) =>
  deleteDoc(doc(salesReportRef, id))
