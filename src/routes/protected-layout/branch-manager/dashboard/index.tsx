import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/data-table";
import { getAllItems, type Item } from "@/services/item";
import {
  getAllInventoryReport,
  type InventoryReport,
} from "@/services/inventory-report";
import {
  getAllInventoryItemReport,
  type InventoryItemReport,
} from "@/services/inventory-report-item";
import { useNavigate } from "react-router-dom";
import { getAllSalesReport, type SalesReport } from "@/services/sales-report";
import { getAllPayroll, type PayrollInterface } from "@/services/payroll";
import { Home } from "lucide-react";
import { getUsername } from "@/services/user";

export default function BranchManagerDashboard() {
  const navigate = useNavigate();
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [inventoryReportData, setInventoryReportData] = useState<
    InventoryReport[]
  >([]);
  const [inventoryItemReportData, setInventoryItemReportData] = useState<
    InventoryItemReport[]
  >([]);
  const [salesReportData, setSalesReportData] = useState<SalesReport[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollInterface[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getAllItems()
      .then((data) => setItemsData(data))
      .catch((error) => console.error("Failed to fetch items:", error));
    getAllInventoryReport()
      .then((data) => setInventoryReportData(data))
      .catch((error) =>
        console.error("Failed to fetch inventory reports:", error)
      );
    getAllInventoryItemReport()
      .then((data) => setInventoryItemReportData(data))
      .catch((error) =>
        console.error("Failed to fetch inventory item reports:", error)
      );
    getAllSalesReport()
      .then((data) => setSalesReportData(data))
      .catch((error) => console.error("Failed to fetch sales reports:", error));
    getAllPayroll()
      .then((data) => setPayrollData(data))
      .catch((error) => console.error("Failed to fetch payroll data:", error));
    getUsername()
      .then((data) => setUsername(data))
      .catch((error) => console.error("Failed to fetch username:", error));
  }, []);

  return (
    <div className="container mx-auto flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Home className="h-8 w-8" />
          Welcome, {username || "Admin"}!
        </h1>
        <p className="text-muted-foreground">
          Dashboard for managing your admin tasks.
        </p>
      </div>
      <div className="grid gap-6">
        <DataTable
          title="Items"
          data={itemsData}
          columns={["Category", "Name", "Stock", "Unit"]}
          onRedirect={() => navigate("/admin/items")}
        />

        <DataTable
          title="Sales Report"
          data={salesReportData}
          columns={[
            "Branch",
            "Reported at",
            "Shift",
            "Total sales",
            "Transaction count",
            "Submitted by",
          ]}
          onRedirect={() => navigate("/admin/reports")}
        />

        <DataTable
          title="Inventory Report"
          data={inventoryReportData}
          columns={["Branch", "Reported at", "Shift", "Submitted by"]}
          onRedirect={() => navigate("/admin/reports")}
        />

        <DataTable
          title="Inventory Item Report"
          data={inventoryItemReportData}
          columns={["Item", "Quantity", "Remarks"]}
          onRedirect={() => navigate("/admin/reports")}
        />

        <DataTable
          title="Payroll"
          data={payrollData}
          columns={[
            "Branch",
            "Created at",
            "Cutoff end",
            "Cutoff start",
            "Employee Name",
            "Rate Per Hour",
            "Status",
            "Total Hours",
          ]}
          onRedirect={() => navigate("/admin/payroll")}
        />
      </div>
    </div>
  );
}
