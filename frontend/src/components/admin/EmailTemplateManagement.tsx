import { useState } from "react";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  EmailTemplate,
  EmailTemplateCreate,
} from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function EmailTemplateManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;
  const toast = useToast();

  const { data: templates, isLoading } = useEmailTemplates(currentPage * limit, limit);
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const deleteMutation = useDeleteEmailTemplate();

  const handleCreate = async (data: EmailTemplateCreate) => {
    const toastId = toast.loading("Creating email template...");
    try {
      await createMutation.mutateAsync(data);
      toast.dismiss(toastId);
      toast.success("Email template created successfully!");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to create template";
      toast.error(errorMsg);
      console.error("Failed to create template:", error);
    }
  };

  const handleUpdate = async (templateId: string, data: Partial<EmailTemplate>) => {
    const toastId = toast.loading("Updating email template...");
    try {
      await updateMutation.mutateAsync({
        templateId,
        data: {
          subject: data.subject,
          body_html: data.body_html,
          body_text: data.body_text,
          description: data.description,
          is_active: data.is_active,
        },
      });
      toast.dismiss(toastId);
      toast.success("Email template updated successfully!");
      setEditingTemplate(null);
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to update template";
      toast.error(errorMsg);
      console.error("Failed to update template:", error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const toastId = toast.loading("Deleting email template...");
    try {
      await deleteMutation.mutateAsync(templateId);
      toast.dismiss(toastId);
      toast.success("Email template deleted successfully!");
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to delete template";
      toast.error(errorMsg);
      console.error("Failed to delete template:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Email Templates</h2>
          <p className="text-slate-600 mt-1">Manage email templates for automated and manual emails</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Created</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates && templates.length > 0 ? (
                templates.map((template) => (
                  <tr key={template.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{template.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{template.subject}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          template.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(template.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No templates found. Create your first template to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <TemplateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreate}
        title="Create Email Template"
      />

      {/* Edit Dialog */}
      {editingTemplate && (
        <TemplateDialog
          open={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={(data) => handleUpdate(editingTemplate.id, { ...editingTemplate, ...data })}
          template={editingTemplate}
          title="Edit Email Template"
        />
      )}

      {/* View Dialog */}
      {viewingTemplate && (
        <ViewTemplateDialog
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
        />
      )}
    </div>
  );
}

function TemplateDialog({
  open,
  onClose,
  onSave,
  template,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: EmailTemplateCreate) => void;
  template?: EmailTemplate;
  title: string;
}) {
  const [formData, setFormData] = useState<EmailTemplateCreate>({
    name: template?.name || "",
    subject: template?.subject || "",
    body_html: template?.body_html || "",
    body_text: template?.body_text || "",
    description: template?.description || "",
    is_active: template?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {template ? "Update the email template details" : "Create a new email template with Jinja2 support"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., payment_success"
              required
              disabled={!!template}
            />
            <p className="text-xs text-slate-500">Unique identifier for this template</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject (supports Jinja2: {{ variable }})"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Template description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_html">HTML Body *</Label>
            <Textarea
              id="body_html"
              value={formData.body_html}
              onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
              placeholder="HTML email body (supports Jinja2 templates)"
              required
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">Use Jinja2 syntax: {'{{'} variable_name {'}}'}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_text">Plain Text Body (Optional)</Label>
            <Textarea
              id="body_text"
              value={formData.body_text || ""}
              onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
              placeholder="Plain text version of the email"
              rows={6}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewTemplateDialog({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Template: {template.name}</DialogTitle>
          <DialogDescription>Template details and preview</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Subject</Label>
            <p className="text-sm text-slate-700 mt-1">{template.subject}</p>
          </div>
          {template.description && (
            <div>
              <Label className="text-sm font-semibold">Description</Label>
              <p className="text-sm text-slate-700 mt-1">{template.description}</p>
            </div>
          )}
          <div>
            <Label className="text-sm font-semibold">HTML Body</Label>
            <pre className="text-xs bg-slate-50 p-4 rounded-lg mt-1 overflow-x-auto">
              {template.body_html}
            </pre>
          </div>
          {template.body_text && (
            <div>
              <Label className="text-sm font-semibold">Plain Text Body</Label>
              <pre className="text-xs bg-slate-50 p-4 rounded-lg mt-1 overflow-x-auto">
                {template.body_text}
              </pre>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="text-sm font-semibold">Status</Label>
              <span
                className={`ml-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  template.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {template.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Created: {new Date(template.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

