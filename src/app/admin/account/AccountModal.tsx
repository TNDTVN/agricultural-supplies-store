"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Account } from "@/types/account";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "add" | "edit" | "detail";
    account?: Account | null;
    onSave: (accountData: Partial<Account>, file?: File | null) => Promise<void>;
}

export default function AccountModal({ isOpen, onClose, mode, account, onSave }: AccountModalProps) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        profileImage: "",
        role: "CUSTOMER",
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (account && (mode === "edit" || mode === "detail")) {
                setFormData({
                    username: account.username || "",
                    email: account.email || "",
                    password: "",
                    profileImage: account.profileImage || "",
                    role: account.role || "CUSTOMER",
                });
                if (account.profileImage) {
                    const imageUrl = `http://localhost:8080/images/${account.profileImage}`;
                    console.log("Setting preview URL:", imageUrl);
                    setPreview(imageUrl);
                } else {
                    console.log("No profile image found for account:", account);
                    setPreview(null);
                }
            } else if (mode === "add") {
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    profileImage: "",
                    role: "CUSTOMER",
                });
                setPreview(null);
                setFile(null);
            }
        }
    }, [isOpen, account, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                console.log("Preview from file upload:", result);
                setPreview(result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRoleChange = (value: string) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "detail") {
            onClose();
            return;
        }
        try {
            await onSave(formData, file);
            // Chỉ hiển thị thông báo nếu có thay đổi thực sự
            if (mode === "add" || (mode === "edit" && (formData.username !== account?.username || 
                formData.email !== account?.email || 
                formData.role !== account?.role || 
                formData.password || 
                file))) {
                toast.success(`${mode === "add" ? "Thêm" : "Cập nhật"} tài khoản thành công!`);
            }
            onClose();
        } catch (error) {
            toast.error(`Lỗi: ${(error as Error).message}`);
        }
    };

    const isDetailMode = mode === "detail";
    const title = isDetailMode ? "Chi Tiết Tài Khoản" : mode === "add" ? "Thêm Tài Khoản" : "Cập Nhật Tài Khoản";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]" aria-describedby="dialog-description">
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription id="dialog-description" className="text-center">
                        {isDetailMode ? "Xem thông tin chi tiết tài khoản" : mode === "add" ? "Thêm tài khoản mới" : "Cập nhật thông tin tài khoản"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isDetailMode ? (
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <p>{formData.username}</p>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <p>{formData.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-fit me-2">
                                        <Label>Vai trò</Label>
                                        <p>{formData.role}</p>
                                    </div>
                                    <div className="w-fit">
                                        <Label>Trạng thái</Label>
                                        <p className={account?.locked ? "text-red-500" : "text-green-500"}>
                                            {account?.locked ? "Đã khóa" : "Hoạt động"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/3">
                                <Label htmlFor="profileImage">Ảnh đại diện</Label>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile"
                                        className="mt-2 h-32 w-32 object-cover rounded"
                                        onError={(e) => {
                                            console.error("Failed to load image:", preview);
                                            e.currentTarget.src = "/fallback-image.jpg";
                                        }}
                                    />
                                ) : (
                                    <p>Chưa có ảnh</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isDetailMode}
                                />
                            </div>
                            {!isDetailMode && (
                                <div className="relative">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={mode === "edit" ? "Để trống để giữ nguyên" : "Mật khẩu"}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 top-6"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isDetailMode}
                                />
                            </div>
                            <div>
                                <Label htmlFor="profileImage">Ảnh đại diện</Label>
                                <Input id="profileImage" type="file" accept="image/*" onChange={handleFileChange} />
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mt-2 h-32 w-32 object-cover rounded"
                                        onError={(e) => {
                                            console.error("Failed to load preview:", preview);
                                            e.currentTarget.src = "/fallback-image.jpg";
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <Label>Vai trò</Label>
                                <Select onValueChange={handleRoleChange} value={formData.role}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                                        <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-2">
                        {!isDetailMode && <Button type="submit">{mode === "add" ? "Thêm" : "Cập nhật"}</Button>}
                        <Button variant="secondary" type="button" onClick={onClose}>
                            {isDetailMode ? "Đóng" : "Hủy"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}