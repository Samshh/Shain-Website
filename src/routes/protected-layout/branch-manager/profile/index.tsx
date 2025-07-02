"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Lock,
  Shield,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import { updateUserCredentials, getCurrentUserProfile } from "@/services/user";
import { auth } from "@/firebase";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: string;
  branch_id: string;
  branch_name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  created_at: any;
  firebase_uid: string;
}

export default function BranchManagerProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [originalData, setOriginalData] = useState({
    username: "",
    email: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);

      const profileData = {
        username: userProfile.username,
        email: userProfile.email || "",
      };

      setFormData({
        ...profileData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOriginalData(profileData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Validation
    if (!formData.currentPassword) {
      return;
    }

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      return;
    }

    // Check if any changes were made
    const hasUsernameChange = formData.username !== originalData.username;
    const hasEmailChange = formData.email !== originalData.email;
    const hasPasswordChange = formData.newPassword.length > 0;

    if (!hasUsernameChange && !hasEmailChange && !hasPasswordChange) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);

      await updateUserCredentials({
        currentEmail: originalData.email,
        currentPassword: formData.currentPassword,
        newEmail: hasEmailChange ? formData.email : undefined,
        newPassword: hasPasswordChange ? formData.newPassword : undefined,
        newUsername: hasUsernameChange ? formData.username : undefined,
      });

      // Reload profile data
      await loadProfile();

      setIsEditing(false);
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      username: originalData.username,
      email: originalData.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      default:
        return <User className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Profile not found</h3>
          <p className="text-muted-foreground">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-8 w-8" />
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and personal information.
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">{profile.username}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge
                    variant={getRoleBadgeVariant(profile.role)}
                    className="flex items-center gap-1"
                  >
                    {getRoleIcon(profile.role)}
                    {profile.role === "admin" ? "Admin" : "Branch Manager"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Branch</span>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {profile.branch_name}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(profile.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update your account details. You'll need to enter your current password to save changes."
                    : "View your account details and personal information."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Basic Information
                    </h3>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your username"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <Separator />

                      {/* Security Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Security
                        </h3>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="current-password">
                              Current Password *
                            </Label>
                            <div className="relative">
                              <Input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    currentPassword: e.target.value,
                                  })
                                }
                                placeholder="Enter your current password"
                                className="pr-10"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Required to verify your identity before making
                              changes
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="new-password">
                              New Password (Optional)
                            </Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    newPassword: e.target.value,
                                  })
                                }
                                placeholder="Enter new password (leave blank to keep current)"
                                className="pr-10"
                                minLength={6}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {formData.newPassword && (
                            <div className="grid gap-2">
                              <Label htmlFor="confirm-password">
                                Confirm New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  value={formData.confirmPassword}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  placeholder="Confirm your new password"
                                  className="pr-10"
                                  minLength={6}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              {formData.newPassword !==
                                formData.confirmPassword &&
                                formData.confirmPassword && (
                                  <p className="text-xs text-destructive">
                                    Passwords do not match
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Read-only information about your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Firebase UID</Label>
                <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                  {profile.firebase_uid}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Status</Label>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
