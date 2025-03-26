"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Supplier } from "@/types/supplier";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SupplierModal } from "./SupplierModal"; // Sửa đường dẫn import

interface ColumnVisibilityToggleProps {
    table: ReturnType<typeof useReactTable<Supplier>>;
}

const ColumnVisibilityToggle: React.FC<ColumnVisibilityToggleProps> = ({ table }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
            Cột <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
            <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
                {column.columnDef.header as string}
            </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

interface PageSizeSelectorProps {
    pageSize: number;
    setPageSize: (size: number) => void;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ pageSize, setPageSize }) => {
    const pageSizeOptions = [5, 10, 15, 20];
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
            {pageSize} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {pageSizeOptions.map((size) => (
            <DropdownMenuItem key={size} onClick={() => setPageSize(size)}>
                {size}
            </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
        </DropdownMenu>
    );
};

interface SupplierDetailProps {
    supplierId: string;
    open: boolean;
    onClose: () => void;
    setEditSupplier: (supplier: Supplier) => void; // Thêm prop này
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplierId, open, onClose, setEditSupplier }) => {
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (supplierId && open) {
        fetchSupplier();
        }
    }, [supplierId, open]);

    const fetchSupplier = async () => {
        try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/suppliers/${supplierId}`);
        if (!response.ok) throw new Error("Không thể lấy thông tin nhà cung cấp");
        const data: Supplier = await response.json();
        setSupplier(data);
        } catch (err) {
        const error = err as Error;
        setError(error.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle className="text-2xl text-center">Chi Tiết Nhà Cung Cấp</DialogTitle>
            </DialogHeader>
            {loading ? (
            <div className="text-center py-4">Đang tải...</div>
            ) : error || !supplier ? (
            <div className="text-center py-4">
                <p className="text-red-500">{error || "Không tìm thấy nhà cung cấp"}</p>
                <Button className="mt-4" onClick={onClose}>
                Đóng
                </Button>
            </div>
            ) : (
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                    <label className="font-semibold">ID Nhà cung cấp</label>
                    <p>{supplier.supplierID}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Tên nhà cung cấp</label>
                    <p>{supplier.supplierName}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Người liên hệ</label>
                    <p>{supplier.contactName || "Không có"}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Địa chỉ</label>
                    <p>{supplier.address || "Không có"}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Thành phố</label>
                    <p>{supplier.city || "Không có"}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                    <label className="font-semibold">Mã bưu điện</label>
                    <p>{supplier.postalCode || "Không có"}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Quốc gia</label>
                    <p>{supplier.country || "Không có"}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Số điện thoại</label>
                    <p>{supplier.phone || "Không có"}</p>
                    </div>
                    <div>
                    <label className="font-semibold">Email</label>
                    <p>{supplier.email || "Không có"}</p>
                    </div>
                </div>
                </div>
                <DialogFooter className="mt-6 flex justify-center space-x-4">
                    <Button
                        onClick={() => {
                        setEditSupplier(supplier);
                        onClose();
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </div>
            )}
        </DialogContent>
        </Dialog>
    );
};

export default function SupplierIndex() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editSupplier, setEditSupplier] = useState<Supplier | undefined>(undefined);

    useEffect(() => {
        fetchSuppliers(currentPage);
    }, [currentPage, sorting, pageSize]);

    const fetchSuppliers = async (page: number) => {
        try {
        const sortParam =
            sorting.length > 0
            ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : "";
        const response = await fetch(
            `http://localhost:8080/suppliers?page=${page}&size=${pageSize}${sortParam}`
        );
        const data = await response.json();
        setSuppliers(data.content);
        setTotalPages(data.totalPages);
        } catch (error) {
        console.error("Error fetching suppliers:", error);
        }
    };

    const handleSearch = async () => {
        try {
        if (!searchTerm.trim()) {
            fetchSuppliers(1);
            setCurrentPage(1);
            return;
        }
        const sortParam =
            sorting.length > 0
            ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : "";
        const response = await fetch(
            `http://localhost:8080/suppliers/search?keyword=${encodeURIComponent(
            searchTerm
            )}&page=1&size=${pageSize}${sortParam}`
        );
        const data = await response.json();
        setSuppliers(data.content);
        setTotalPages(data.totalPages);
        setCurrentPage(1);
        } catch (error) {
        console.error("Error searching suppliers:", error);
        }
    };

    const deleteSupplier = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
        try {
        const response = await fetch(`http://localhost:8080/suppliers/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorText = await response.text();
            toast.success("Lỗi: " + errorText, {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        toast.success("Xóa nhà cung cấp thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
        fetchSuppliers(currentPage);
        } catch (error) {
        const err = error as Error;
        toast.success(err.message || "Có lỗi xảy ra khi xóa nhà cung cấp!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const refreshSuppliers = () => {
        fetchSuppliers(currentPage);
    };

    const columns: ColumnDef<Supplier>[] = useMemo(
        () => [
        {
            accessorFn: (_row: Supplier, index: number) => (currentPage - 1) * pageSize + index + 1,
            id: "stt",
            header: "STT",
            enableSorting: false,
        },
        {
            accessorKey: "supplierID",
            header: "ID",
            enableSorting: true,
        },
        {
            accessorKey: "supplierName",
            header: "Tên nhà cung cấp",
            enableSorting: true,
        },
        {
            accessorKey: "contactName",
            header: "Tên liên hệ",
            cell: ({ row }) => row.original.contactName || "Không có",
            enableSorting: false,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || "Không có",
            enableSorting: false,
        },
        {
            accessorKey: "phone",
            header: "Số điện thoại",
            cell: ({ row }) => row.original.phone || "Không có",
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
            <>
                <Button onClick={() => setEditSupplier(row.original)}>Sửa</Button>
                <Button
                className="ml-2 bg-cyan-500 hover:bg-cyan-700"
                onClick={() => setSelectedSupplierId(row.original.supplierID.toString())}
                >
                Chi tiết
                </Button>
                <Button
                className="ml-2 bg-red-600 hover:bg-red-800"
                onClick={() => deleteSupplier(row.original.supplierID)}
                >
                Xóa
                </Button>
            </>
            ),
            enableSorting: false,
        },
        ],
        [currentPage, pageSize]
    );

    const table = useReactTable({
        data: suppliers,
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
            <Input
                placeholder="Tìm kiếm nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>Tìm</Button>
            </div>
            <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>Thêm nhà cung cấp</Button>
            <ColumnVisibilityToggle table={table} />
            <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
            </div>
        </div>

        <div className="mt-6">
            <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Nhà Cung Cấp</h2>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead
                        key={header.id}
                        onClick={
                            header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={`${header.column.getCanSort() ? "cursor-pointer" : ""} ${
                            header.column.getIsSorted()
                            ? "bg-blue-100 text-blue-700"
                            : header.column.getCanSort()
                            ? "hover:bg-gray-100"
                            : ""
                        }`}
                        >
                        <div className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                            )}
                        </div>
                        </TableHead>
                    ))}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Không có dữ liệu
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
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

        <SupplierModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={refreshSuppliers}
        />

        <SupplierModal
            isOpen={!!editSupplier}
            onClose={() => setEditSupplier(undefined)}
            supplier={editSupplier}
            onSuccess={refreshSuppliers}
        />

        {selectedSupplierId && (
            <SupplierDetail
                supplierId={selectedSupplierId}
                open={!!selectedSupplierId}
                onClose={() => setSelectedSupplierId(null)}
                setEditSupplier={setEditSupplier} // Truyền setEditSupplier xuống
            />
        )}
        </main>
    );
    }