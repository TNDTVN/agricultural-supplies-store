export interface Account {
  id: number; // ID tài khoản
  username: string; // Tên đăng nhập
  password: string; // Mật khẩu (nên mã hóa khi lưu)
  email: string; // Email của người dùng
  phone: string; // Số điện thoại
  role: "ADMIN" | "USER" | "EMLOYEE"; // Phân quyền (Admin hoặc User)
  image: string; // Đường dẫn ảnh đại diện
}