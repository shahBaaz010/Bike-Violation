"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Paperclip, X, Clock, Upload } from "lucide-react";

interface ReplyData {
  queryId: string;
  message: string;
  template?: string;
  attachments?: File[];
  priority?: "low" | "medium" | "high";
  emailNotification?: boolean;
  markAsResolved?: boolean;
  internalNotes?: string;
}

interface AdminReplyFormProps {
  queryId: string;
  queryCategory?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replyData: ReplyData) => void;
  isLoading?: boolean;
}

// Predefined response templates for different categories
const responseTemplates = {
  violation_dispute: {
    title: "Violation Dispute Response",
    content: `Dear [User Name],

Thank you for contacting us regarding your traffic violation dispute (Case #[Case Number]).

We have carefully reviewed your submission and the evidence provided. After thorough examination of the case details, including [specific details reviewed], we have made the following determination:

[Decision and reasoning]

If you have any additional questions or concerns, please don't hesitate to contact us.

Best regards,
Traffic Violations Department`,
  },
  technical_support: {
    title: "Technical Support Response",
    content: `Dear [User Name],

Thank you for reaching out to our technical support team regarding [issue description].

We have investigated the issue you reported and have identified the following solution:

[Solution steps]
1. [Step 1]
2. [Step 2]
3. [Step 3]

If you continue to experience difficulties, please don't hesitate to contact us with additional details.

Best regards,
Technical Support Team`,
  },
  payment_issues: {
    title: "Payment Issues Response",
    content: `Dear [User Name],

Thank you for contacting us regarding your payment inquiry (Reference #[Reference Number]).

We have reviewed your account and payment records. Here's what we found:

[Payment status and details]

Next steps:
[Required actions or information]

If you need further assistance with your payment, please contact our billing department.

Best regards,
Billing Department`,
  },
  general_inquiry: {
    title: "General Inquiry Response",
    content: `Dear [User Name],

Thank you for your inquiry. We appreciate you taking the time to contact us.

Regarding your question about [topic], here is the information you requested:

[Response content]

If you need any additional information or have further questions, please feel free to reach out.

Best regards,
Customer Service Team`,
  },
};

export function AdminReplyForm({
  queryId,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AdminReplyFormProps) {
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [emailNotification, setEmailNotification] = useState(true);
  const [markAsResolved, setMarkAsResolved] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (
      templateKey &&
      responseTemplates[templateKey as keyof typeof responseTemplates]
    ) {
      setMessage(
        responseTemplates[templateKey as keyof typeof responseTemplates].content
      );
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter((file) => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      alert("Please enter a message before sending.");
      return;
    }

    const replyData: ReplyData = {
      queryId,
      message: message.trim(),
      template: selectedTemplate || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      priority,
      emailNotification,
      markAsResolved,
      internalNotes: internalNotes.trim() || undefined,
    };

    onSubmit(replyData);
  };

  const resetForm = () => {
    setMessage("");
    setSelectedTemplate("");
    setAttachments([]);
    setPriority("medium");
    setEmailNotification(true);
    setMarkAsResolved(false);
    setInternalNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
        );
      default:
        return <Badge variant="outline">Medium Priority</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send Professional Reply - Query #{queryId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Response Templates Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Response Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or start from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom Response</SelectItem>
                {Object.entries(responseTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Response Message</Label>
            <Textarea
              placeholder="Type your professional response here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {message.length} characters
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Attachments</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.mp4,.webm,.ogg"
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Priority Level</Label>
              <Select
                value={priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setPriority(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Current Priority</Label>
              <div className="pt-2">{getPriorityBadge(priority)}</div>
            </div>
          </div>

          {/* Notification Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Options</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Send email notification to user</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={markAsResolved}
                  onChange={(e) => setMarkAsResolved(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  Mark query as resolved after sending
                </span>
              </label>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Internal Notes (Admin Only)
            </Label>
            <Textarea
              placeholder="Add internal notes for other admins (not visible to user)"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Professional Reply
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
