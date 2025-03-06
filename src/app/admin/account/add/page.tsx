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
import { useRouter } from "next/navigation";
import { useState } from "react";

    export default function AddAccount() {
    const router = useRouter();
    const [account, setAccount] = useState({
        username: "",
        email: "",
        password: "",
        profileImage: "",
        role: "CUSTOMER",
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

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

        // Nếu có file ảnh được chọn, upload ảnh trước
        if (file) {
            const formData = new FormData();
            formData.append("file", file); // Sử dụng "file" thay vì "files" để khớp với backend

            const uploadResponse = await fetch("http://localhost:8080/images/upload-single", {
            method: "POST",
            body: formData,
            });

            if (!uploadResponse.ok) {
            throw new Error(await uploadResponse.text());
            }

            profileImageName = await uploadResponse.text(); // Lấy tên file trực tiếp (không phải array)
        }

        // Gửi request tạo account với tên file ảnh
        const accountData = {
            ...account,
            profileImage: profileImageName,
        };

        const response = await fetch("http://localhost:8080/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accountData),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        router.push("/admin/account");
        } catch (error) {
        console.error("Error adding account:", error);
        // Có thể thêm thông báo lỗi cho người dùng ở đây
        }
    };

    return (
        <main className="p-4">
        <h2 className="text-xl font-semibold">Thêm tài khoản</h2>
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

            <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                value={account.password}
                onChange={handleChange}
            />
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
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded"
                />
                </div>
            )}
            </div>

            <div>
            <Label>Vai trò</Label>
            <Select onValueChange={handleRoleChange} defaultValue="CUSTOMER">
                <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <Button type="submit">Thêm</Button>
        </form>
        </main>
    );
}