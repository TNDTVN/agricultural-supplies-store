"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditAccount() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [showPassword, setShowPassword] = useState(false);
    const [account, setAccount] = useState({
        username: "",
        password: "",
        email: "",
        profileImage: "",
        role: "CUSTOMER",
    });
    const [originalPassword, setOriginalPassword] = useState(""); // Lưu mật khẩu gốc
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchAccount();
        }
    }, [id]);

    const fetchAccount = async () => {
        try {
            const response = await fetch(`http://localhost:8080/accounts/${id}`);
            if (!response.ok) throw new Error("Failed to fetch account");
            const accountData = await response.json();
            setAccount({
                username: accountData.username,
                password: accountData.password, // Hiển thị mật khẩu hiện tại
                email: accountData.email,
                profileImage: accountData.profileImage,
                role: accountData.role,
            });
            setOriginalPassword(accountData.password); // Lưu mật khẩu gốc
            if (accountData.profileImage) {
                setPreview(`http://localhost:8080/images/${accountData.profileImage}`);
            }
        } catch (error) {
            console.error("Error fetching account:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccount({ ...account, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRoleChange = (value: string) => {
        setAccount({ ...account, role: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let profileImageName = account.profileImage;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadResponse = await fetch("http://localhost:8080/images/upload-single", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error(await uploadResponse.text());
                }

                profileImageName = await uploadResponse.text();
            }

            // Nếu mật khẩu không thay đổi, không gửi password trong request
            const accountData = {
                ...account,
                profileImage: profileImageName,
                password: account.password === originalPassword ? undefined : account.password,
            };

            const response = await fetch(`http://localhost:8080/accounts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accountData),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            router.push("/admin/account");
        } catch (error) {
            console.error("Error updating account:", error);
            alert((error as Error).message);
        }
    };

    const availableRoles = () => {
        if (account.role === "CUSTOMER") {
            return ["CUSTOMER", "ADMIN"];
        } else if (account.role === "EMPLOYEE" || account.role === "ADMIN") {
            return ["EMPLOYEE", "ADMIN"];
        }
        return ["CUSTOMER", "ADMIN", "EMPLOYEE"];
    };

    return (
        <main className="p-4">
            <h2 className="text-xl font-semibold">Chỉnh sửa tài khoản</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                        id="username"
                        name="username"
                        placeholder="Tên đăng nhập"
                        value={account.username}
                        onChange={handleChange}
                    />
                </div>

                <div className="relative">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu (để trống để giữ nguyên)"
                        value={account.password}
                        onChange={handleChange}
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        className="absolute inset-y-0 right-2 flex items-center px-2"
                        onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={account.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="profileImage">Ảnh đại diện</Label>
                    <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <div className="mt-2">
                            <img
                                src={preview}
                                alt="Profile Preview"
                                className="h-32 w-32 object-cover rounded"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <Label>Vai trò</Label>
                    <Select onValueChange={handleRoleChange} value={account.role}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRoles().map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit">Cập nhật</Button>
            </form>
        </main>
    );
}