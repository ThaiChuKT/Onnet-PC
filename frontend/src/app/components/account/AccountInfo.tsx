import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, Mail, Phone, Eye, EyeOff, Edit2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { apiPatch } from "../../api/http";
import { toast } from "sonner";

export function AccountInfo() {
  const { user, refreshMe } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
  }, [user]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await apiPatch<{ id: number; fullName: string; email: string; phone: string; avatar: string | null; role: string }, { fullName: string; phone: string; avatar?: string | null }>(
        "/users/me",
        { fullName: formData.fullName, phone: formData.phone, avatar: null },
      );
      await refreshMe();
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Profile
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}settings
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your personal details and account security
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-primary text-foreground hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Card className="p-6 border-border">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{formData.fullName || "—"}</h3>
              <p className="text-sm text-muted-foreground">Thành viên từ 01/2026</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Họ và Tên
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                className="bg-input-background border-border"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Mật Khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value="••••••••••••"
                  disabled
                  className="bg-input-background border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sử dụng mục "Đổi Mật Khẩu" để thay đổi mật khẩu
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email
                <span className="text-xs text-accent">(Bắt buộc)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-input-background border-border"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Số Điện Thoại
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="bg-input-background border-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-border"
              >
                Hủy
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}