"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ApprovedInvoiceModal from "./ApprovedInvoiceModal";

export default function ApprovedInvoicePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
    const [modalAction, setModalAction] = useState<"detail" | "approve" | "cancel">("detail");
    const [viewMode, setViewMode] = useState<"pending" | "cancelled">("pending");
    const [accountID, setAccountID] = useState<number | null>(null);
    const [role, setRole] = useState<string>("EMPLOYEE");

    // Load sessionStorage values only on the client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            setAccountID(Number(sessionStorage.getItem("accountID")) || null);
            setRole(sessionStorage.getItem("role") || "EMPLOYEE");
        }
    }, []);

    const fetchOrders = async (page: number, mode: "pending" | "cancelled") => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const endpoint = mode === "pending" ? "pending" : "cancelled";
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (mode === "cancelled" && accountID) {
            headers["X-Role"] = role;
            headers["X-Account-ID"] = accountID.toString();
        }

        try {
            const response = await fetch(`http://localhost:8080/orders/${endpoint}?page=${page}&size=${pageSize}${sortParam}`, {
                headers,
            });
            if (!response.ok) throw new Error(`Failed to fetch ${mode} orders`);
            const data = await response.json();
            const fetchedOrders = data.content || [];
            setOrders(fetchedOrders);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error(`Error fetching ${mode} orders:`, error);
            toast.error(`Không thể tải danh sách hóa đơn ${mode === "pending" ? "chưa duyệt" : "đã hủy"}!`);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage, viewMode);
    }, [currentPage, pageSize, sorting, viewMode, accountID, role]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const openModal = (order: Order, action: "detail" | "approve" | "cancel") => {
        setSelectedOrder(order);
        setModalAction(action);
        setModalOpen(true);
    };

    const columns: ColumnDef<Order>[] = useMemo(() => [
        {
            accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1,
            id: "stt",
            header: "STT",
            enableSorting: false,
        },
        {
            accessorKey: "orderID",
            header: "Mã Hóa Đơn",
            enableSorting: true,
        },
        {
            accessorFn: (row: Order) => row.customer?.customerName || "Không xác định",
            id: "customerName",
            header: "Tên Khách Hàng",
            enableSorting: false,
        },
        {
            accessorKey: "orderDate",
            header: "Ngày Đặt",
            cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
            enableSorting: true,
        },
        ...(viewMode === "cancelled"
            ? [{
                accessorFn: (row: Order) => `${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`.trim() || "Không xác định",
                id: "employeeName",
                header: "Nhân Viên Hủy",
                enableSorting: false,
            }]
            : []),
        {
            id: "actions",
            header: "Hành Động",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button onClick={() => openModal(row.original, "detail")}>Chi tiết</Button>
                    {viewMode === "pending" && (
                        <>
                            <Button className="bg-green-500 hover:bg-green-700" onClick={() => openModal(row.original, "approve")}>Duyệt</Button>
                            <Button className="bg-red-500 hover:bg-red-700" onClick={() => openModal(row.original, "cancel")}>Hủy</Button>
                        </>
                    )}
                </div>
            ),
            enableSorting: false,
        },
    ], [currentPage, pageSize, viewMode]);

    const table = useReactTable({
        data: orders,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <main className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-semibold">
                    {viewMode === "pending" ? "Hóa Đơn Chưa Duyệt" : "Hóa Đơn Đã Hủy"}
                </h2>
                <Select value={viewMode} onValueChange={(value: "pending" | "cancelled") => setViewMode(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chọn danh sách" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Hóa đơn chưa duyệt</SelectItem>
                        <SelectItem value="cancelled">Hóa đơn đã hủy</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        <div
                                            className={header.column.getCanSort() ? "cursor-pointer flex items-center" : ""}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Trang trước
                </Button>
                <span>Trang {currentPage} / {totalPages}</span>
                <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    Trang sau
                </Button>
            </div>
            <ApprovedInvoiceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                order={selectedOrder}
                action={modalAction}
                onActionComplete={() => fetchOrders(currentPage, viewMode)}
            />
        </main>
    );
}