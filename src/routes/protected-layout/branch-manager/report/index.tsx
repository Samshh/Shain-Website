import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  TrendingUp,
  Package,
  BarChart3,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import {
  getAllSalesReport,
  createSalesReport,
  updateSalesReport,
  deleteSalesReport,
  type SalesReport,
} from "@/services/sales-report";
import {
  getAllInventoryReport,
  createInventoryReport,
  updateInventoryReport,
  deleteInventoryReport,
  type InventoryReport,
} from "@/services/inventory-report";
import {
  getAllInventoryItemReport,
  createInventoryItemReport,
  updateInventoryItemReport,
  deleteInventoryItemReport,
  type InventoryItemReport,
} from "@/services/inventory-report-item";

import { getAllBranches, type Branch } from "@/services/branch";
import { getAllItems, type Item } from "@/services/item";

const SHIFTS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" }
];

export default function BranchManagerReport() {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>(
    []
  );
  const [inventoryItemReports, setInventoryItemReports] = useState<
    InventoryItemReport[]
  >([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data states
  const [salesFormData, setSalesFormData] = useState({
    branch_id: "",
    report_date: "",
    shift: "",
    total_sales: 0,
    transaction_count: 0,
    submitted_by: "",
  });

  const [inventoryFormData, setInventoryFormData] = useState({
    branch_id: "",
    shift: "",
    submitted_by: "",
  });

  const [inventoryItemFormData, setInventoryItemFormData] = useState({
    item_id: "",
    quantity: 0,
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        fetchedSalesReports,
        fetchedInventoryReports,
        fetchedInventoryItemReports,
        fetchedBranches,
        fetchedItems,
      ] = await Promise.all([
        getAllSalesReport(),
        getAllInventoryReport(),
        getAllInventoryItemReport(),
        getAllBranches(),
        getAllItems(),
      ]);

      setSalesReports(fetchedSalesReports);
      setInventoryReports(fetchedInventoryReports);
      setInventoryItemReports(fetchedInventoryItemReports);
      setBranches(fetchedBranches);
      setItems(fetchedItems);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Sales Report Functions
  const handleAddSalesReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !salesFormData.branch_id ||
      !salesFormData.report_date ||
      !salesFormData.shift ||
      !salesFormData.submitted_by
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createSalesReport({
        branch_id: salesFormData.branch_id,
        report_date: Timestamp.fromDate(new Date(salesFormData.report_date)),
        shift: salesFormData.shift,
        total_sales: salesFormData.total_sales,
        transaction_count: salesFormData.transaction_count,
        submitted_by: salesFormData.submitted_by,
      });

      await loadData();
      resetSalesForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSalesReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingItem ||
      !salesFormData.branch_id ||
      !salesFormData.report_date ||
      !salesFormData.shift
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateSalesReport(editingItem.id, {
        branch_id: salesFormData.branch_id,
        report_date: Timestamp.fromDate(new Date(salesFormData.report_date)),
        shift: salesFormData.shift,
        total_sales: salesFormData.total_sales,
        transaction_count: salesFormData.transaction_count,
        submitted_by: salesFormData.submitted_by,
      });

      await loadData();
      resetSalesForm();
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inventory Report Functions
  const handleAddInventoryReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inventoryFormData.branch_id ||
      !inventoryFormData.shift ||
      !inventoryFormData.submitted_by
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createInventoryReport({
        branch_id: inventoryFormData.branch_id,
        shift: inventoryFormData.shift,
        submitted_by: inventoryFormData.submitted_by,
      });

      await loadData();
      resetInventoryForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInventoryReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingItem ||
      !inventoryFormData.branch_id ||
      !inventoryFormData.shift
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateInventoryReport(editingItem.id, {
        branch_id: inventoryFormData.branch_id,
        shift: inventoryFormData.shift,
        submitted_by: inventoryFormData.submitted_by,
      });

      await loadData();
      resetInventoryForm();
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inventory Item Report Functions
  const handleAddInventoryItemReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryItemFormData.item_id || !inventoryItemFormData.remarks) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createInventoryItemReport({
        item_id: inventoryItemFormData.item_id,
        quantity: inventoryItemFormData.quantity,
        remarks: inventoryItemFormData.remarks,
      });

      await loadData();
      resetInventoryItemForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInventoryItemReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingItem ||
      !inventoryItemFormData.item_id ||
      !inventoryItemFormData.remarks
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateInventoryItemReport(editingItem.id, {
        item_id: inventoryItemFormData.item_id,
        quantity: inventoryItemFormData.quantity,
        remarks: inventoryItemFormData.remarks,
      });

      await loadData();
      resetInventoryItemForm();
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Functions
  const handleDelete = async (id: string, type: string) => {
    try {
      if (type === "sales") {
        await deleteSalesReport(id);
        setSalesReports(salesReports.filter((report) => report.id !== id));
      } else if (type === "inventory") {
        await deleteInventoryReport(id);
        setInventoryReports(
          inventoryReports.filter((report) => report.id !== id)
        );
      } else if (type === "inventory-item") {
        await deleteInventoryItemReport(id);
        setInventoryItemReports(
          inventoryItemReports.filter((report) => report.id !== id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Form Reset Functions
  const resetSalesForm = () => {
    setSalesFormData({
      branch_id: "",
      report_date: "",
      shift: "",
      total_sales: 0,
      transaction_count: 0,
      submitted_by: "",
    });
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      branch_id: "",
      shift: "",
      submitted_by: "",
    });
  };

  const resetInventoryItemForm = () => {
    setInventoryItemFormData({
      item_id: "",
      quantity: 0,
      remarks: "",
    });
  };

  // Edit Dialog Functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (item: any, type: string) => {
    setEditingItem(item);
    if (type === "sales") {
      setSalesFormData({
        branch_id: item.branch_id,
        report_date: item.report_date.toDate().toISOString().slice(0, 16),
        shift: item.shift,
        total_sales: item.total_sales,
        transaction_count: item.transaction_count,
        submitted_by: item.submitted_by,
      });
    } else if (type === "inventory") {
      setInventoryFormData({
        branch_id: item.branch_id,
        shift: item.shift,
        submitted_by: item.submitted_by,
      });
    } else if (type === "inventory-item") {
      setInventoryItemFormData({
        item_id: item.item_id,
        quantity: item.quantity,
        remarks: item.remarks,
      });
    }
    setIsEditDialogOpen(true);
  };

  // Filter Functions
  const filteredSalesReports = salesReports.filter(
    (report) =>
      report.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventoryReports = inventoryReports.filter(
    (report) =>
      report.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventoryItemReports = inventoryItemReports.filter(
    (report) =>
      report.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.remarks.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container p-6 max-w-[1536px] mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Reports Management
            </h1>
            <p className="text-muted-foreground">
              Manage sales reports, inventory reports, and inventory item
              reports.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sales Reports
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Inventory Reports
            </TabsTrigger>
            <TabsTrigger
              value="inventory-item"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Inventory Item Reports
            </TabsTrigger>
          </TabsList>

          {/* Sales Reports Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Sales Reports ({filteredSalesReports.length})
              </h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetSalesForm();
                      setEditingItem(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sales Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Sales Report</DialogTitle>
                    <DialogDescription>
                      Create a new sales report with transaction details.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSalesReport}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sales-branch">Branch *</Label>
                        <Select
                          value={salesFormData.branch_id}
                          onValueChange={(value) =>
                            setSalesFormData({
                              ...salesFormData,
                              branch_id: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sales-date">Report Date *</Label>
                        <Input
                          id="sales-date"
                          type="datetime-local"
                          value={salesFormData.report_date}
                          onChange={(e) =>
                            setSalesFormData({
                              ...salesFormData,
                              report_date: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sales-shift">Shift *</Label>
                        <Select
                          value={salesFormData.shift}
                          onValueChange={(value) =>
                            setSalesFormData({ ...salesFormData, shift: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIFTS.map((shift) => (
                              <SelectItem key={shift.value} value={shift.value}>
                                {shift.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sales-total">Total Sales</Label>
                          <Input
                            id="sales-total"
                            type="number"
                            min="0"
                            step="0.01"
                            value={salesFormData.total_sales}
                            onChange={(e) =>
                              setSalesFormData({
                                ...salesFormData,
                                total_sales:
                                  Number.parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sales-transactions">
                            Transaction Count
                          </Label>
                          <Input
                            id="sales-transactions"
                            type="number"
                            min="0"
                            value={salesFormData.transaction_count}
                            onChange={(e) =>
                              setSalesFormData({
                                ...salesFormData,
                                transaction_count:
                                  Number.parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sales-submitted-by">
                          Submitted By *
                        </Label>
                        <Input
                          id="sales-submitted-by"
                          value={salesFormData.submitted_by}
                          onChange={(e) =>
                            setSalesFormData({
                              ...salesFormData,
                              submitted_by: e.target.value,
                            })
                          }
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Report"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">
                      Loading sales reports...
                    </div>
                  </div>
                ) : filteredSalesReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">
                      No sales reports found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm
                        ? "No reports match your search criteria."
                        : "Get started by adding your first sales report."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Total Sales</TableHead>
                          <TableHead>Transactions</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalesReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Badge variant="outline">{report.branch}</Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(report.report_date)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{report.shift}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(report.total_sales)}
                            </TableCell>
                            <TableCell>{report.transaction_count}</TableCell>
                            <TableCell>{report.submitted_by}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditDialog(report, "sales")
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the sales report.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(report.id!, "sales")
                                        }
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Reports Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Inventory Reports ({filteredInventoryReports.length})
              </h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetInventoryForm();
                      setEditingItem(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inventory Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Report</DialogTitle>
                    <DialogDescription>
                      Create a new inventory report for a branch and shift.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddInventoryReport}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="inventory-branch">Branch *</Label>
                        <Select
                          value={inventoryFormData.branch_id}
                          onValueChange={(value) =>
                            setInventoryFormData({
                              ...inventoryFormData,
                              branch_id: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="inventory-shift">Shift *</Label>
                        <Select
                          value={inventoryFormData.shift}
                          onValueChange={(value) =>
                            setInventoryFormData({
                              ...inventoryFormData,
                              shift: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIFTS.map((shift) => (
                              <SelectItem key={shift.value} value={shift.value}>
                                {shift.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="inventory-submitted-by">
                          Submitted By *
                        </Label>
                        <Input
                          id="inventory-submitted-by"
                          value={inventoryFormData.submitted_by}
                          onChange={(e) =>
                            setInventoryFormData({
                              ...inventoryFormData,
                              submitted_by: e.target.value,
                            })
                          }
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Report"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">
                      Loading inventory reports...
                    </div>
                  </div>
                ) : filteredInventoryReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">
                      No inventory reports found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm
                        ? "No reports match your search criteria."
                        : "Get started by adding your first inventory report."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch</TableHead>
                          <TableHead>Report Date</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Submitted At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventoryReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Badge variant="outline">{report.branch}</Badge>
                            </TableCell>
                            <TableCell>{report.reported_at}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{report.shift}</Badge>
                            </TableCell>
                            <TableCell>{report.submitted_by}</TableCell>
                            <TableCell>
                              {formatDate(report.submitted_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditDialog(report, "inventory")
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the inventory report.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(report.id!, "inventory")
                                        }
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Item Reports Tab */}
          <TabsContent value="inventory-item" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Inventory Item Reports ({filteredInventoryItemReports.length})
              </h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetInventoryItemForm();
                      setEditingItem(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item Report</DialogTitle>
                    <DialogDescription>
                      Log inventory changes for specific items.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddInventoryItemReport}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-select">Item *</Label>
                        <Select
                          value={inventoryItemFormData.item_id}
                          onValueChange={(value) =>
                            setInventoryItemFormData({
                              ...inventoryItemFormData,
                              item_id: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - {item.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="item-quantity">Quantity</Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          value={inventoryItemFormData.quantity}
                          onChange={(e) =>
                            setInventoryItemFormData({
                              ...inventoryItemFormData,
                              quantity: Number.parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="item-remarks">Remarks *</Label>
                        <Textarea
                          id="item-remarks"
                          value={inventoryItemFormData.remarks}
                          onChange={(e) =>
                            setInventoryItemFormData({
                              ...inventoryItemFormData,
                              remarks: e.target.value,
                            })
                          }
                          placeholder="Enter remarks about the inventory change"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Report"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">
                      Loading inventory item reports...
                    </div>
                  </div>
                ) : filteredInventoryItemReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">
                      No inventory item reports found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm
                        ? "No reports match your search criteria."
                        : "Get started by adding your first item report."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventoryItemReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Badge variant="outline">{report.item}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {report.quantity}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.remarks}
                            </TableCell>
                            <TableCell>
                              {formatDate(report.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditDialog(report, "inventory-item")
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the inventory item
                                        report.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(
                                            report.id!,
                                            "inventory-item"
                                          )
                                        }
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Edit{" "}
                {activeTab === "sales"
                  ? "Sales"
                  : activeTab === "inventory"
                  ? "Inventory"
                  : "Inventory Item"}{" "}
                Report
              </DialogTitle>
              <DialogDescription>
                Make changes to the report details.
              </DialogDescription>
            </DialogHeader>

            {activeTab === "sales" && (
              <form onSubmit={handleEditSalesReport}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sales-branch">Branch *</Label>
                    <Select
                      value={salesFormData.branch_id}
                      onValueChange={(value) =>
                        setSalesFormData({ ...salesFormData, branch_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sales-date">Report Date *</Label>
                    <Input
                      id="edit-sales-date"
                      type="datetime-local"
                      value={salesFormData.report_date}
                      onChange={(e) =>
                        setSalesFormData({
                          ...salesFormData,
                          report_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sales-shift">Shift *</Label>
                    <Select
                      value={salesFormData.shift}
                      onValueChange={(value) =>
                        setSalesFormData({ ...salesFormData, shift: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFTS.map((shift) => (
                          <SelectItem key={shift.value} value={shift.value}>
                            {shift.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-sales-total">Total Sales</Label>
                      <Input
                        id="edit-sales-total"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salesFormData.total_sales}
                        onChange={(e) =>
                          setSalesFormData({
                            ...salesFormData,
                            total_sales: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-sales-transactions">
                        Transaction Count
                      </Label>
                      <Input
                        id="edit-sales-transactions"
                        type="number"
                        min="0"
                        value={salesFormData.transaction_count}
                        onChange={(e) =>
                          setSalesFormData({
                            ...salesFormData,
                            transaction_count:
                              Number.parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sales-submitted-by">
                      Submitted By *
                    </Label>
                    <Input
                      id="edit-sales-submitted-by"
                      value={salesFormData.submitted_by}
                      onChange={(e) =>
                        setSalesFormData({
                          ...salesFormData,
                          submitted_by: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {activeTab === "inventory" && (
              <form onSubmit={handleEditInventoryReport}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-inventory-branch">Branch *</Label>
                    <Select
                      value={inventoryFormData.branch_id}
                      onValueChange={(value) =>
                        setInventoryFormData({
                          ...inventoryFormData,
                          branch_id: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-inventory-shift">Shift *</Label>
                    <Select
                      value={inventoryFormData.shift}
                      onValueChange={(value) =>
                        setInventoryFormData({
                          ...inventoryFormData,
                          shift: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFTS.map((shift) => (
                          <SelectItem key={shift.value} value={shift.value}>
                            {shift.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-inventory-submitted-by">
                      Submitted By *
                    </Label>
                    <Input
                      id="edit-inventory-submitted-by"
                      value={inventoryFormData.submitted_by}
                      onChange={(e) =>
                        setInventoryFormData({
                          ...inventoryFormData,
                          submitted_by: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {activeTab === "inventory-item" && (
              <form onSubmit={handleEditInventoryItemReport}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-item-select">Item *</Label>
                    <Select
                      value={inventoryItemFormData.item_id}
                      onValueChange={(value) =>
                        setInventoryItemFormData({
                          ...inventoryItemFormData,
                          item_id: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {item.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-item-quantity">Quantity</Label>
                    <Input
                      id="edit-item-quantity"
                      type="number"
                      value={inventoryItemFormData.quantity}
                      onChange={(e) =>
                        setInventoryItemFormData({
                          ...inventoryItemFormData,
                          quantity: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-item-remarks">Remarks *</Label>
                    <Textarea
                      id="edit-item-remarks"
                      value={inventoryItemFormData.remarks}
                      onChange={(e) =>
                        setInventoryItemFormData({
                          ...inventoryItemFormData,
                          remarks: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
