"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ProductModal from "./ProductModal"; // Import modal

const ColumnVisibilityToggle = ({ table }: { table: ReturnType<typeof useReactTable<Product>> }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">Cột <ChevronDown className="ml-2 h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={value => column.toggleVisibility(!!value)}>
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

export default function ProductIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "detail">("add");
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    useEffect(() => { fetchProducts(currentPage); }, [currentPage, sorting, pageSize]);

    const fetchProducts = async (page: number) => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const response = await fetch(`http://localhost:8080/products?page=${page}&size=${pageSize}${sortParam}`);
        const data = await response.json();
        setProducts(data.content);
        setTotalPages(data.totalPages);
    };

    const handleSearch = async () => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const url = searchTerm.trim()
            ? `http://localhost:8080/products/search?keyword=${encodeURIComponent(searchTerm)}&page=1&size=${pageSize}${sortParam}`
            : `http://localhost:8080/products?page=1&size=${pageSize}${sortParam}`;
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setCurrentPage(1);
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
        try {
            const response = await fetch(`http://localhost:8080/products/delete/${id}`, { method: "DELETE" });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Không thể xóa sản phẩm");
            }
    
            toast.success("Xóa sản phẩm thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
    
            fetchProducts(currentPage);
        } catch (error) {
            toast.error((error as Error).message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const openModal = (mode: "add" | "edit" | "detail", product?: Product) => {
        setModalMode(mode);
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const columns: ColumnDef<Product>[] = useMemo(() => [
        { accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1, id: "stt", header: "STT", enableSorting: false },
        { accessorKey: "productID", header: "ID", enableSorting: true },
        { accessorKey: "productName", header: "Tên sản phẩm", enableSorting: true },
        { accessorKey: "unitPrice", header: "Giá", cell: ({ row }) => `${row.original.unitPrice.toLocaleString()} VND`, enableSorting: true },
        {
            accessorKey: "productDescription",
            header: "Mô tả",
            cell: ({ row }) => {
                const description = row.original.productDescription || "Không có mô tả";
                const maxLength = 50;
                const truncated = description.length > maxLength
                ? description.substring(0, maxLength) + "..."
                : description;
                return (
                <div title={description} className="truncate">
                    {truncated}
                </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <>
                    <Button onClick={() => openModal("edit", row.original)}>Sửa</Button>
                    <Button className="ml-2 bg-cyan-500 hover:bg-cyan-700" onClick={() => openModal("detail", row.original)}>Chi tiết</Button>
                    <Button className="ml-2 bg-red-600" onClick={() => deleteProduct(row.original.productID)}>Xóa</Button>
                </>
            ),
            enableSorting: false,
        },
    ], [currentPage, pageSize]);

    const table = useReactTable({ data: products, columns, state: { sorting, columnVisibility }, onSortingChange: setSorting, onColumnVisibilityChange: setColumnVisibility, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openModal("add")}>Thêm sản phẩm</Button>
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>
            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Sản Phẩm</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined} className={`${header.column.getCanSort() ? "cursor-pointer" : ""} ${header.column.getIsSorted() ? "bg-blue-100 text-blue-700" : header.column.getCanSort() ? "hover:bg-gray-100" : ""}`}>
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
                            {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Không có dữ liệu</TableCell></TableRow>
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
            <ProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                product={selectedProduct}
                onSave={() => fetchProducts(currentPage)}
            />
        </main>
    );
}