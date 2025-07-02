import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  Users,
  CircleDollarSign,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import {
  getAllPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  type PayrollInterface,
} from "@/services/payroll";
import { getAllBranches, type Branch } from "@/services/branch";

const PAYROLL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState<PayrollInterface[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollInterface | null>(
    null
  );
  const [formData, setFormData] = useState({
    branch_id: "",
    employee_name: "",
    rate_per_hour: 0,
    status: "pending",
    cutoff_start: "",
    cutoff_end: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load payrolls and branches on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedPayrolls, fetchedBranches] = await Promise.all([
        getAllPayroll(),
        getAllBranches(),
      ]);
      setPayrolls(fetchedPayrolls);
      setBranches(fetchedBranches);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.employee_name.trim() ||
      !formData.branch_id ||
      !formData.cutoff_start ||
      !formData.cutoff_end
    ) {
      return;
    }

    if (new Date(formData.cutoff_start) >= new Date(formData.cutoff_end)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createPayroll({
        branch_id: formData.branch_id,
        employee_name: formData.employee_name.trim(),
        rate_per_hour: formData.rate_per_hour,
        status: formData.status,
        cutoff_start: Timestamp.fromDate(new Date(formData.cutoff_start)),
        cutoff_end: Timestamp.fromDate(new Date(formData.cutoff_end)),
      });

      // Reload data to get the formatted version
      await loadData();

      setFormData({
        branch_id: "",
        employee_name: "",
        rate_per_hour: 0,
        status: "pending",
        cutoff_start: "",
        cutoff_end: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingPayroll ||
      !formData.employee_name.trim() ||
      !formData.branch_id ||
      !formData.cutoff_start ||
      !formData.cutoff_end
    ) {
      return;
    }

    if (new Date(formData.cutoff_start) >= new Date(formData.cutoff_end)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePayroll(editingPayroll.id, {
        branch_id: formData.branch_id,
        employee_name: formData.employee_name.trim(),
        rate_per_hour: formData.rate_per_hour,
        status: formData.status,
        cutoff_start: Timestamp.fromDate(new Date(formData.cutoff_start)),
        cutoff_end: Timestamp.fromDate(new Date(formData.cutoff_end)),
      });

      // Reload data to get the updated formatted version
      await loadData();

      setEditingPayroll(null);
      setFormData({
        branch_id: "",
        employee_name: "",
        rate_per_hour: 0,
        status: "pending",
        cutoff_start: "",
        cutoff_end: "",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      await deletePayroll(id);
      setPayrolls(payrolls.filter((payroll) => payroll.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const openEditDialog = (payroll: PayrollInterface) => {
    setEditingPayroll(payroll);

    // Convert display dates back to datetime-local format
    const startDate = new Date(`${payroll.created_at} ${payroll.cutoff_start}`);
    const endDate = new Date(`${payroll.created_at} ${payroll.cutoff_end}`);

    setFormData({
      branch_id: branches.find((b) => b.name === payroll.branch)?.id || "",
      employee_name: payroll.employee_name,
      rate_per_hour: payroll.rate_per_hour,
      status: payroll.status,
      cutoff_start: isNaN(startDate.getTime())
        ? ""
        : startDate.toISOString().slice(0, 16),
      cutoff_end: isNaN(endDate.getTime())
        ? ""
        : endDate.toISOString().slice(0, 16),
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      branch_id: "",
      employee_name: "",
      rate_per_hour: 0,
      status: "pending",
      cutoff_start: "",
      cutoff_end: "",
    });
    setEditingPayroll(null);
  };

  const filteredPayrolls = payrolls.filter(
    (payroll) =>
      payroll.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "approved":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateTotalPay = (hours: number, rate: number) => {
    return hours * rate;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CircleDollarSign className="h-8 w-8" />
              Payroll Management
            </h1>
            <p className="text-muted-foreground">
              Manage employee payroll records, hours, and payments.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Payroll Record</DialogTitle>
                <DialogDescription>
                  Create a new payroll record for an employee. Fill in all the
                  details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayroll}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="add-employee">Employee Name *</Label>
                    <Input
                      id="add-employee"
                      value={formData.employee_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employee_name: e.target.value,
                        })
                      }
                      placeholder="Enter employee name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-branch">Branch *</Label>
                    <Select
                      value={formData.branch_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, branch_id: value })
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
                    <Label htmlFor="add-rate">Rate per Hour *</Label>
                    <Input
                      id="add-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rate_per_hour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate_per_hour: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter hourly rate"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYROLL_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-start">Cutoff Start *</Label>
                      <Input
                        id="add-start"
                        type="datetime-local"
                        value={formData.cutoff_start}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cutoff_start: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-end">Cutoff End *</Label>
                      <Input
                        id="add-end"
                        type="datetime-local"
                        value={formData.cutoff_end}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cutoff_end: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
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
                    {isSubmitting ? "Adding..." : "Add Payroll"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payroll records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records ({filteredPayrolls.length})</CardTitle>
            <CardDescription>
              A list of all payroll records with employee hours and payment
              details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Loading payroll records...
                </div>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">
                  No payroll records found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No records match your search criteria."
                    : "Get started by adding your first payroll record."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Record
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">
                          {payroll.employee_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payroll.branch}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>{payroll.cutoff_start}</span>
                            <span className="text-muted-foreground">
                              to {payroll.cutoff_end}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {payroll.total_hours}h
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payroll.rate_per_hour)}/hr
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(
                            calculateTotalPay(
                              payroll.total_hours,
                              payroll.rate_per_hour
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(payroll.status)}
                          >
                            {payroll.status.charAt(0).toUpperCase() +
                              payroll.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(payroll)}
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
                                    permanently delete the payroll record for "
                                    {payroll.employee_name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeletePayroll(payroll.id)
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Payroll Record</DialogTitle>
              <DialogDescription>
                Make changes to the payroll record. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditPayroll}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-employee">Employee Name *</Label>
                  <Input
                    id="edit-employee"
                    value={formData.employee_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_name: e.target.value,
                      })
                    }
                    placeholder="Enter employee name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-branch">Branch *</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, branch_id: value })
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
                  <Label htmlFor="edit-rate">Rate per Hour *</Label>
                  <Input
                    id="edit-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate_per_hour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate_per_hour: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter hourly rate"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYROLL_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-start">Cutoff Start *</Label>
                    <Input
                      id="edit-start"
                      type="datetime-local"
                      value={formData.cutoff_start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cutoff_start: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-end">Cutoff End *</Label>
                    <Input
                      id="edit-end"
                      type="datetime-local"
                      value={formData.cutoff_end}
                      onChange={(e) =>
                        setFormData({ ...formData, cutoff_end: e.target.value })
                      }
                      required
                    />
                  </div>
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
