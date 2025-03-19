"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Account } from "@/types/account";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

    export default function AccountDetail() {
    const router = useRouter();
    const { id } = useParams();
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
        fetchAccount();
        }
    }, [id]);

    const fetchAccount = async () => {
        try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/accounts/${id}`);
        if (!response.ok) {
            throw new Error("Không thể lấy thông tin tài khoản");
        }
        const accountData = await response.json();
        setAccount(accountData);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        } finally {
        setLoading(false);
        }
    };

    if (loading) {
        return (
        <main className="p-4">
            <div className="text-center">Đang tải...</div>
        </main>
        );
    }

    if (error || !account) {
        return (
        <main className="p-4">
            <div className="text-center text-red-500">
            {error || "Không tìm thấy tài khoản"}
            </div>
            <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push("/admin/account")}>
                Quay lại danh sách
            </Button>
            </div>
        </main>
        );
    }

    return (
        <main className="p-4">
        <div className="max-w-3xl mx-auto rounded-md border">
            <h1 className="text-3xl text-center font-semibold mb-6">
            Chi Tiết Tài Khoản
            </h1>
            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                <div>
                    <Label className="font-semibold">ID Tài khoản</Label>
                    <p>{account.accountID}</p>
                </div>
                <div>
                    <Label className="font-semibold">Tên đăng nhập</Label>
                    <p>{account.username}</p>
                </div>
                <div>
                    <Label className="font-semibold">Email</Label>
                    <p>{account.email}</p>
                </div>
                <div>
                    <Label className="font-semibold">Vai trò</Label>
                    <p>{account.role}</p>
                </div>
                <div>
                    <Label className="font-semibold">Trạng thái</Label>
                    <p
                    className={account.locked ? "text-red-500" : "text-green-500"}
                    >
                    {account.locked ? "Đã khóa" : "Hoạt động"}
                    </p>
                </div>
                </div>

                <div className="space-y-4">
                <div>
                    <Label className="font-semibold">Ảnh đại diện</Label>
                    {account.profileImage ? (
                    <img
                        src={`http://localhost:8080/images/${account.profileImage}`}
                        alt="Ảnh đại diện"
                        className="mt-2 h-40 w-40 object-cover rounded-md border"
                    />
                    ) : (
                    <p className="mt-2 text-gray-500">Chưa có ảnh đại diện</p>
                    )}
                </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                <Button
                onClick={() => router.push(`/admin/account/edit/${account.accountID}`)}
                >
                Chỉnh sửa
                </Button>
                <Button
                variant="secondary"
                asChild
                >
                <Link href="/admin/account">Trở về</Link>
                </Button>
            </div>
            </div>
        </div>
        </main>
    );
}