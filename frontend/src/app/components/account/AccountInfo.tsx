import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, Mail, Phone, Eye, EyeOff, Edit2, Lock } from "lucide-react";
import { useState } from "react";

export function AccountInfo() {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "Nguyễn Văn A",
    email: "example@gmail.com",
    phone: "0123456789",
  });

  const handleSave = () => {
    // Xử lý lưu thông tin
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Thông Tin
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}Tài Khoản
            </span>
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-primary text-foreground hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh Sửa
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
              <h3 className="font-bold text-lg">{formData.username}</h3>
              <p className="text-sm text-muted-foreground">Thành viên từ 01/2026</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Tên Tài Khoản
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
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
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Lưu Thay Đổi
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