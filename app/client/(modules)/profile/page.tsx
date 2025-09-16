"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const { userProfile, loading, updateUserProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    
    try {
      // Only send the fields that the API endpoint supports
      const updateData = {
        country_of_residence: formData.country_of_residence,
        operator_type: formData.operator_type,
        operator_type_other: formData.operator_type_other,
        gender: formData.gender,
      };

      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.result && data.result.message) {
        toast.success(data.result.message || 'Profile updated successfully!');
        
        // Update user profile in local storage with new data
        if (userProfile) {
          const updatedProfile = {
            ...userProfile,
            ...data.result.updated_fields
          };
          updateUserProfile(updatedProfile);
        }
        
        setIsEditing(false);
      } else if (data.error) {
        toast.error(data.error.message || 'Failed to update profile');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
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
    setIsEditing(false);
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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600">Manage your account information</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={submitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Basic Information */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="text-sm"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {userProfile?.name || "Not provided"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        className="text-sm"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {userProfile?.phone || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      type="email"
                      className="text-sm"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {userProfile?.email || "Not provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-4 h-4" />
                  Professional Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Your role and business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {userProfile?.role?.replace('_', ' ') || "Not specified"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account Status</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <Badge 
                        variant={userProfile?.state === "active" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {userProfile?.state || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  Additional Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Additional profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Country of Residence</Label>
                    {isEditing ? (
                      <Select
                        value={formData.country_of_residence}
                        onValueChange={(value) => handleInputChange("country_of_residence", value)}
                      >
                        <SelectTrigger className="text-sm">
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
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {userProfile?.country_of_residence || "Not provided"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Operator Type</Label>
                    {isEditing ? (
                      <Select
                        value={formData.operator_type}
                        onValueChange={(value) => handleInputChange("operator_type", value)}
                      >
                        <SelectTrigger className="text-sm">
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
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {userProfile?.operator_type ? 
                          OPERATOR_TYPES.find(t => t.value === userProfile.operator_type)?.label || userProfile.operator_type
                          : "Not provided"
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {isEditing && formData.operator_type === "others" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specify Operator Type</Label>
                    <Input
                      value={formData.operator_type_other}
                      onChange={(e) => handleInputChange("operator_type_other", e.target.value)}
                      placeholder="e.g., Exporter, Agent, etc."
                      className="text-sm"
                    />
                  </div>
                )}

                {!isEditing && userProfile?.operator_type_other && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specified Operator Type</Label>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {userProfile.operator_type_other}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gender</Label>
                  {isEditing ? (
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger className="text-sm">
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
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {userProfile?.gender ? 
                        userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)
                        : "Not provided"
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Account details and timestamps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User ID</Label>
                    <div className="p-3 bg-gray-50 rounded-md font-mono text-xs">
                      {userProfile?.id || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account Status</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <Badge 
                        variant={userProfile?.state === "active" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {userProfile?.state || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 