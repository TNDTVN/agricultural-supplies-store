"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditAccount() {
    const router = useRouter();
    const params = useParams(); // Get URL parameters
    const id = params?.id; // Extract the account ID from the URL
    const [showPassword, setShowPassword] = useState(false);
    const [account, setAccount] = useState({
        username: "",
        password: "", // Thêm trường mật khẩu
        email: "",
        phone: "",
        role: "USER", // Mặc định là USER
        image: "", // Đổi từ avatar thành image
    });

    useEffect(() => {
        if (id) {
            fetchAccount();
        }
    }, [id]);

    const fetchAccount = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch account");
            }
            const data = await response.json();
            setAccount(data); // Populate form with existing account data
        } catch (error) {
            console.error("Error fetching account:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAccount({ ...account, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(account),
            });

            if (!response.ok) {
                throw new Error("Failed to update account");
            }

            router.push("/admin/account"); // Redirect to account list after updating
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    return (
        <main className="p-4">
            <h2 className="text-xl font-semibold">Chỉnh sửa tài khoản</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="username" placeholder="Tên đăng nhập" value={account.username} onChange={handleChange} />
                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={account.password}
                        onChange={handleChange}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <Input name="email" type="email" placeholder="Email" value={account.email} onChange={handleChange} />
                <Input name="phone" placeholder="Số điện thoại" value={account.phone} onChange={handleChange} />
                <Input name="image" placeholder="URL Ảnh đại diện" value={account.image} onChange={handleChange} />

                {/* Select Dropdown for Role */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Vai trò
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={account.role}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                    </select>
                </div>

                <Button type="submit">Cập nhật</Button>
            </form>
        </main>
    );
}