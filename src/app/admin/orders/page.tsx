"use client";

import InvoicePDF from "@/components/InvoicePDF";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { OrderDetail } from "@/types/orderdetails";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import OrderModal from "./OrderModal";

const ColumnVisibilityToggle = ({ table }: { table: any }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">Cột <ChevronDown className="ml-2 h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {table.getAllColumns().filter((column: any) => column.getCanHide()).map((column: any) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value: any) => column.toggleVisibility(!!value)}>
                    {column.columnDef.header as string}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

const PageSizeSelector = ({ pageSize, setPageSize }: { pageSize: number; setPageSize: (size: number) => void }) => {
    const pageSizeOptions = [5, 10, 15, 20];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">{pageSize} <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {pageSizeOptions.map(size => (
                    <DropdownMenuItem key={size} onClick={() => setPageSize(size)}>{size}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
    const [role, setRole] = useState<string | null>(null);
    const [accountID, setAccountID] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedRole = sessionStorage.getItem("role");
            const storedAccountID = sessionStorage.getItem("accountID");
            setRole(storedRole);
            setAccountID(storedAccountID ? parseInt(storedAccountID) : null);
        }
    }, []);

    const fetchOrders = async (page: number) => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (role) headers["X-Role"] = role;
        if (accountID) headers["X-Account-ID"] = accountID.toString();

        const response = await fetch(`http://localhost:8080/orders?page=${page}&size=${pageSize}${sortParam}`, { headers });
        const data = await response.json();
        console.log("Phản hồi từ API đơn hàng:", JSON.stringify(data, null, 2));

        const orders = data.content || [];
        const ordersWithDetails = await Promise.all(
            orders.map(async (order: Order) => {
                const detailsResponse = await fetch(`http://localhost:8080/orderdetails?orderID=${order.orderID}`);
                const detailsData = await detailsResponse.json();
                return { ...order, orderDetails: Array.isArray(detailsData) ? detailsData : [] };
            })
        );

        setOrders(ordersWithDetails);
        setTotalPages(data.totalPages || 1);
    };
    useEffect(() => {
        if (role !== null && accountID !== null) {
            fetchOrders(currentPage);
        }
    }, [currentPage, pageSize, sorting, role, accountID]);

    const handleSearch = async () => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (role) headers["X-Role"] = role;
        if (accountID) headers["X-Account-ID"] = accountID.toString();

        const url = searchTerm.trim()
            ? `http://localhost:8080/orders/search?keyword=${encodeURIComponent(searchTerm)}&page=1&size=${pageSize}${sortParam}`
            : `http://localhost:8080/orders?page=1&size=${pageSize}${sortParam}`;
        const response = await fetch(url, { headers });
        const data = await response.json();
        console.log("Search API response:", JSON.stringify(data, null, 2));

        const orders = data.content || [];
        const ordersWithDetails = await Promise.all(
            orders.map(async (order: Order) => {
                const detailsResponse = await fetch(`http://localhost:8080/orderdetails?orderID=${order.orderID}`);
                const detailsData = await detailsResponse.json();
                return { ...order, orderDetails: Array.isArray(detailsData) ? detailsData : [] };
            })
        );

        setOrders(ordersWithDetails);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const openModal = (order: Order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const columns: ColumnDef<Order>[] = useMemo(() => [
        { accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1, id: "stt", header: "STT", enableSorting: false },
        { accessorKey: "orderID", header: "Mã Đơn Hàng", enableSorting: true },
        {
            accessorFn: row => row.customer?.customerName || "Không xác định",
            id: "customerName",
            header: "Tên Khách Hàng",
            enableSorting: true
        },
        {
            accessorFn: row => `${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`.trim() || "Không xác định", 
            id: "employeeName",
            header: "Tên Nhân Viên",
            enableSorting: true
        },
        {
            accessorKey: "orderDate",
            header: "Ngày Đặt",
            cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
            enableSorting: true
        },
        {
            accessorFn: row => row.orderDetails?.reduce((sum: number, detail) =>
                sum + detail.unitPrice * detail.quantity * (1 - detail.discount), 0)
                .toLocaleString('vi-VN', { minimumFractionDigits: 0 })
                .replace(/\./g, ',') + " VND" || "0 VND",
            id: "totalAmount",
            header: "Tổng Số Tiền",
            enableSorting: true
        },
        {
            id: "actions",
            header: "Hành Động",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        className="bg-cyan-500 hover:bg-cyan-700"
                        onClick={() => openModal(row.original)}
                    >
                        Chi tiết
                    </Button>
                    <PDFDownloadLink
                        document={<InvoicePDF order={{ ...row.original, orderDetails: row.original.orderDetails || [] } as Order & { orderDetails: OrderDetail[] }} />}
                        fileName={`HoaDon_${row.original.orderID}.pdf`}>
                        {({ loading, blob, url, error }) => (
                            <Button
                                className="bg-green-500 hover:bg-green-700"
                                disabled={loading}
                                onClick={() => {
                                    if (!loading && !error && blob) {
                                        toast.success("Xuất hóa đơn thành công!", {
                                            position: "top-right",
                                            autoClose: 3000,
                                        });
                                    }
                                }}
                            >
                                {loading ? "Đang tạo..." : "Xuất hóa đơn"}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            ),
            enableSorting: false,
        },
    ], [currentPage, pageSize]);

    const table = useReactTable({
        data: orders,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input placeholder="Tìm kiếm đơn hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>
            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Đơn Hàng</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead
                                            key={header.id}
                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            className={`${header.column.getCanSort() ? "cursor-pointer" : ""} ${header.column.getIsSorted() ? "bg-blue-100 text-blue-700" : header.column.getCanSort() ? "hover:bg-gray-100" : ""}`}
                                        >
                                            <div className="flex items-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center">Không có dữ liệu</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Trang trước</Button>
                    <span>Trang {currentPage} / {totalPages}</span>
                    <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Trang sau</Button>
                </div>
            </div>
            <OrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} order={selectedOrder} />
        </main>
    );
}