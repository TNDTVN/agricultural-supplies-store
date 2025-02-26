"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddAccount() {
    const router = useRouter();
    const [account, setAccount] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
        image: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccount({ ...account, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("http://localhost:8080/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account),
        });
        router.push("/admin/account");
    };

    return (
        <main className="p-4">
            <h2 className="text-xl font-semibold">Thêm tài khoản</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="username" placeholder="Tên đăng nhập" value={account.username} onChange={handleChange} />
                <Input name="password" type="password" placeholder="Mật khẩu" value={account.password} onChange={handleChange} />
                <Input name="email" type="email" placeholder="Email" value={account.email} onChange={handleChange} />
                <Input name="phone" placeholder="Số điện thoại" value={account.phone} onChange={handleChange} />
                <Input name="image" placeholder="URL Ảnh đại diện" value={account.image} onChange={handleChange} />
                <Button type="submit">Thêm</Button>
            </form>
        </main>
    );
}
