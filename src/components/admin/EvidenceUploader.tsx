"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Camera,
  FileImage,
  Video,
  FileText,
  AlertCircle,
  Cloud,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import {
  cloudStorage,
  UploadResult,
  UploadProgress,
} from "@/lib/storage/cloud-storage";

export interface CloudFile {
  id: string;
  file: File;
  uploadResult?: UploadResult;
  uploadProgress?: UploadProgress;
  uploadStatus: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface EvidenceUploaderProps {
  onFilesChange: (files: CloudFile[]) => void;
  acceptedTypes: "photo" | "video" | "document" | "all";
  maxFiles?: number;
  maxSize?: number; // in MB
  files: CloudFile[];
  folder?: string;
}

export function EvidenceUploader({
  onFilesChange,
  acceptedTypes,
  maxFiles = 5,
  maxSize = 10,
  files,
  folder = "violations",
}: EvidenceUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedFileTypes = () => {
    switch (acceptedTypes) {
      case "photo":
        return "image/*";
      case "video":
        return "video/*";
      case "document":
        return ".pdf,.doc,.docx,.txt";
      default:
        return "*";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FileImage;
    if (file.type.startsWith("video/")) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const isValidType = (() => {
      switch (acceptedTypes) {
        case "photo":
          return file.type.startsWith("image/");
        case "video":
          return file.type.startsWith("video/");
        case "document":
          return (
            file.type === "application/pdf" ||
            file.type === "application/msword" ||
            file.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "text/plain"
          );
        default:
          return true;
      }
    })();

    if (!isValidType) {
      return `Invalid file type for ${acceptedTypes}`;
    }

    return null;
  };

  const uploadToCloud = async (cloudFile: CloudFile) => {
    try {
      // Update status to uploading
      updateCloudFile(cloudFile.id, { uploadStatus: "uploading" });

      // Upload to cloud storage
      const result = await cloudStorage.uploadFile(cloudFile.file, {
        folder,
        fileName: `${Date.now()}-${cloudFile.file.name}`,
        onProgress: (progress) => {
          updateCloudFile(cloudFile.id, { uploadProgress: progress });
        },
      });

      if (result.success) {
        updateCloudFile(cloudFile.id, {
          uploadStatus: "success",
          uploadResult: result,
        });
      } else {
        updateCloudFile(cloudFile.id, {
          uploadStatus: "error",
          error: result.error || "Upload failed",
        });
      }
    } catch (error) {
      updateCloudFile(cloudFile.id, {
        uploadStatus: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  const updateCloudFile = (id: string, updates: Partial<CloudFile>) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, ...updates } : file
    );
    onFilesChange(updatedFiles);
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const errors: string[] = [];

    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      setUploadErrors(errors);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      return;
    }

    // Clear previous errors
    setUploadErrors([]);

    // Create CloudFile objects
    const cloudFiles: CloudFile[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      uploadStatus: "pending",
    }));

    // Add to files list
    const updatedFiles = [...files, ...cloudFiles];
    onFilesChange(updatedFiles);

    // Start uploading each file
    cloudFiles.forEach((cloudFile) => {
      uploadToCloud(cloudFile);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = async (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);

    // If file was successfully uploaded to cloud, delete it
    if (fileToRemove?.uploadResult?.publicId) {
      try {
        await cloudStorage.deleteFile(fileToRemove.uploadResult.publicId);
      } catch (error) {
        console.error("Failed to delete file from cloud:", error);
      }
    }

    // Remove from local state
    const newFiles = files.filter((file) => file.id !== id);
    onFilesChange(newFiles);
  };

  const retryUpload = (id: string) => {
    const cloudFile = files.find((f) => f.id === id);
    if (cloudFile) {
      uploadToCloud(cloudFile);
    }
  };

  const downloadFile = (cloudFile: CloudFile) => {
    if (cloudFile.uploadResult?.url) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = cloudFile.uploadResult.url;
      link.download = cloudFile.file.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewFile = (cloudFile: CloudFile) => {
    if (cloudFile.uploadResult?.url) {
      window.open(cloudFile.uploadResult.url, "_blank");
    }
  };

  const getTypeLabel = () => {
    switch (acceptedTypes) {
      case "photo":
        return "photos";
      case "video":
        return "videos";
      case "document":
        return "documents";
      default:
        return "files";
    }
  };

  const getTypeIcon = () => {
    switch (acceptedTypes) {
      case "photo":
        return Camera;
      case "video":
        return Video;
      case "document":
        return FileText;
      default:
        return Upload;
    }
  };

  const getStatusBadge = (status: CloudFile["uploadStatus"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "uploading":
        return (
          <Badge variant="outline" className="text-blue-600">
            Uploading
          </Badge>
        );
      case "success":
        return <Badge className="bg-green-600">Uploaded</Badge>;
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="space-y-4">
      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {uploadErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedFileTypes()}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Cloud className="h-6 w-6 text-gray-400" />
            <TypeIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            Upload {getTypeLabel()} to Cloud Storage
          </p>
          <p className="text-xs text-gray-500">
            Drag and drop or click to browse
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Max {maxFiles} files, {maxSize}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Evidence Files ({files.length}/{maxFiles})
            </Label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}{" "}
                total
              </Badge>
              <Badge variant="outline" className="text-xs">
                {files.filter((f) => f.uploadStatus === "success").length}{" "}
                uploaded
              </Badge>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((cloudFile) => {
              const FileIcon = getFileIcon(cloudFile.file);
              const canPreview =
                cloudFile.uploadStatus === "success" &&
                (cloudFile.file.type.startsWith("image/") ||
                  cloudFile.file.type.startsWith("video/"));

              return (
                <Card key={cloudFile.id} className="p-3">
                  <div className="space-y-2">
                    {/* File Info Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <FileIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {cloudFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatFileSize(cloudFile.file.size)}</span>
                            {cloudFile.uploadResult?.url && (
                              <span className="text-green-600">
                                • Cloud stored
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(cloudFile.uploadStatus)}

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1">
                          {canPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => previewFile(cloudFile)}
                              title="Preview file"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}

                          {cloudFile.uploadStatus === "success" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(cloudFile)}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}

                          {cloudFile.uploadStatus === "error" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => retryUpload(cloudFile.id)}
                              title="Retry upload"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(cloudFile.id)}
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {cloudFile.uploadStatus === "uploading" &&
                      cloudFile.uploadProgress && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Uploading to cloud...</span>
                            <span>
                              {Math.round(cloudFile.uploadProgress.percentage)}%
                            </span>
                          </div>
                          <Progress
                            value={cloudFile.uploadProgress.percentage}
                            className="h-2"
                          />
                        </div>
                      )}

                    {/* Error Message */}
                    {cloudFile.uploadStatus === "error" && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{cloudFile.error || "Upload failed"}</span>
                      </div>
                    )}

                    {/* Success Info */}
                    {cloudFile.uploadStatus === "success" &&
                      cloudFile.uploadResult && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <Cloud className="w-4 h-4" />
                          <span>Stored in cloud storage</span>
                          {cloudFile.uploadResult.publicId && (
                            <code className="text-xs bg-gray-100 px-1 rounded">
                              {cloudFile.uploadResult.publicId.split("/").pop()}
                            </code>
                          )}
                        </div>
                      )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="text-center py-4">
          <Cloud className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No evidence files uploaded yet
          </p>
          <p className="text-xs text-gray-400">
            Files will be securely stored in cloud storage
          </p>
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                {files.filter((f) => f.uploadStatus === "success").length}{" "}
                uploaded
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                {files.filter((f) => f.uploadStatus === "uploading").length}{" "}
                uploading
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>
                {files.filter((f) => f.uploadStatus === "error").length} failed
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">Secure cloud storage</div>
        </div>
      )}
    </div>
  );
}
