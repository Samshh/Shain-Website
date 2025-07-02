import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/data-table";
import {
  getAllInventoryReport,
  type InventoryReport,
} from "@/services/inventory-report";
import {
  getAllInventoryItemReport,
  type InventoryItemReport,
} from "@/services/inventory-report-item";
import { getAllSalesReport, type SalesReport } from "@/services/sales-report";
import { BarChart3 } from "lucide-react";

export default function AdminReport() {
  const [inventoryReportData, setInventoryReportData] = useState<
    InventoryReport[]
  >([]);
  const [inventoryItemReportData, setInventoryItemReportData] = useState<
    InventoryItemReport[]
  >([]);
  const [salesReportData, setSalesReportData] = useState<SalesReport[]>([]);

  useEffect(() => {
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
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Reports View
        </h1>
        <p className="text-muted-foreground">
          Reports sent by your branch managers.
        </p>
      </div>
      <div className="grid gap-6">
        <DataTable
          title="Sales"
          data={salesReportData}
          columns={[
            "Branch",
            "Reported at",
            "Shift",
            "Total sales",
            "Transaction count",
            "Submitted by",
          ]}
        />

        <DataTable
          title="Inventory"
          data={inventoryReportData}
          columns={["Branch", "Reported at", "Shift", "Submitted by"]}
        />

        <DataTable
          title="Inventory Item"
          data={inventoryItemReportData}
          columns={["Item", "Quantity", "Remarks"]}
        />
      </div>
    </div>
  );
}
