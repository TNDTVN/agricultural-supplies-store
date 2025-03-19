"use client";

import { Button } from "@/components/ui/button";
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
import { Account } from "@/types/account";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    Row,
    SortDirection,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => (
    <div className="mt-4 flex justify-between items-center">
        <Button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
        >
            Trang trước
        </Button>
        <span>
            Trang {currentPage} / {totalPages}
        </span>
        <Button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
        >
            Trang sau
        </Button>
    </div>
);

// Reusable Column Visibility Toggle
const ColumnVisibilityToggle = ({
    table,
}: {
    table: ReturnType<typeof useReactTable<Account>>;
}) => (
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

const PageSizeSelector = ({
    pageSize,
    setPageSize,
}: {
    pageSize: number;
    setPageSize: (size: number) => void;
}) => {
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
                    <DropdownMenuItem
                        key={size}
                        onClick={() => setPageSize(size)}
                    >
                        {size}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function AccountIndex() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const router = useRouter();

    useEffect(() => {
        fetchAccounts(currentPage);
    }, [currentPage, sorting, pageSize]);

    const fetchAccounts = async (page: number) => {
        try {
            const sortParam = sorting.length > 0
                ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}`
                : '';
            const response = await fetch(
                `http://localhost:8080/accounts?page=${page}&size=${pageSize}${sortParam}`
            );
            if (!response.ok) throw new Error("Không thể lấy danh sách tài khoản");
            const data = await response.json();
            setAccounts(data.content);
            setTotalPages(data.totalPages);
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
            const sortParam = sorting.length > 0
                ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}`
                : '';
            const response = await fetch(
                `http://localhost:8080/accounts/search?username=${encodeURIComponent(
                    searchTerm
                )}&page=1&size=${pageSize}${sortParam}`
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
            if (!response.ok) throw new Error("Không thể khóa tài khoản");
            fetchAccounts(currentPage);
        } catch (error) {
            console.error("Error locking account:", error);
            alert(error);
        }
    };

    const unlockAccount = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn mở khóa tài khoản này?")) return;
        try {
            const response = await fetch(
                `http://localhost:8080/accounts/${id}/unlock`,
                {
                    method: "PUT",
                }
            );
            if (!response.ok) throw new Error("Không thể mở khóa tài khoản");
            fetchAccounts(currentPage);
        } catch (error) {
            console.error("Error unlocking account:", error);
            alert(error);
        }
    };

    const columns: ColumnDef<Account>[] = useMemo(
        () => [
            {
                accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1, // Tính STT
                id: "stt",
                header: "STT",
                enableSorting: false,
            },
            {
                accessorKey: "accountID",
                header: "ID",
                enableSorting: true,
            },
            {
                accessorKey: "username",
                header: "Tên đăng nhập",
                enableSorting: true,
                filterFn: "includesString",
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
            },
            {
                accessorKey: "role",
                header: "Vai trò",
                enableSorting: false,
            },
            {
                accessorKey: "locked",
                header: "Trạng thái",
                cell: ({ row }) => (row.original.locked ? "Đã khóa" : "Hoạt động"),
                enableSorting: false,
            },
            {
                id: "actions",
                header: "Hành động",
                cell: ({ row }) => {
                    const account = row.original;
                    return (
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    router.push(`/admin/account/edit/${account.accountID}`)
                                }
                            >
                                Sửa
                            </Button>
                            <Button
                                className="ml-2 bg-cyan-500 hover:bg-cyan-700"
                                onClick={() => router.push(`/admin/account/detail/${account.accountID}`)}>
                                Chi tiết
                            </Button>
                            {!account.locked && account.role !== "ADMIN" && (
                                <Button
                                    onClick={() => lockAccount(account.accountID)}
                                    className="bg-orange-600"
                                >
                                    Khóa
                                </Button>
                            )}
                            {account.locked && (
                                <Button
                                    onClick={() => unlockAccount(account.accountID)}
                                    className="bg-green-600"
                                >
                                    Mở khóa
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [currentPage, pageSize] // Thêm dependency để STT cập nhật khi pageSize hoặc currentPage thay đổi
    );

    const table = useReactTable({
        data: accounts,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input
                        placeholder="Tìm kiếm tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push("/admin/account/add")}>
                        Thêm tài khoản
                    </Button>
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>

            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Tài Khoản</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isSorted = header.column.getIsSorted() as SortDirection | false;
                                        const isSortable = header.column.getCanSort();
                                        return (
                                            <TableHead
                                                key={header.id}
                                                onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                                                className={`${isSortable ? "cursor-pointer" : ""} ${
                                                    isSorted ? "bg-blue-100 text-blue-700" : isSortable ? "hover:bg-gray-100" : ""
                                                }`}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div className="flex items-center">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {isSortable && <ArrowUpDown className="ml-2 h-4 w-4" />}
                                                    </div>
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row: Row<Account>) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 space-y-2">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </main>
    );
}