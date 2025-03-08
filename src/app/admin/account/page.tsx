"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Account } from "@/types/account";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountIndex() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(5); // Số tài khoản mỗi trang
    const router = useRouter();

    useEffect(() => {
        fetchAccounts(currentPage);
    }, [currentPage]);

    const fetchAccounts = async (page: number) => {
        try {
            const response = await fetch(
                `http://localhost:8080/accounts?page=${page}&size=${pageSize}`
            );
            if (!response.ok) throw new Error("Không thể lấy danh sách tài khoản");
            const data = await response.json();
            setAccounts(data.content); // Dữ liệu nằm trong 'content'
            setTotalPages(data.totalPages); // Tổng số trang
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                fetchAccounts(1);
                setCurrentPage(1);
                return;
            }
            const response = await fetch(
                `http://localhost:8080/accounts/search?username=${encodeURIComponent(searchTerm)}&page=1&size=${pageSize}`
            );
            if (!response.ok) throw new Error("Không thể tìm kiếm tài khoản");
            const data = await response.json();
            setAccounts(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching accounts:", error);
        }
    };

    const lockAccount = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn khóa tài khoản này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/accounts/${id}/lock`, {
                method: "PUT",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể khóa tài khoản");
            }
            fetchAccounts(currentPage);
        } catch (error) {
            console.error("Error locking account:", error);
            alert(error);
        }
    };

    const unlockAccount = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn mở khóa tài khoản này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/accounts/${id}/unlock`, {
                method: "PUT",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể mở khóa tài khoản");
            }
            fetchAccounts(currentPage);
        } catch (error) {
            console.error("Error unlocking account:", error);
            alert(error);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input
                        placeholder="Tìm kiếm tài khoản..."
                        className="flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <Button onClick={() => router.push("/admin/account/add")}>
                    Thêm tài khoản
                </Button>
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
                            <TableHead>Trạng thái</TableHead>
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
                                    {account.locked ? "Đã khóa" : "Hoạt động"}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() =>
                                            router.push(`/admin/account/edit/${account.accountID}`)
                                        }
                                    >
                                        Sửa
                                    </Button>
                                    {!account.locked && account.role !== "ADMIN" && (
                                        <Button
                                            onClick={() => lockAccount(account.accountID)}
                                            className="ml-2 bg-orange-600"
                                        >
                                            Khóa
                                        </Button>
                                    )}
                                    {account.locked && (
                                        <Button
                                            onClick={() => unlockAccount(account.accountID)}
                                            className="ml-2 bg-green-600"
                                        >
                                            Mở khóa
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4 flex justify-between items-center">
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Trang trước
                    </Button>
                    <span>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Trang sau
                    </Button>
                </div>
            </div>
        </main>
    );
}