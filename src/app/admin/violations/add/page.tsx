"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Camera,
  Video,
  Upload,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";
import { validateAdminSession } from "@/lib/admin-utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  numberPlate: string;
  address: string;
  isActive: boolean;
}

interface ViolationForm {
  numberPlate: string;
  violationType: string;
  description: string;
  location: string;
  dateTime: string;
  fine: number;
  proofType: "photo" | "video";
  proofFile: File | null;
  userId: string;
}

interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export default function AddViolationPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState<ViolationForm>({
    numberPlate: "",
    violationType: "",
    description: "",
    location: "",
    dateTime: new Date().toISOString().slice(0, 16),
    fine: 0,
    proofType: "photo",
    proofFile: null,
    userId: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminAuth = await validateAdminSession();
        if (adminAuth) {
          setAdmin(adminAuth.admin);
        } else {
          window.location.href = "/admin/login";
        }
      } catch (error) {
        console.error("Error validating admin auth:", error);
        window.location.href = "/admin/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/admin/login";
  };

  const searchByNumberPlate = async () => {
    if (!form.numberPlate.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/admin/users/search?numberPlate=${encodeURIComponent(form.numberPlate)}`);
      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data);
      } else {
        console.error("Search failed:", result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setForm(prev => ({
      ...prev,
      userId: user.id,
    }));
    setSearchResults([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        proofFile: file,
      }));
      setUploadedFile(null); // Reset uploaded file when new file is selected
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", form.proofType);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFile(result.data);
        setUploadProgress(100);
        return result.data.url;
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !form.proofFile) return;

    setIsSubmitting(true);
    try {
      // First upload the file
      const proofUrl = await uploadFile(form.proofFile);

      // Then create the violation case
      const violationData = {
        userId: selectedUser.id,
        violationType: form.violationType,
        description: form.description,
        location: form.location,
        dateTime: form.dateTime,
        fine: form.fine,
        proofUrl: proofUrl,
        officerId: admin?.id,
      };

      const response = await fetch("/api/admin/violations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(violationData),
      });

      const result = await response.json();

      if (result.success) {
        // Success - redirect to violations list
        router.push("/admin/violations");
      } else {
        throw new Error(result.error || "Failed to create violation");
      }
    } catch (error) {
      console.error("Error submitting violation:", error);
      alert("Failed to create violation case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getViolationTypeOptions = () => [
  { value: "no_helmet", label: "No Helmet", fine: 5000 },
    { value: "traffic_light", label: "Red Light Violation", fine: 75 },
    { value: "parking", label: "Illegal Parking", fine: 100 },
    { value: "speeding", label: "Speeding", fine: 150 },
    { value: "wrong_lane", label: "Wrong Lane", fine: 80 },
    { value: "mobile_use", label: "Mobile Use While Riding", fine: 60 },
    { value: "other", label: "Other", fine: 50 },
  ];

  const handleViolationTypeChange = (type: string) => {
    const option = getViolationTypeOptions().find(opt => opt.value === type);
    setForm(prev => ({
      ...prev,
      violationType: type,
      fine: option?.fine || 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/violations")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Violations
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Add New Violation Case</h1>
              <p className="text-muted-foreground mt-1">
                Create a new violation case and notify the user automatically.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Number Plate Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Step 1: Identify Violator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="numberPlate">Number Plate</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="numberPlate"
                      placeholder="Enter number plate (e.g., ABC-123)"
                      value={form.numberPlate}
                      onChange={(e) => setForm(prev => ({ ...prev, numberPlate: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={searchByNumberPlate}
                      disabled={!form.numberPlate.trim() || isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Found Users:</Label>
                  <div className="grid gap-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => selectUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email} • {user.phone}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.address}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{user.numberPlate}</Badge>
                            {!user.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className="p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      User Identified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{selectedUser.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedUser.phone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{selectedUser.numberPlate}</Badge>
                        {!selectedUser.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedUser.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Violation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Step 2: Violation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="violationType">Violation Type</Label>
                  <Select
                    value={form.violationType}
                    onValueChange={handleViolationTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select violation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getViolationTypeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} (${option.fine})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fine">Fine Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fine"
                      type="number"
                      value={form.fine}
                      onChange={(e) => setForm(prev => ({ ...prev, fine: Number(e.target.value) }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Violation location"
                      value={form.location}
                      onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateTime">Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={form.dateTime}
                      onChange={(e) => setForm(prev => ({ ...prev, dateTime: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the violation..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Proof Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Step 3: Upload Proof</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Proof Type</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="proofType"
                        value="photo"
                        checked={form.proofType === "photo"}
                        onChange={(e) => setForm(prev => ({ ...prev, proofType: e.target.value as "photo" | "video" }))}
                      />
                      <Camera className="w-4 h-4" />
                      <span>Photo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="proofType"
                        value="video"
                        checked={form.proofType === "video"}
                        onChange={(e) => setForm(prev => ({ ...prev, proofType: e.target.value as "photo" | "video" }))}
                      />
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="proofFile">Upload File</Label>
                  <Input
                    id="proofFile"
                    type="file"
                    accept={form.proofType === "photo" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="mt-2"
                    disabled={isUploading}
                  />
                  {form.proofFile && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected: {form.proofFile.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading file...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Uploaded File Info */}
              {uploadedFile && (
                <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      File uploaded successfully
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>File: {uploadedFile.originalName}</div>
                    <div>Size: {(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                    <div>Type: {uploadedFile.fileType}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/violations")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedUser || !form.proofFile || isSubmitting || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Case...
                </>
              ) : (
                "Create Violation Case"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
