import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User, Plus, Edit, Trash2, Search, Wallet, Shield } from "lucide-react";
import { useState } from "react";

interface Account {
  id: string;
  username: string;
  email: string;
  password: string;
  balance: number;
  role: "user" | "admin" | "mod";
  createdAt: string;
}

const initialAccounts: Account[] = [
  {
    id: "ACC001",
    username: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    password: "••••••••",
    balance: 2500000,
    role: "user",
    createdAt: "01/01/2026",
  },
  {
    id: "ACC002",
    username: "Trần Thị B",
    email: "tranthib@gmail.com",
    password: "••••••••",
    balance: 1500000,
    role: "user",
    createdAt: "05/01/2026",
  },
  {
    id: "ACC003",
    username: "Admin",
    email: "admin@rentpc.com",
    password: "••••••••",
    balance: 0,
    role: "admin",
    createdAt: "01/01/2026",
  },
  {
    id: "ACC004",
    username: "Moderator 1",
    email: "mod1@rentpc.com",
    password: "••••••••",
    balance: 0,
    role: "mod",
    createdAt: "10/01/2026",
  },
  {
    id: "ACC005",
    username: "Lê Văn C",
    email: "levanc@gmail.com",
    password: "••••••••",
    balance: 3200000,
    role: "user",
    createdAt: "15/02/2026",
  },
];

const roleConfig = {
  admin: { label: "Admin", className: "bg-primary/20 text-primary border-primary/50" },
  mod: { label: "Moderator", className: "bg-secondary/20 text-secondary border-secondary/50" },
  user: { label: "User", className: "bg-accent/20 text-accent border-accent/50" },
};

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    balance: "0",
    role: "user" as Account["role"],
  });

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const newAccount: Account = {
      id: `ACC${String(accounts.length + 1).padStart(3, "0")}`,
      username: formData.username,
      email: formData.email,
      password: "••••••••",
      balance: parseInt(formData.balance),
      role: formData.role,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };
    setAccounts([...accounts, newAccount]);
    setFormData({ username: "", email: "", password: "", balance: "0", role: "user" });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      email: account.email,
      password: "",
      balance: String(account.balance),
      role: account.role,
    });
  };

  const handleUpdate = () => {
    if (!editingAccount) return;
    setAccounts(
      accounts.map((acc) =>
        acc.id === editingAccount.id
          ? {
              ...acc,
              username: formData.username,
              email: formData.email,
              balance: parseInt(formData.balance),
              role: formData.role,
            }
          : acc
      )
    );
    setEditingAccount(null);
    setFormData({ username: "", email: "", password: "", balance: "0", role: "user" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
    }
  };

  const stats = {
    total: accounts.length,
    users: accounts.filter((acc) => acc.role === "user").length,
    admins: accounts.filter((acc) => acc.role === "admin").length,
    mods: accounts.filter((acc) => acc.role === "mod").length,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tài khoản</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-accent">{stats.users}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins/Mods</p>
              <p className="text-2xl font-bold text-secondary">{stats.admins + stats.mods}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng số dư</p>
              <p className="text-xl font-bold text-primary">
                {stats.totalBalance.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Tài Khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên Tài Khoản</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nhập tên tài khoản"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Số Dư Ví</Label>
                <Input
                  id="balance"
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Quyền</Label>
                <Select value={formData.role} onValueChange={(value: Account["role"]) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="mod">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-primary to-accent">
                Thêm Tài Khoản
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account List */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <Card
            key={account.id}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{account.username}</h3>
                      <Badge className={roleConfig[account.role].className}>
                        {roleConfig[account.role].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{account.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mật khẩu:</span>
                    <span className="font-mono">{account.password}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Số dư:</span>
                    <span className="font-bold text-primary">
                      {account.balance.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tạo lúc:</span>
                    <span className="font-medium">{account.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={editingAccount?.id === account.id}
                  onOpenChange={(open) => !open && setEditingAccount(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      className="border-primary text-foreground hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Chỉnh Sửa Tài Khoản</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-username">Tên Tài Khoản</Label>
                        <Input
                          id="edit-username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-balance">Số Dư Ví</Label>
                        <Input
                          id="edit-balance"
                          type="number"
                          value={formData.balance}
                          onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Quyền</Label>
                        <Select value={formData.role} onValueChange={(value: Account["role"]) => setFormData({ ...formData, role: value })}>
                          <SelectTrigger className="bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="mod">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleUpdate} className="w-full bg-gradient-to-r from-primary to-accent">
                        Cập Nhật
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={account.role === "admin"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card className="p-12 border-border text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Không tìm thấy tài khoản nào</h3>
          <p className="text-muted-foreground">
            Thử tìm kiếm với từ khóa khác hoặc thêm tài khoản mới
          </p>
        </Card>
      )}
    </div>
  );
}
