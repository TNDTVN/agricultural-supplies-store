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
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify"; // Import react-toastify

interface Category {
    categoryID: number;
    categoryName: string;
    description?: string;
}

const ColumnVisibilityToggle = ({
    table,
}: {
    table: ReturnType<typeof useReactTable<Category>>;
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
                    <DropdownMenuItem key={size} onClick={() => setPageSize(size)}>
                        {size}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function CategoryIndex() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "detail">("add");
    const [selectedCategory, setSelectedCategory] = useState<Partial<Category>>({
        categoryName: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage, sorting, pageSize]);

    const fetchCategories = async (page: number) => {
        try {
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/categories?page=${page}&size=${pageSize}${sortParam}`
            );
            const data = await response.json();
            setCategories(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                fetchCategories(1);
                setCurrentPage(1);
                return;
            }
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/categories/search?keyword=${encodeURIComponent(
                    searchTerm
                )}&page=1&size=${pageSize}${sortParam}`
            );
            const data = await response.json();
            setCategories(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching categories:", error);
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa loại sản phẩm này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/categories/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorText = await response.text();
                toast.error(errorText || "Không thể xóa loại sản phẩm!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }
            toast.success("Xóa loại sản phẩm thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchCategories(currentPage);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi xóa loại sản phẩm!", {
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

    const openModal = (mode: "add" | "edit" | "detail", category?: Category) => {
        setModalMode(mode);
        setSelectedCategory(
            mode === "add"
                ? { categoryName: "", description: "" }
                : category || { categoryName: "", description: "" }
        );
        setIsModalOpen(true);
        setError(null);
    };

    const handleModalSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const url =
                modalMode === "add"
                    ? "http://localhost:8080/categories"
                    : `http://localhost:8080/categories/${selectedCategory.categoryID}`;
            const method = modalMode === "add" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedCategory),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể lưu loại sản phẩm");
            }

            toast.success(
                modalMode === "add"
                    ? "Thêm loại sản phẩm thành công!"
                    : "Cập nhật loại sản phẩm thành công!",
                {
                    position: "top-right",
                    autoClose: 3000,
                }
            );
            fetchCategories(currentPage);
            setIsModalOpen(false);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            toast.error(`Có lỗi xảy ra: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const columns: ColumnDef<Category>[] = useMemo(
        () => [
            {
                accessorFn: (_row: Category, index: number) =>
                    (currentPage - 1) * pageSize + index + 1,
                id: "stt",
                header: "STT",
                enableSorting: false,
            },
            {
                accessorKey: "categoryID",
                header: "ID",
                enableSorting: true,
            },
            {
                accessorKey: "categoryName",
                header: "Tên loại",
                enableSorting: true,
            },
            {
                accessorKey: "description",
                header: "Mô tả",
                cell: ({ row }) => row.original.description || "Không có mô tả",
                enableSorting: false,
            },
            {
                id: "actions",
                header: "Hành động",
                cell: ({ row }) => (
                    <>
                        <Button onClick={() => openModal("edit", row.original)}>Sửa</Button>
                        <Button
                            className="ml-2 bg-cyan-500 hover:bg-cyan-700"
                            onClick={() => openModal("detail", row.original)}
                        >
                            Chi tiết
                        </Button>
                        <Button
                            className="ml-2 bg-red-600 hover:bg-red-800"
                            onClick={() => deleteCategory(row.original.categoryID)}
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
        data: categories,
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
                        placeholder="Tìm kiếm loại sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openModal("add")}>Thêm loại sản phẩm</Button>
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>

            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">
                    Danh Sách Loại Sản Phẩm
                </h2>
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
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
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

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === "add"
                                ? "Thêm Loại Sản Phẩm"
                                : modalMode === "edit"
                                ? "Sửa Loại Sản Phẩm"
                                : "Chi Tiết Loại Sản Phẩm"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {error && <div className="text-red-500">{error}</div>}
                        <div>
                            <label className="block font-semibold">Tên loại sản phẩm</label>
                            {modalMode === "detail" ? (
                                <p className="text-gray-800 font-medium">
                                    {selectedCategory.categoryName || "Không có dữ liệu"}
                                </p>
                            ) : (
                                <Input
                                    value={selectedCategory.categoryName || ""}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setSelectedCategory({
                                            ...selectedCategory,
                                            categoryName: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tên loại sản phẩm"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block font-semibold">Mô tả</label>
                            {modalMode === "detail" ? (
                                <p className="text-gray-800 font-medium">
                                    {selectedCategory.description || "Không có mô tả"}
                                </p>
                            ) : (
                                <Input
                                    value={selectedCategory.description || ""}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setSelectedCategory({
                                            ...selectedCategory,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập mô tả (không bắt buộc)"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        {modalMode !== "detail" && (
                            <Button
                                onClick={handleModalSubmit}
                                disabled={isLoading || !selectedCategory.categoryName?.trim()}
                            >
                                {isLoading
                                    ? "Đang xử lý..."
                                    : modalMode === "add"
                                    ? "Thêm"
                                    : "Cập nhật"}
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            {modalMode === "detail" ? "Đóng" : "Hủy"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}