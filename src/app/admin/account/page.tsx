"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Account } from "@/types/account";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountIndex() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/accounts");
            const data = await response.json();
            setAccounts(data);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const deleteAccount = async (id: number) => {
        try {
            await fetch(`http://localhost:8080/api/accounts/${id}`, { method: "DELETE" });
            fetchAccounts();
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input placeholder="Tìm kiếm tài khoản..." className="flex-1" />
                    <Button>Tìm</Button>
                </div>
                <Button onClick={() => router.push("/admin/account/add")}>Thêm tài khoản</Button>
            </div>
            <div className="mt-6">
                <h2 className="mb-2 text-xl font-semibold">Danh sách tài khoản</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên đăng nhập</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.accountID}>
                                <TableCell>{account.accountID}</TableCell>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{account.email}</TableCell>
                                <TableCell>{account.role}</TableCell>
                                <TableCell>
                                    <Button onClick={() => router.push(`/admin/account/edit/${account.accountID}`)}>Sửa</Button>
                                    <Button onClick={() => deleteAccount(account.accountID)} className="ml-2 bg-red-600">Xóa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
}