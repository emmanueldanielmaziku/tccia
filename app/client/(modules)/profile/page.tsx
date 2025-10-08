"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Edit3,
  Save,
  X,
  Calendar,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useApiWithSessionHandling } from "@/app/hooks/useApiWithSessionHandling";

const COUNTRIES = [
  "Tanzania",
  "Kenya",
  "Uganda",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "DR Congo",
  "Zambia",
  "Malawi",
  "Mozambique",
  "Zimbabwe",
  "Botswana",
  "Namibia",
  "South Africa",
  "Other",
];

const OPERATOR_TYPES = [
  { value: "informal_trader", label: "Informal Trader" },
  { value: "small_scale_trader", label: "Small Scale Trader" },
  { value: "commercial_trader", label: "Commercial Trader" },
  { value: "transporter", label: "Transporter" },
  { value: "clearing_agent", label: "Clearing Agent" },
  { value: "freight_forwarder", label: "Freight Forwarder" },
  { value: "others", label: "Others" },
];

const GENDER_OPTIONS = [
  "male",
  "female",
];

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { userProfile, loading, updateUserProfile } = useUserProfile();
  const { fetchWithSessionHandling } = useApiWithSessionHandling();
  
  // Modal states
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country_of_residence: "",
    operator_type: "",
    operator_type_other: "",
    gender: "",
  });

  // Change password state
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });


  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        email: userProfile.email || "",
        country_of_residence: userProfile.country_of_residence || "",
        operator_type: userProfile.operator_type || "",
        operator_type_other: userProfile.operator_type_other || "",
        gender: userProfile.gender || "",
      });
    }
  }, [userProfile]);

  const handleLogoutAndRedirect = useCallback(async () => {
    try {
      // Clear all localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call logout API to clear server-side cookies
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Force redirect to auth page regardless of API call success
      window.location.replace("/auth");
    }
  }, []);

  // Countdown timer for password change success redirect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (passwordChangeSuccess && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (passwordChangeSuccess && redirectCountdown === 0) {
      handleLogoutAndRedirect();
    }
    return () => clearInterval(interval);
  }, [passwordChangeSuccess, redirectCountdown, handleLogoutAndRedirect]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordChangeError) {
      setPasswordChangeError(null);
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };


  const handleSavePersonalInfo = async () => {
    setSubmitting(true);
    
    try {
      const updateData = {
        country_of_residence: formData.country_of_residence,
        operator_type: formData.operator_type,
        operator_type_other: formData.operator_type_other,
        gender: formData.gender,
      };

      const response = await fetchWithSessionHandling('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }
        
        if (userProfile) {
          const updatedProfile = {
            ...userProfile,
          ...updateData,
          };
          updateUserProfile(updatedProfile);
        }
        
      toast.success('Personal information updated successfully!');
      setIsPersonalInfoModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    // Clear previous error
    setPasswordChangeError(null);
    
    // Validation
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordChangeError("All password fields are required");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordChangeError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordChangeError("New password must be at least 8 characters long");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetchWithSessionHandling("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      // Check for errors in the jsonrpc response format
      if (!response.ok || result.result?.error) {
        const errorMessage = result.result?.error || "Failed to change password";
        throw new Error(errorMessage);
      }

      // Check for success in the jsonrpc response format
      if (result.result?.success || result.result?.message) {
        const message = result.result?.message || "Password changed successfully";
        
        // Reset form but keep modal open to show success
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
        setShowPasswords({
          old: false,
          new: false,
          confirm: false,
        });

        // If token was invalidated, show success state with countdown
        if (message.toLowerCase().includes("token invalidated") || message.toLowerCase().includes("re-authenticate")) {
          setPasswordChangeSuccess(true);
          setRedirectCountdown(5);
        } else {
          // For regular password changes without token invalidation
          toast.success(message);
          setIsPasswordModalOpen(false);
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      
      // Handle specific error messages and set error state
      if (errorMessage.toLowerCase().includes("old password is incorrect")) {
        setPasswordChangeError("Current password is incorrect. Please try again.");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordChangeError(errorMessage);
      } else {
        setPasswordChangeError("Failed to change password. Please try again.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordChangeSuccess(false);
    setPasswordChangeError(null);
    setRedirectCountdown(5);
    setPasswordData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setShowPasswords({
      old: false,
      new: false,
      confirm: false,
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <div className="p-8 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Profile</h1>
        </div>

          {/* Profile Overview Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Profile Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
                </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {userProfile?.name || "User Name"}
                </h2>
                <p className="text-gray-600 mb-1">
                  {userProfile?.role?.replace('_', ' ') || "User"} • {userProfile?.user_type || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  {userProfile?.country_of_residence || "Location not specified"} • Member since {userProfile?.registration_date ? new Date(userProfile.registration_date).getFullYear() : "N/A"}
                </p>
                  </div>
                    </div>
                  </div>

          {/* Personal Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <Dialog open={isPersonalInfoModalOpen} onOpenChange={setIsPersonalInfoModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600">
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile Information</DialogTitle>
                    <DialogDescription>
                      Update your profile details below. Name, email, and phone cannot be changed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="country">Country of Residence</Label>
                      <Select
                        value={formData.country_of_residence}
                        onValueChange={(value) => handleInputChange("country_of_residence", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="operatorType">Operator Type</Label>
                      <Select
                        value={formData.operator_type}
                        onValueChange={(value) => handleInputChange("operator_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator type" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATOR_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.operator_type === "others" && (
                      <div className="space-y-2">
                        <Label htmlFor="operatorTypeOther">Specify Operator Type</Label>
                        <Input
                          id="operatorTypeOther"
                          value={formData.operator_type_other}
                          onChange={(e) => handleInputChange("operator_type_other", e.target.value)}
                          placeholder="e.g., Exporter, Agent, etc."
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPersonalInfoModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSavePersonalInfo}
                      disabled={submitting}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
                </div>
                
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">First Name</Label>
                <p className="text-gray-900">{userProfile?.name?.split(' ')[0] || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                <p className="text-gray-900">{userProfile?.name?.split(' ').slice(1).join(' ') || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                <p className="text-gray-900">Not provided</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                <p className="text-gray-900">{userProfile?.email || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-gray-900">{userProfile?.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">User Role</Label>
                <p className="text-gray-900">{userProfile?.role?.replace('_', ' ') || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Login</Label>
                <p className="text-gray-900">{userProfile?.login || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">User Type</Label>
                <p className="text-gray-900">{userProfile?.user_type || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                <p className="text-gray-900">
                  {userProfile?.registration_date 
                    ? new Date(userProfile.registration_date).toLocaleDateString() 
                    : "Not available"
                  }
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Branch Access</Label>
                <p className="text-gray-900">
                  {userProfile?.has_branch_access ? `Yes (${userProfile?.branch_count || 0} branches)` : "No"}
                </p>
                  </div>
                    </div>
                  </div>

          {/* Business Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Operator Type</Label>
                <p className="text-gray-900">
                  {userProfile?.operator_type ? 
                    OPERATOR_TYPES.find(type => type.value === userProfile.operator_type)?.label || userProfile.operator_type
                        : "Not provided"
                      }
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Specified Type</Label>
                <p className="text-gray-900">{userProfile?.operator_type_other || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Country</Label>
                <p className="text-gray-900">{userProfile?.country_of_residence || "Not provided"}</p>
              </div>
            </div>
                    </div>

          {/* Branches Section */}
          {userProfile?.has_branch_access && userProfile?.branches && userProfile.branches.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Branch Access ({userProfile.branch_count})
                </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.branches.map((branch) => (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{branch.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {branch.code}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{branch.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {userProfile?.groups && userProfile.groups.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Groups & Permissions</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {userProfile.groups.map((group, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {group}
                      </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                    </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">Change your password to keep your account secure</p>
                </div>
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    {passwordChangeSuccess ? (
                      // Success state with countdown - Minimal & Modern
                      <>
                        <div className="flex flex-col items-center py-8 px-6 space-y-6">
                          {/* Success Icon */}
                          <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>

                          {/* Title */}
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900">Password Changed</h3>
                            <p className="text-sm text-gray-500">
                              Please log in with your new password
                            </p>
                          </div>

                          {/* Countdown */}
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>Redirecting in</span>
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                              <span className="text-base font-semibold text-blue-600">{redirectCountdown}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button 
                            onClick={handleLogoutAndRedirect} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                          >
                            Login Now
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Regular password change form
                      <>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {/* Error Message Display */}
                        {passwordChangeError && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg w-full">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-red-700 text-sm font-medium">{passwordChangeError}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showPasswords.old ? "text" : "password"}
                                value={passwordData.old_password}
                                onChange={(e) => handlePasswordInputChange("old_password", e.target.value)}
                                placeholder="Enter current password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={() => togglePasswordVisibility('old')}
                              >
                                {showPasswords.old ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.new_password}
                                onChange={(e) => handlePasswordInputChange("new_password", e.target.value)}
                                placeholder="Enter new password (min. 8 characters)"
                                className={`pr-10 ${
                                  passwordData.new_password && passwordData.new_password.length < 8 
                                    ? "border-red-300 focus:border-red-500" 
                                    : passwordData.new_password && passwordData.new_password.length >= 8
                                    ? "border-green-300 focus:border-green-500"
                                    : ""
                                }`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={() => togglePasswordVisibility('new')}
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {passwordData.new_password && passwordData.new_password.length < 8 && (
                              <p className="text-xs text-red-600">Password must be at least 8 characters long</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirm_password}
                                onChange={(e) => handlePasswordInputChange("confirm_password", e.target.value)}
                                placeholder="Confirm new password"
                                className={`pr-10 ${
                                  passwordData.confirm_password && passwordData.new_password && 
                                  passwordData.confirm_password !== passwordData.new_password
                                    ? "border-red-300 focus:border-red-500" 
                                    : passwordData.confirm_password && passwordData.new_password && 
                                      passwordData.confirm_password === passwordData.new_password
                                    ? "border-green-300 focus:border-green-500"
                                    : ""
                                }`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={() => togglePasswordVisibility('confirm')}
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {passwordData.confirm_password && passwordData.new_password && 
                             passwordData.confirm_password !== passwordData.new_password && (
                              <p className="text-xs text-red-600">Passwords do not match</p>
                            )}
                            {passwordData.confirm_password && passwordData.new_password && 
                             passwordData.confirm_password === passwordData.new_password && 
                             passwordData.new_password.length >= 8 && (
                              <p className="text-xs text-green-600">Passwords match</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={handleClosePasswordModal}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {changingPassword ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Changing...
                              </>
                            ) : (
                              "Change Password"
                            )}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
} 