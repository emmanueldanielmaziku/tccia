"use client";
import NavBar from "../../components/NavBar";
import ProgressTracker from "./components/StatsBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ClipboardCheck,
  AlertCircle,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  User,
  Phone,
  Plus,
  Calendar,
  DollarSign,
  Package,
  Upload,
  Trash2,
  Eye,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUserProfile } from "../../../hooks/useUserProfile";

// Dynamic NTB types will be fetched from API
// const NTB_TYPES = [
//   "Administrative issues",
//   "Import ban", 
//   "Rule of origin Issues",
//   "Import Licensing",
//   "Length/Costly customs procedures",
//   "Poor testing/Inspection Facilities",
//   "Administrative fee & levies",
//   "Lack of clarity on border Procedures",
//   "Others",
// ];

// STATUS_OPTIONS removed - status field not needed in form
// const STATUS_OPTIONS = [
//   "Pending",
//   "Under Review", 
//   "In Progress",
//   "Resolved",
//   "Closed",
// ];

const COST_RANGES = [
  "0 - 100",
  "101 - 250",
  "251 - 500",
  "501 - 1000",
  "1001 - 2500",
  "2501 - 5000",
  "5000+",
];

const OCCURRENCE_OPTIONS = [
  "First time",
  "Once before",
  "A few times",
  "Every month",
  "Every week",
  "Every day",
];

const TIME_LOST_OPTIONS = [
  "1-2 hours",
  "3-6 hours",
  "6-12 hours",
  "12-24 hours",
  "1-3 days",
  "3-7 days",
  "1-2 weeks",
  "2+ weeks",
];

const MONEY_LOST_RANGES = [
  "$0 - $100",
  "$101 - $250",
  "$251 - $500",
  "$501 - $1000",
  "$1001 - $2500",
  "$2501 - $5000",
  "$5000+",
];

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

export default function NTB() {
  const t = useTranslations("ntb");
  const { userProfile, loading: profileLoading, updateUserProfile } = useUserProfile();
  const [mode, setMode] = useState<"profile" | "list" | "new" | "detail">("profile");
  const [ntbList, setNtbList] = useState<any[]>([]);
  const [ntbTypes, setNtbTypes] = useState<{id: number, name: string, description: string}[]>([]);
  const [selectedNtb, setSelectedNtb] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    documents: File[];
    images: File[];
  }>({
    documents: [],
    images: [],
  });
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'loading'>('prompt');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [profileForm, setProfileForm] = useState({
    country_of_residence: "",
    operator_type: "",
    operator_type_other: "",
    gender: "",
  });
  const [form, setForm] = useState({
    ntb_type_id: "",
    date_of_incident: "",
    country_of_incident: "",
    location: "",
    complaint_details: "",
    product_description: "",
    cost_value_range: "",
    occurrence: "",
    time_lost_range: "",
    money_lost_range: "",
    exact_loss_value: "",
    loss_calculation_description: "",
    // New optional location fields
    latitude: "",
    longitude: "",
    location_type: "",
    location_accuracy: "",
    location_address: "",
    google_place_id: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setForm(prev => ({ ...prev, complaint_details: editor.getText() }));
    },
  });

  // Check if profile is complete and set mode accordingly
  useEffect(() => {
    if (!profileLoading && userProfile) {
      const isProfileComplete = 
        userProfile.country_of_residence && 
        userProfile.operator_type && 
        userProfile.gender;

      if (isProfileComplete) {
        setMode("list");
        fetchNTBList();
      } else {
        setMode("profile");
        // Pre-fill form with existing data
        setProfileForm({
          country_of_residence: userProfile.country_of_residence || "",
          operator_type: userProfile.operator_type || "",
          operator_type_other: userProfile.operator_type_other || "",
          gender: userProfile.gender || "",
        });
      }
    }
  }, [userProfile, profileLoading]);


  useEffect(() => {
    fetchNTBTypes();
  }, []);

  // Auto-detect location when form mode is 'new'
  useEffect(() => {
    if (mode === 'new' && locationPermission === 'prompt') {
      requestLocationPermission();
    }
  }, [mode]);

  // Auto-detect location on component mount for new forms
  useEffect(() => {
    if (mode === 'new' && !form.location) {
      detectCurrentLocation();
    }
  }, [mode]);

  const fetchNTBTypes = async () => {
    try {
      const response = await fetch('/api/ntb/types');
      const data = await response.json();
      if (data.success) {
        setNtbTypes(data.data || []);
      } else {
        console.error('Error fetching NTB types:', data.error);
        
        setNtbTypes([
          { id: 1, name: "Administrative issues", description: "Issues related to administrative procedures and bureaucracy" },
          { id: 2, name: "Import ban", description: "Restrictions or prohibitions on importing certain goods" },
          { id: 3, name: "Rule of origin Issues", description: "Problems related to determining the origin of goods" },
          { id: 4, name: "Import Licensing", description: "Issues with import licensing requirements and procedures" },
          { id: 5, name: "Length/Costly customs procedures", description: "Delays and excessive costs in customs clearance" },
          { id: 6, name: "Poor testing/Inspection Facilities", description: "Inadequate testing and inspection infrastructure" },
          { id: 7, name: "Administrative fee & levies", description: "Excessive or unclear administrative fees and charges" },
          { id: 8, name: "Lack of clarity on border Procedures", description: "Unclear or inconsistent border crossing procedures" },
          { id: 9, name: "Others", description: "Other types of non-tariff barriers not listed above" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching NTB types:', error);
      // Use fallback types if API fails
      setNtbTypes([
        { id: 1, name: "Administrative issues", description: "Issues related to administrative procedures and bureaucracy" },
        { id: 2, name: "Import ban", description: "Restrictions or prohibitions on importing certain goods" },
        { id: 3, name: "Rule of origin Issues", description: "Problems related to determining the origin of goods" },
        { id: 4, name: "Import Licensing", description: "Issues with import licensing requirements and procedures" },
        { id: 5, name: "Length/Costly customs procedures", description: "Delays and excessive costs in customs clearance" },
        { id: 6, name: "Poor testing/Inspection Facilities", description: "Inadequate testing and inspection infrastructure" },
        { id: 7, name: "Administrative fee & levies", description: "Excessive or unclear administrative fees and charges" },
        { id: 8, name: "Lack of clarity on border Procedures", description: "Unclear or inconsistent border crossing procedures" },
        { id: 9, name: "Others", description: "Other types of non-tariff barriers not listed above" },
      ]);
    }
  };

  const fetchNTBList = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ntb/list');
      const data = await response.json();
      if (data.success) {
        setNtbList(data.data || []);
      } else {
        console.error('Error fetching NTB list:', data.error);
        toast.error(data.error || 'Failed to fetch NTB list');
      }
    } catch (error) {
      console.error('Error fetching NTB list:', error);
      toast.error('Failed to fetch NTB list');
    } finally {
      setLoading(false);
    }
  };

  const fetchNTBDetails = async (ntbId: number) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/ntb/${ntbId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedNtb(data.data);
        setMode('detail');
      } else {
        console.error('Error fetching NTB details:', data.error);
        toast.error(data.error || 'Failed to fetch NTB details');
      }
    } catch (error) {
      console.error('Error fetching NTB details:', error);
      toast.error('Failed to fetch NTB details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'documents' | 'images') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Check file sizes (10MB limit per file)
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('File size must be less than 10MB per file');
        return;
      }
      
      setSelectedFiles(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], ...files]
      }));
    }
  };

  const removeFile = (fileType: 'documents' | 'images', index: number) => {
    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }));
  };

  // Geolocation functions
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsDetectingLocation(true);
    setLocationPermission('loading');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Update form with detected coordinates
      setForm(prev => ({
        ...prev,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        location_accuracy: 'high',
        location_type: 'border' // Default to border, user can change if needed
      }));

      // Try to get reverse geocoding for address and Google Place ID
      try {
        // First try Google Places API for more accurate results
        const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (googleApiKey) {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
          );
          
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            if (googleData.results && googleData.results.length > 0) {
              const result = googleData.results[0];
              setForm(prev => ({
                ...prev,
                location_address: result.formatted_address,
                location: result.formatted_address.split(',')[0], // Use first part as main location
                google_place_id: result.place_id
              }));
            }
          } else {
            console.log('Google Places API failed, falling back to BigDataCloud');
            // Fall through to BigDataCloud
          }
        } else {
          console.log('Google Maps API key not configured, using BigDataCloud');
        }
        
          // Fallback to BigDataCloud if Google API fails or no key
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          if (data.locality) {
            setForm(prev => ({
              ...prev,
              location_address: `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`,
              location: `${data.locality}, ${data.principalSubdivision}` // Update main location too
            }));
          }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed:', geocodeError);
        // Still use the coordinates even if reverse geocoding fails
      }

      setLocationPermission('granted');
      toast.success('Location detected successfully!');
      
    } catch (error: any) {
      console.error('Geolocation error:', error);
      setLocationPermission('denied');
      
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions.');
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please check your connection.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to detect location. Please enter manually.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          detectCurrentLocation();
        } else if (result.state === 'prompt') {
          detectCurrentLocation();
        }
      });
    } else {
      detectCurrentLocation();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields are not null or empty
    if (!profileForm.country_of_residence || profileForm.country_of_residence.trim() === "") {
      toast.error('Please select a country of residence');
      return;
    }
    
    if (!profileForm.operator_type || profileForm.operator_type.trim() === "") {
      toast.error('Please select an operator type');
      return;
    }
    
    if (!profileForm.gender || profileForm.gender.trim() === "") {
      toast.error('Please select a gender');
      return;
    }
    
    // If operator type is "others", validate the other field
    if (profileForm.operator_type === "others" && (!profileForm.operator_type_other || profileForm.operator_type_other.trim() === "")) {
      toast.error('Please specify the operator type');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      // Handle JSON-RPC response format
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
        
        // Switch to NTB list/form mode
        setMode("list");
        fetchNTBList();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare the payload according to the expected format
      const payload: any = {
        ntb_type_id: parseInt(form.ntb_type_id),
        date_of_incident: form.date_of_incident,
        country_of_incident: form.country_of_incident,
        location: form.location,
        complaint_details: form.complaint_details,
        product_description: form.product_description,
        occurrence: form.occurrence,
      };

      // Add optional fields if they have values
      if (form.cost_value_range) payload.cost_value_range = form.cost_value_range;
      if (form.time_lost_range) payload.time_lost_range = form.time_lost_range;
      if (form.money_lost_range) payload.money_lost_range = form.money_lost_range;
      if (form.exact_loss_value) payload.exact_loss_value = parseFloat(form.exact_loss_value);
      if (form.loss_calculation_description) payload.loss_calculation_description = form.loss_calculation_description;
      
      // Add optional location fields
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.location_type) payload.location_type = form.location_type;
      if (form.location_accuracy) payload.location_accuracy = form.location_accuracy;
      if (form.location_address) payload.location_address = form.location_address;
      if (form.google_place_id) payload.google_place_id = form.google_place_id;

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(payload).forEach(key => {
        formData.append(key, payload[key]);
      });

      // Add files by type
      selectedFiles.documents.forEach(file => {
        formData.append('document_files', file);
      });
      selectedFiles.images.forEach(file => {
        formData.append('image_files', file);
      });

      const response = await fetch('/api/ntb/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('NTB submitted successfully!');
        setMode('list');
        fetchNTBList();
        resetForm();
      } else {
        toast.error(data.message || 'Failed to submit NTB');
      }
    } catch (error) {
      console.error('Error submitting NTB:', error);
      toast.error('Failed to submit NTB');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      ntb_type_id: "",
      date_of_incident: "",
      country_of_incident: "",
      location: "",
      complaint_details: "",
      product_description: "",
      cost_value_range: "",
      occurrence: "",
      time_lost_range: "",
      money_lost_range: "",
      exact_loss_value: "",
      loss_calculation_description: "",
      // New optional location fields
      latitude: "",
      longitude: "",
      location_type: "",
      location_accuracy: "",
      location_address: "",
      google_place_id: "",
    });
    setSelectedFiles({
      documents: [],
      images: [],
    });
    setLocationPermission('prompt');
    editor?.commands.setContent('');
  };

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'resolved':
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under_review':
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const formatStatus = (state: string) => {
    // Map "done" to "resolved" for display
    if (state.toLowerCase() === 'done') {
      return 'Resolved';
    }
    // Capitalize first letter of each word
    return state.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 ml-2 shadow-sm relative">
        <NavBar title={t("title")} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 ml-2 shadow-sm relative">
      <NavBar title={t("title")} />
      <section className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-col items-start flex-1 w-full overflow-y-auto max-h-[calc(97vh-80px)]">
          <div className="w-full max-w-4xl mx-auto mt-24 mb-8 px-6 pb-8">
            
            {/* Profile Completion Form */}
            {mode === "profile" && (
              <div className="space-y-6">
                <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          Complete Your Profile
                        </CardTitle>
                        <CardDescription className="text-[14px]">
                          Please complete your profile information to access NTB features
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      
                      {/* Form Inputs Row */}
                      <div className="flex flex-row gap-4 justify-between">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Country of Residence *
                          </Label>
                          <Select
                            value={profileForm.country_of_residence}
                            onValueChange={(value) => handleProfileChange("country_of_residence", value)}
                            required
                          >
                            <SelectTrigger className="h-10 w-[240px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                          <Label className="text-sm font-medium text-gray-700">
                            Operator Type *
                          </Label>
                          <Select
                            value={profileForm.operator_type}
                            onValueChange={(value) => handleProfileChange("operator_type", value)}
                            
                            required
                          >
                            <SelectTrigger className="h-10 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-[240px]">
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

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Gender *
                          </Label>
                          <Select
                            value={profileForm.gender}
                            onValueChange={(value) => handleProfileChange("gender", value)}
                            required
                          >
                            <SelectTrigger className="h-10 rounded-[9px] border-gray-200 w-[240px] focus:border-blue-500 focus:ring-blue-500">
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
                      </div>

                      {/* Conditional "Other" Input */}
                      {profileForm.operator_type === "others" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Specify Type (e.g., Exporter) *
                          </Label>
                          <Input
                            placeholder="e.g., Exporter, Agent, etc."
                            value={profileForm.operator_type_other}
                            onChange={(e) => handleProfileChange("operator_type_other", e.target.value)}
                            className="h-10 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 max-w-lg"
                            required
                          />
                        </div>
                      )}

                      {/* Submit Button Row */}
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-[9px] h-10 text-sm min-w-[160px] cursor-pointer"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Complete Profile"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Header with New NTB Button */}
            {mode !== "profile" && mode !== "detail" && (
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Non-Tariff Barriers (NTB)
                  </h1>
                  <p className="text-gray-600">
                    Track and report non-tariff barriers affecting your trade
                    {ntbList.length > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({ntbList.length} report{ntbList.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={fetchNTBList}
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-md flex items-center gap-2 cursor-pointer"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setMode('new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New NTB Report
                  </Button>
                </div>
              </div>
            )}

            {/* NTB List */}
            {mode === "list" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="space-y-4">
                    {/* Skeleton Cards for NTB List */}
                    {[...Array(3)].map((_, index) => (
                      <Card key={index} className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-24" />
                              </div>
                              <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <div>
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <div>
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-18" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div>
                              <Skeleton className="h-3 w-24 mb-1" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : ntbList.length === 0 ? (
                  <Card className="text-center py-12 shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No NTB Reports Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You haven't submitted any NTB reports yet.
                    </p>
                    <Button
                      onClick={() => setMode('new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white mx-auto cursor-pointer"
                    >
                      Submit Your First NTB Report
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ntbList.map((ntb) => (
                      <Card key={ntb.id} className="hover:shadow-md transition-shadow border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {ntb.ntb_type}
                                </h3>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {ntb.report_reference}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Reported on {new Date(ntb.submission_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(ntb.state)}>
                              {formatStatus(ntb.state)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Incident Date:</span>
                              <p className="font-medium">{ntb.date_of_incident}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Country:</span>
                              <p className="font-medium">{ntb.country_of_incident}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="font-medium">{ntb.location}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost Range:</span>
                              <p className="font-medium">{ntb.cost_value_range}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Occurrence:</span>
                              <p className="font-medium">{ntb.occurrence}</p>
                            </div>
                            {ntb.latest_feedback && (
                              <div>
                                <span className="text-gray-500">Latest Feedback:</span>
                                <p className="font-medium">{ntb.latest_feedback}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => fetchNTBDetails(ntb.id)}
                              disabled={detailLoading}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NTB Detail View */}
            {mode === "detail" && selectedNtb && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setMode('list')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to List
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedNtb.report_reference}</h2>
                    <p className="text-gray-600">NTB Report Details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Basic Information</CardTitle>
                          <Badge className={getStatusColor(selectedNtb.state)}>
                            {formatStatus(selectedNtb.state)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">NTB Type</Label>
                            <p className="font-medium">{selectedNtb.ntb_type?.name || selectedNtb.ntb_type}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Date of Incident</Label>
                            <p className="font-medium">{selectedNtb.date_of_incident}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Country</Label>
                            <p className="font-medium">{selectedNtb.country_of_incident}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Location</Label>
                            <p className="font-medium">{selectedNtb.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                      <CardHeader>
                        <CardTitle className="text-lg">Product Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Product Description</Label>
                          <p className="font-medium">{selectedNtb.product_description}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Impact Details */}
                    <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                      <CardHeader>
                        <CardTitle className="text-lg">Impact Assessment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Cost Value Range</Label>
                            <p className="font-medium">{selectedNtb.cost_value_range}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Exact Loss Value</Label>
                            <p className="font-medium">${selectedNtb.exact_loss_value}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Time Lost Range</Label>
                            <p className="font-medium">{selectedNtb.time_lost_range}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Money Lost Range</Label>
                            <p className="font-medium">{selectedNtb.money_lost_range}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Occurrence</Label>
                            <p className="font-medium">{selectedNtb.occurrence}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Loss Calculation Description</Label>
                          <p className="font-medium">{selectedNtb.loss_calculation_description}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complaint Details */}
                    <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                      <CardHeader>
                        <CardTitle className="text-lg">Complaint Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                          {selectedNtb.complaint_details}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Timeline */}
                    <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                      <CardHeader>
                        <CardTitle className="text-lg">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Submitted</Label>
                          <p className="font-medium">{new Date(selectedNtb.submission_date).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                          <p className="font-medium">{new Date(selectedNtb.last_updated).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reporter Information */}
                    {selectedNtb.reporter_info && (
                      <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                        <CardHeader>
                          <CardTitle className="text-lg">Reporter Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Name</Label>
                            <p className="font-medium">{selectedNtb.reporter_info.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Email</Label>
                            <p className="font-medium">{selectedNtb.reporter_info.email}</p>
                          </div>
                          {selectedNtb.reporter_info.phone && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Phone</Label>
                              <p className="font-medium">{selectedNtb.reporter_info.phone}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Country</Label>
                            <p className="font-medium">{selectedNtb.reporter_info.country}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Operator Type</Label>
                            <p className="font-medium capitalize">{selectedNtb.reporter_info.operator_type?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Gender</Label>
                            <p className="font-medium capitalize">{selectedNtb.reporter_info.gender}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Feedback */}
                    {selectedNtb.latest_feedback && (
                      <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                        <CardHeader>
                          <CardTitle className="text-lg">Latest Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{selectedNtb.latest_feedback}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* New NTB Form */}
            {mode === "new" && (
              <div className="space-y-6">
                <Card className="border-[0.5px] shadow-[0_0_0px_rgba(0,0,0,0.1)]">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          New NTB Report
                        </CardTitle>
                        <CardDescription className="text-[14px]">
                          Report a non-tariff barrier affecting your trade
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            NTB Type *
                          </Label>
                          <Select
                            value={form.ntb_type_id}
                            onValueChange={(value) => handleChange("ntb_type_id", value)}
                            required
                          >
                            <SelectTrigger className="h-12 w-[280px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select NTB type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ntbTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()} title={type.description}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Date of Incident *
                          </Label>
                          <Input
                            type="date"
                            value={form.date_of_incident}
                            onChange={(e) => handleChange("date_of_incident", e.target.value)}
                            className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Country of Incident *
                          </Label>
                          <Select
                            value={form.country_of_incident}
                            onValueChange={(value) => handleChange("country_of_incident", value)}
                            required
                          >
                            <SelectTrigger className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Location of Incident
                          </Label>
                          <Select
                            value={form.location_type}
                            onValueChange={(value) => handleChange("location_type", value)}
                          >
                            <SelectTrigger className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="point">Exact Location</SelectItem>
                              <SelectItem value="area">General Area</SelectItem>
                              <SelectItem value="border">Border/Crossing Point</SelectItem>
                              <SelectItem value="port">Port/Airport</SelectItem>
                              <SelectItem value="warehouse">Warehouse/Storage</SelectItem>
                              <SelectItem value="office">Government Office</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
      {/* Complaint Details - Start with Description */}
      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Complaint Details & Description *
                        </Label>
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                          <div className="flex gap-1 border-b border-gray-100 px-4 py-3 bg-gray-50">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                editor?.chain().focus().toggleBold().run()
                              }
                              className={`h-8 w-8 p-0 rounded-[9px] ${
                                editor?.isActive("bold")
                                  ? "bg-blue-100 text-blue-700"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                editor?.chain().focus().toggleItalic().run()
                              }
                              className={`h-8 w-8 p-0 rounded-lg ${
                                editor?.isActive("italic")
                                  ? "bg-blue-100 text-blue-700"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .toggleBulletList()
                                  .run()
                              }
                              className={`h-8 w-8 p-0 rounded-lg ${
                                editor?.isActive("bulletList")
                                  ? "bg-blue-100 text-blue-700"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <List className="w-4 h-4" />
                            </Button>
                          </div>
                          <EditorContent
                            editor={editor}
                            className="min-h-[140px] px-4 py-3 focus:outline-none prose prose-sm max-w-none"
                          />
                        </div>
                      </div>
                      {/* Location field hidden from user but still captured in background */}
                      <div className="hidden">
                        <Input
                          value={form.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          required
                        />
                      </div>

                      {/* Location Details - Auto-captured (Hidden from user but data still captured) */}
                      <div className="hidden space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-md font-medium text-gray-800 mb-1">Location Details</h4>
                            <p className="text-sm text-gray-600">
                              {locationPermission === 'granted' 
                                ? 'Location automatically detected from your device'
                                : 'Location will be automatically detected to help with investigation'
                              }
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {locationPermission === 'granted' && (
                              <div className="flex items-center gap-1 text-green-600 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Auto-detected</span>
                              </div>
                            )}
                            {locationPermission !== 'granted' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={requestLocationPermission}
                                disabled={isDetectingLocation}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                {isDetectingLocation ? (
                                  <>
                                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                                    Detecting...
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Detect Location
                                  </>
                                )}
                              </Button>
                            )}
                            {/* {locationPermission === 'granted' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setLocationPermission('prompt');
                                  setForm(prev => ({
                                    ...prev,
                                    latitude: '',
                                    longitude: '',
                                    location_accuracy: '',
                                    location_address: '',
                                    google_place_id: ''
                                  }));
                                }}
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Reset Location
                              </Button>
                            )} */}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Latitude
                              {locationPermission === 'granted' && (
                                <span className="text-xs text-green-600 ml-1">(Auto-detected)</span>
                              )}
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="e.g., -2.5467"
                              value={form.latitude}
                              onChange={(e) => handleChange("latitude", e.target.value)}
                              readOnly={locationPermission === 'granted'}
                              className={`h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                                locationPermission === 'granted' 
                                  ? 'bg-gray-50 text-gray-700 cursor-not-allowed' 
                                  : ''
                              }`}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Longitude
                              {locationPermission === 'granted' && (
                                <span className="text-xs text-green-600 ml-1">(Auto-detected)</span>
                              )}
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="e.g., 36.7833"
                              value={form.longitude}
                              onChange={(e) => handleChange("longitude", e.target.value)}
                              readOnly={locationPermission === 'granted'}
                              className={`h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                                locationPermission === 'granted' 
                                  ? 'bg-gray-50 text-gray-700 cursor-not-allowed' 
                                  : ''
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Location Accuracy
                            {locationPermission === 'granted' && (
                              <span className="text-xs text-green-600 ml-1">(Auto-detected)</span>
                            )}
                          </Label>
                          <Select
                            value={form.location_accuracy}
                            onValueChange={(value) => handleChange("location_accuracy", value)}
                            disabled={locationPermission === 'granted'}
                          >
                            <SelectTrigger className={`h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                              locationPermission === 'granted' 
                                ? 'bg-gray-50 text-gray-700 cursor-not-allowed' 
                                : ''
                            }`}>
                              <SelectValue placeholder="Select accuracy level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High (Exact coordinates)</SelectItem>
                              <SelectItem value="medium">Medium (General area)</SelectItem>
                              <SelectItem value="low">Low (City/Region only)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Full Address
                            {locationPermission === 'granted' && (
                              <span className="text-xs text-green-600 ml-1">(Auto-detected)</span>
                            )}
                          </Label>
                          <Input
                            placeholder="Enter complete address"
                            value={form.location_address}
                            onChange={(e) => handleChange("location_address", e.target.value)}
                            readOnly={locationPermission === 'granted'}
                            className={`h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                              locationPermission === 'granted' 
                                ? 'bg-gray-50 text-gray-700 cursor-not-allowed' 
                                : ''
                            }`}
                          />
                        </div>

                        <div className="space-y-3 hidden">
                          <Label className="text-sm font-medium text-gray-700">
                            Google Place ID
                            {locationPermission === 'granted' && form.google_place_id && (
                              <span className="text-xs text-green-600 ml-1">(Auto-detected)</span>
                            )}
                          </Label>
                          <Input
                            placeholder="Enter Google Place ID (optional)"
                            value={form.google_place_id}
                            onChange={(e) => handleChange("google_place_id", e.target.value)}
                            readOnly={locationPermission === 'granted' && !!form.google_place_id}
                            className={`h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                              locationPermission === 'granted' && form.google_place_id
                                ? 'bg-gray-50 text-gray-700 cursor-not-allowed' 
                                : ''
                            }`}
                          />
                          {form.google_place_id && (
                            <p className="text-xs text-gray-500">
                              Place ID: {form.google_place_id}
                            </p>
                          )}
                          {!form.google_place_id && locationPermission === 'granted' && (
                            <p className="text-xs text-amber-600">
                              Google Place ID not available. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for enhanced location data.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Product Information */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Product Description *
                        </Label>
                        <Input
                          placeholder="Describe the product affected"
                          value={form.product_description}
                          onChange={(e) => handleChange("product_description", e.target.value)}
                          className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>


                      {/* Occurrence - Required Field */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Occurrence *
                        </Label>
                        <Select
                          value={form.occurrence}
                          onValueChange={(value) => handleChange("occurrence", value)}
                          required
                        >
                          <SelectTrigger className="h-12 w-[280px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select occurrence" />
                          </SelectTrigger>
                          <SelectContent>
                            {OCCURRENCE_OPTIONS.map((occurrence) => (
                              <SelectItem key={occurrence} value={occurrence}>
                                {occurrence}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Optional Fields Accordion */}
                      <Accordion type="single" collapsible className="w-full border-1 px-4 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <AccordionItem value="optional-fields">
                          <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
                            <div className="text-left">
                              <div>Optional Fields</div>
                              <div className="text-sm font-normal text-gray-500 mt-1">
                                Tap to add additional optional informations
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-6 pt-4">
                            {/* Cost/Value of Goods - Optional */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">
                                Cost/Value of Goods in USD (Optional)
                              </Label>
                              <Select
                                value={form.cost_value_range}
                                onValueChange={(value) => handleChange("cost_value_range", value)}
                              >
                                <SelectTrigger className="h-12 w-[280px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select cost range (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COST_RANGES.map((range) => (
                                    <SelectItem key={range} value={range}>
                                      {range}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Time Lost - Optional */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">
                                Time Lost (Optional)
                              </Label>
                              <Select
                                value={form.time_lost_range}
                                onValueChange={(value) => handleChange("time_lost_range", value)}
                              >
                                <SelectTrigger className="h-12 w-[280px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select time lost (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_LOST_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Financial Impact - Optional */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-md font-medium text-gray-800 mb-2">Financial Impact (Optional)</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  Provide financial impact details if available
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-gray-700">
                                    Money Lost Range
                                  </Label>
                                  <Select
                                    value={form.money_lost_range}
                                    onValueChange={(value) => handleChange("money_lost_range", value)}
                                  >
                                    <SelectTrigger className="h-12 w-[280px] rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                      <SelectValue placeholder="Select money lost range (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MONEY_LOST_RANGES.map((range) => (
                                        <SelectItem key={range} value={range}>
                                          {range}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-gray-700">
                                    Exact Value of Loss ($)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter exact amount (optional)"
                                    value={form.exact_loss_value}
                                    onChange={(e) => handleChange("exact_loss_value", e.target.value)}
                                    className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                  Description of How Loss Was Calculated
                                </Label>
                                <Input
                                  placeholder="Explain how you calculated the loss (optional)"
                                  value={form.loss_calculation_description}
                                  onChange={(e) => handleChange("loss_calculation_description", e.target.value)}
                                  className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* File Uploads */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">File Attachments</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Upload supporting documents and images to strengthen your NTB report
                          </p>
                        </div>

                        {/* File Upload Widgets in Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Document Files */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Document Files (PDF, DOC, DOCX)
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'documents')}
                                className="hidden"
                                id="document-upload"
                                accept=".pdf,.doc,.docx"
                                multiple
                              />
                              <label
                                htmlFor="document-upload"
                                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Upload Documents
                              </label>
                              <p className="text-xs text-gray-500 mt-2">
                                PDF, DOC, DOCX • Max 10MB per file
                              </p>
                            </div>
                            {selectedFiles.documents.length > 0 && (
                              <div className="space-y-2">
                                {selectedFiles.documents.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile('documents', index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Image Files */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Image Files (JPG, PNG, GIF)
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'images')}
                                className="hidden"
                                id="image-upload"
                                accept=".jpg,.jpeg,.png,.gif"
                                multiple
                              />
                              <label
                                htmlFor="image-upload"
                                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Upload Images
                              </label>
                              <p className="text-xs text-gray-500 mt-2">
                                JPG, PNG, GIF • Max 10MB per file
                              </p>
                            </div>
                            {selectedFiles.images.length > 0 && (
                              <div className="space-y-2">
                                {selectedFiles.images.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile('images', index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      <Separator className="my-8" />

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-[9px] cursor-pointer h-12"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            "Submit NTB Report"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-[9px] cursor-pointer h-12"
                          onClick={() => setMode("list")}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        <ProgressTracker />
      </section>
    </main>
  );
}
