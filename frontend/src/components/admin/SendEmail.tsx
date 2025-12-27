import { useState } from "react";
import { Loader2, Send, Mail } from "lucide-react";
import {
  useEmailTemplates,
  useSendEmail,
  SendEmailRequest,
} from "@/hooks/useAdminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export function SendEmail() {
  const [emailType, setEmailType] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [bodyHtml, setBodyHtml] = useState<string>("");
  const [context, setContext] = useState<string>("{}");
  const { toast } = useToast();

  const { data: templates, isLoading: templatesLoading } = useEmailTemplates(0, 100, false);
  const sendMutation = useSendEmail();

  const handleSend = async () => {
    try {
      // Parse recipients
      const recipientList = recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (recipientList.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one recipient email address",
          variant: "destructive",
        });
        return;
      }

      let requestData: SendEmailRequest;

      if (emailType === "template") {
        if (!selectedTemplate) {
          toast({
            title: "Error",
            description: "Please select a template",
            variant: "destructive",
          });
          return;
        }

        // Parse context JSON
        let contextObj = {};
        try {
          contextObj = JSON.parse(context || "{}");
        } catch (e) {
          toast({
            title: "Error",
            description: "Invalid JSON in context field",
            variant: "destructive",
          });
          return;
        }

        requestData = {
          template_name: selectedTemplate,
          recipients: recipientList,
          context: contextObj,
        };
      } else {
        if (!subject || !bodyHtml) {
          toast({
            title: "Error",
            description: "Subject and HTML body are required for custom emails",
            variant: "destructive",
          });
          return;
        }

        requestData = {
          recipients: recipientList,
          subject,
          body_html: bodyHtml,
        };
      }

      await sendMutation.mutateAsync(requestData);

      toast({
        title: "Success",
        description: `Email sent successfully to ${recipientList.length} recipient(s)`,
      });

      // Reset form
      setRecipients("");
      setSubject("");
      setBodyHtml("");
      setContext("{}");
      setSelectedTemplate("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Send Email</h2>
        <p className="text-slate-600 mt-1">Send emails using templates or create custom emails</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        {/* Email Type Selection */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Email Type</Label>
          <RadioGroup
            value={emailType}
            onValueChange={(value) => setEmailType(value as "template" | "custom")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template" id="template" />
              <Label htmlFor="template" className="cursor-pointer">
                Use Template
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">
                Custom Email
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          <Label htmlFor="recipients">Recipients *</Label>
          <Input
            id="recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            required
          />
          <p className="text-xs text-slate-500">Separate multiple emails with commas</p>
        </div>

        {/* Template Selection */}
        {emailType === "template" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="template">Select Template *</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={templatesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templatesLoading ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    </div>
                  ) : templates && templates.length > 0 ? (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.name}>
                        {template.name} {!template.is_active && "(Inactive)"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500">No templates available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Template Context (JSON)</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='{"user_name": "John Doe", "transaction_id": "txn_123", ...}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                JSON object with variables to pass to the template (e.g., {"{"}"user_name": "John"{"}"})
              </p>
            </div>
          </>
        )}

        {/* Custom Email Fields */}
        {emailType === "custom" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_html">HTML Body *</Label>
              <Textarea
                id="body_html"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="HTML email content"
                required
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </>
        )}

        {/* Send Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="min-w-[120px]"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Email Sending Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Templates support Jinja2 syntax for dynamic content</li>
              <li>• Use context JSON to pass variables to templates</li>
              <li>• Custom emails allow full HTML formatting</li>
              <li>• Multiple recipients can be added separated by commas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

