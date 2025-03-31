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
import { Customer } from "@/types/customer";
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
import { CustomerModal } from "./CustomerModal";

interface ColumnVisibilityToggleProps {
    table: ReturnType<typeof useReactTable<Customer>>;
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

interface CustomerDetailProps {
    customerID: string;
    open: boolean;
    onClose: () => void;
    setEditCustomer: (customer: Customer) => void;
    refreshCustomerList: () => void; // Đổi tên prop để rõ ràng hơn
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
    customerID,
    open,
    onClose,
    setEditCustomer,
    refreshCustomerList,
}) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerID && open) {
            fetchCustomer();
        }
    }, [customerID, open]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/customers/${customerID}`);
            if (!response.ok) throw new Error("Không thể lấy thông tin khách hàng");
            const data: Customer = await response.json();
            console.log("Customer detail response:", data); // Debug response
            setCustomer(data);
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
                    <DialogTitle className="text-2xl text-center">Chi Tiết Khách Hàng</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="text-center py-4">Đang tải...</div>
                ) : error || !customer ? (
                    <div className="text-center py-4">
                        <p className="text-red-500">{error || "Không tìm thấy khách hàng"}</p>
                        <Button className="mt-4" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold">ID Khách hàng</label>
                                    <p>{customer.customerID}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Tên khách hàng</label>
                                    <p>{customer.customerName}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Tên liên hệ</label>
                                    <p>{customer.contactName || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Địa chỉ</label>
                                    <p>{customer.address || "Không có"}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold">Email</label>
                                    <p>{customer.email || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Số điện thoại</label>
                                    <p>{customer.phone || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Thành phố</label>
                                    <p>{customer.city || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Trạng thái tài khoản</label>
                                    <p>{customer.locked ? "Đã khóa" : "Hoạt động"}</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-6 flex justify-center space-x-4">
                            <Button
                                onClick={() => {
                                    setEditCustomer(customer);
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

export default function CustomerIndex() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | undefined>(undefined);

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage, sorting, pageSize]);

    const fetchCustomers = async (page: number) => {
        try {
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/customers?page=${page}&size=${pageSize}${sortParam}`
            );
            if (!response.ok) throw new Error("Không thể lấy danh sách khách hàng");
            const data = await response.json();
            console.log("Customers list response:", data.content); // Debug response
            setCustomers(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Có lỗi xảy ra khi tải danh sách khách hàng!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                fetchCustomers(1);
                setCurrentPage(1);
                return;
            }
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/customers/search?name=${encodeURIComponent(
                    searchTerm
                )}&page=1&size=${pageSize}${sortParam}`
            );
            if (!response.ok) throw new Error("Không thể tìm kiếm khách hàng");
            const data = await response.json();
            setCustomers(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching customers:", error);
            toast.error("Có lỗi xảy ra khi tìm kiếm khách hàng!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const lockCustomer = async (id: number, refreshDetail: () => void) => {
        if (!confirm("Bạn có chắc chắn muốn khóa tài khoản khách hàng này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/customers/${id}/lock`, {
                method: "POST",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể khóa tài khoản");
            }
            toast.success("Khóa tài khoản khách hàng thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            // Đồng bộ lại dữ liệu từ server
            await fetchCustomers(currentPage);
            // Nếu modal chi tiết đang mở, làm mới dữ liệu chi tiết
            if (selectedCustomerId === id.toString()) {
                refreshDetail();
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi khóa tài khoản khách hàng!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const unlockCustomer = async (id: number, refreshDetail: () => void) => {
        if (!confirm("Bạn có chắc chắn muốn mở khóa tài khoản khách hàng này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/customers/${id}/unlock`, {
                method: "POST",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể mở khóa tài khoản");
            }
            toast.success("Mở khóa tài khoản khách hàng thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            // Đồng bộ lại dữ liệu từ server
            await fetchCustomers(currentPage);
            // Nếu modal chi tiết đang mở, làm mới dữ liệu chi tiết
            if (selectedCustomerId === id.toString()) {
                refreshDetail();
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi mở khóa tài khoản khách hàng!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const deleteCustomer = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/customers/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể xóa khách hàng");
            }
            toast.success("Xóa khách hàng thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchCustomers(currentPage); // Tải lại danh sách sau khi xóa
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi xóa khách hàng!", {
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

    const refreshCustomers = () => {
        fetchCustomers(currentPage);
    };

    const columns: ColumnDef<Customer>[] = useMemo(
        () => [
            {
                accessorFn: (_row: Customer, index: number) => (currentPage - 1) * pageSize + index + 1,
                id: "stt",
                header: "STT",
                enableSorting: false,
            },
            {
                accessorKey: "customerID",
                header: "ID",
                enableSorting: true,
            },
            {
                accessorKey: "customerName",
                header: "Tên khách hàng",
                enableSorting: true,
            },
            {
                accessorKey: "contactName",
                header: "Tên liên hệ",
                enableSorting: true,
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
                accessorKey: "locked", // Đồng bộ với API response
                header: "Trạng thái",
                cell: ({ row }) => (row.original.locked ? "Đã khóa" : "Hoạt động"),
                enableSorting: true,
            },
            {
                id: "actions",
                header: "Hành động",
                cell: ({ row }) => (
                    <>
                        <Button onClick={() => setEditCustomer(row.original)}>Sửa</Button>
                        <Button
                            className="ml-2 bg-cyan-500 hover:bg-cyan-700"
                            onClick={() => setSelectedCustomerId(row.original.customerID.toString())}
                        >
                            Chi tiết
                        </Button>
                        {row.original.locked ? (
                            <Button
                                className="ml-2 bg-green-600 hover:bg-green-800"
                                onClick={() => unlockCustomer(row.original.customerID, refreshCustomers)}
                            >
                                Mở khóa
                            </Button>
                        ) : (
                            <Button
                                className="ml-2 bg-orange-600 hover:bg-orange-800"
                                onClick={() => lockCustomer(row.original.customerID, refreshCustomers)}
                            >
                                Khóa
                            </Button>
                        )}
                        {!row.original.locked && (
                            <Button
                                className="ml-2 bg-red-600 hover:bg-red-800"
                                onClick={() => deleteCustomer(row.original.customerID)}
                            >
                                Xóa
                            </Button>
                        )}
                    </>
                ),
                enableSorting: false,
            },
        ],
        [currentPage, pageSize]
    );

    const table = useReactTable({
        data: customers,
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
                        placeholder="Tìm kiếm khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)}>Thêm khách hàng</Button>
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>

            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Khách Hàng</h2>
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
                                    <TableCell colSpan={8} className="h-24 text-center">
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

            <CustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refreshCustomers}
            />

            <CustomerModal
                isOpen={!!editCustomer}
                onClose={() => setEditCustomer(undefined)}
                customer={editCustomer}
                onSuccess={refreshCustomers}
            />

            {selectedCustomerId && (
                <CustomerDetail
                    customerID={selectedCustomerId}
                    open={!!selectedCustomerId}
                    onClose={() => setSelectedCustomerId(null)}
                    setEditCustomer={setEditCustomer}
                    refreshCustomerList={refreshCustomers}
                />
            )}
        </main>
    );
}