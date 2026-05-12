const vietnameseMessageMap: Array<[string, string]> = [
  ["khong tim thay", "Not found"],
  ["khong the tai", "Unable to load data"],
  ["khong the cap nhat", "Unable to update"],
  ["cap nhat thanh cong", "Updated successfully"],
  ["khong the xoa", "Unable to delete"],
  ["xoa thanh cong", "Deleted successfully"],
  ["khong the tao", "Unable to create"],
  ["tao thanh cong", "Created successfully"],
  ["khong du so du", "Insufficient wallet balance"],
  ["mat khau cu khong dung", "Old password is incorrect"],
  ["mat khau moi khong khop", "New password confirmation does not match"],
  ["email da ton tai", "Email already exists"],
  ["tai khoan bi khoa", "Account is locked"],
  ["tai khoan chua xac thuc", "Account is not verified"],
  ["ma xac thuc khong hop le", "Invalid verification code"],
  ["ma dat lai mat khau khong hop le", "Invalid reset code"],
  ["phien da ket thuc", "Session has ended"],
  ["khong co may kha dung", "No available machine"],
  ["may dang bao tri", "Machine is under maintenance"],
  ["don hang khong hop le", "Invalid order"],
  ["trang thai khong hop le", "Invalid status"],
];

function stripVietnameseMarks(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();
}

export function toEnglishMessage(message: string | null | undefined, fallback = "Request failed") {
  const trimmed = message?.trim();
  if (!trimmed) return fallback;

  const normalized = stripVietnameseMarks(trimmed);
  const mapped = vietnameseMessageMap.find(([needle]) => normalized.includes(needle));
  if (mapped) return mapped[1];

  return normalized !== trimmed.toLowerCase() ? fallback : trimmed;
}
