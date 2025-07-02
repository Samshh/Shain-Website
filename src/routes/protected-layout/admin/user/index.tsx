;

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
  Pencil,
  Trash2,
  Search,
  Users,
  Shield,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  type User,
} from "@/services/user";
import { getAllBranches, type Branch } from "@/services/branch";

const USER_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "branch_manager", label: "Branch Manager" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    branch_id: "0",
    role: "branch_manager" as "admin" | "branch_manager",
    username: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users and branches on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedBranches] = await Promise.all([
        getAllUsers(),
        getAllBranches(),
      ]);
      setUsers(fetchedUsers);
      setBranches(fetchedBranches);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formData.username.trim()) {
      return;
    }

    // Validate branch selection for branch managers
    if (formData.role === "branch_manager" && formData.branch_id === "0") {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser(editingUser.id, {
        branch_id: formData.branch_id,
        role: formData.role,
        username: formData.username.trim(),
      });

      // Reload data to get the updated formatted version
      await loadData();

      setEditingUser(null);
      setFormData({
        branch_id: "0",
        role: "branch_manager",
        username: "",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      branch_id: user.branch_id,
      role: user.role,
      username: user.username,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firebase_uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.branch_name &&
        user.branch_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "branch_manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "branch_manager":
        return <UserCheck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const pendingUsers = users.filter(
    (user) => user.branch_id === "0" && user.role === "branch_manager"
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and branch assignments for registered users.
            </p>
          </div>
        </div>

        {/* Pending Users Alert */}
        {pendingUsers.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">
                  {pendingUsers.length} user{pendingUsers.length > 1 ? "s" : ""}{" "}
                  pending role assignment
                </span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                These users have registered but need branch assignment and role
                confirmation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage roles and branch assignments for users who have registered
              on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No users match your search criteria."
                    : "No users have registered yet."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Firebase UID</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getRoleIcon(user.role)}
                            {user.role === "admin" ? "Admin" : "Branch Manager"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.branch_name &&
                          user.branch_name !== "No Branch" ? (
                            <Badge variant="outline">{user.branch_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No Branch
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.firebase_uid}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.created_at}
                        </TableCell>
                        <TableCell>
                          {user.branch_id === "0" &&
                          user.role === "branch_manager" ? (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-200"
                            >
                              Pending Setup
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
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
                                    permanently delete the user account for "
                                    {user.username}" and revoke their system
                                    access.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                  >
                                    Delete User
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user role and branch assignment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Firebase UID (Read-only)</Label>
                  <Input
                    value={editingUser?.firebase_uid || ""}
                    disabled
                    className="bg-muted font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Firebase UID cannot be changed after registration
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "branch_manager") =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.value)}
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-branch">Branch Assignment</Label>
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
                      <SelectItem value="0">No Branch (Admin Only)</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.role === "branch_manager" &&
                    formData.branch_id === "0" && (
                      <p className="text-sm text-destructive">
                        Branch managers must be assigned to a branch.
                      </p>
                    )}
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
