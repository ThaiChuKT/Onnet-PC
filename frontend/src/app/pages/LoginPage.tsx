import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "sonner";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        const state = location.state as { from?: string } | null;
        const redirectTo = state?.from ?? "/";
        toast.success("Đăng nhập thành công");
        navigate(redirectTo, { replace: true });
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Mật khẩu không khớp!");
          return;
        }
        await register({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
        setIsLogin(true);
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12 bg-gradient-to-br from-black via-background to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 border-border bg-card/80 backdrop-blur">
              {/* Logo/Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {isLogin ? "Đăng Nhập" : "Đăng Ký"}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {" "}Tài Khoản
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  {isLogin
                    ? "Chào mừng bạn quay lại!"
                    : "Tạo tài khoản để bắt đầu thuê máy"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và Tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Nhập họ và tên"
                        className="pl-10 bg-input-background border-border"
                        required
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số Điện Thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        className="pl-10 bg-input-background border-border"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="example@email.com"
                      className="pl-10 bg-input-background border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật Khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-input-background border-border"
                      required
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
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="pl-10 bg-input-background border-border"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? "Đang xử lý..." : isLogin ? "Đăng Nhập" : "Đăng Ký"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLogin ? (
                    <>
                      Chưa có tài khoản?{" "}
                      <span className="text-primary font-medium">Đăng ký ngay</span>
                    </>
                  ) : (
                    <>
                      Đã có tài khoản?{" "}
                      <span className="text-primary font-medium">Đăng nhập</span>
                    </>
                  )}
                </button>
              </div>

              {/* Features */}
              {!isLogin && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Khi đăng ký, bạn sẽ được:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Quản lý tài khoản và lịch sử thuê máy</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Sử dụng ví điện tử để thanh toán nhanh</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Chat với AI để được tư vấn cấu hình</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Nhận ưu đãi và khuyến mãi đặc biệt</span>
                    </li>
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
