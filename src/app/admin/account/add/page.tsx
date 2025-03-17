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
import { Eye, EyeOff } from "lucide-react"; // Thêm import cho biểu tượng
import Link from "next/link";
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
    const [showPassword, setShowPassword] = useState(false); // Thêm state cho hiển thị mật khẩu
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
        }
    };

    return (
        <main className="p-4">
            <h1 className="text-3xl text-center font-semibold">Thêm Tài Khoản</h1>
            <div className="rounded-md border border-gray-300 p-4">
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
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={account.password}
                            onChange={handleChange}
                            className="pr-10" // Đệm phải để chừa chỗ cho con mắt
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
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

                <div className="flex space-x-2">
                    <Button type="submit">Thêm</Button>
                    <Link
                        href={"/admin/account"}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-gray-200 border rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Trở về
                    </Link>
                </div>
            </form>
            </div>
        </main>
    );
}