import { db } from "@/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export interface PayrollInterface {
  id: string;
  branch: string;
  created_at: string;
  cutoff_end: string;
  cutoff_start: string;
  employee_name: string;
  rate_per_hour: number;
  status: string;
  total_hours: number;
}

const payrollRef = collection(db, "payroll");

export const getAllPayroll = async (): Promise<PayrollInterface[]> => {
  try {
    const branchRef = collection(db, "branch");
    const snapshot = await getDocs(payrollRef);
    const inventoryReportData = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const {
          branch_id,
          created_at,
          cutoff_end,
          cutoff_start,
          employee_name,
          rate_per_hour,
          status,
          total_hours,
        } = docSnap.data();

        let branchName = "Unknown";
        if (branch_id !== undefined && branch_id !== null) {
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
            : String(created_at);

        const timeInStr =
          cutoff_end instanceof Timestamp
            ? cutoff_end.toDate().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : String(cutoff_end);

        const timeOutStr =
          cutoff_start instanceof Timestamp
            ? cutoff_start.toDate().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : String(cutoff_start);

        return {
          id: docSnap.id,
          branch: branchName,
          created_at: createdAtStr,
          cutoff_end: timeInStr,
          cutoff_start: timeOutStr,
          employee_name,
          rate_per_hour,
          status,
          total_hours,
        };
      })
    );

    return inventoryReportData;
  } catch (error) {
    console.error("Error fetching payroll reports:", error);
    throw error;
  }
};

const computeTotalHours = (start: Timestamp, end: Timestamp) => {
  const ms = end.toMillis() - start.toMillis();
  const hours = ms / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
};

export const createPayroll = async ({
  branch_id,
  employee_name,
  rate_per_hour,
  status,
  cutoff_start,
  cutoff_end,
}: {
  branch_id: string;
  employee_name: string;
  rate_per_hour: number;
  status: string;
  cutoff_start: Timestamp;
  cutoff_end: Timestamp;
}) => {
  try {
    const total_hours = computeTotalHours(cutoff_start, cutoff_end);
    const payload = {
      branch_id,
      employee_name,
      rate_per_hour,
      status,
      cutoff_start,
      cutoff_end,
      total_hours,
      created_at: Timestamp.now(),
    };

    const docRef = await addDoc(payrollRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Error creating payroll:", error);
    throw error;
  }
};

export const updatePayroll = async (
  id: string,
  updates: Partial<{
    branch_id: string;
    employee_name: string;
    rate_per_hour: number;
    status: string;
    cutoff_start: Timestamp;
    cutoff_end: Timestamp;
  }>
) => {
  try {
    const docRef = doc(db, "payroll", id);
    let total_hours;
    if (updates.cutoff_start && updates.cutoff_end) {
      total_hours = computeTotalHours(updates.cutoff_start, updates.cutoff_end);
    }

    await updateDoc(docRef, {
      ...updates,
      ...(total_hours !== undefined && { total_hours }),
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    throw error;
  }
};

export const deletePayroll = async (id: string) => {
  try {
    await deleteDoc(doc(db, "payroll", id));
  } catch (error) {
    console.error("Error deleting payroll:", error);
    throw error;
  }
};
