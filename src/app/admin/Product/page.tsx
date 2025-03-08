"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); // Số sản phẩm mỗi trang
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async (page: number) => {
        try {
            const response = await fetch(`http://localhost:8080/products?page=${page}&size=${pageSize}`);
            const data = await response.json();
            setProducts(data.content); // Giả sử API trả về object với content và totalPages
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                fetchProducts(1);
                return;
            }
            const response = await fetch(
                `http://localhost:8080/products/search?keyword=${encodeURIComponent(searchTerm)}&page=1&size=${pageSize}`
            );
            const data = await response.json();
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching products:", error);
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/products/delete/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete product");
            fetchProducts(currentPage);
            alert("Xóa sản phẩm thành công!");
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm!");
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
                        placeholder="Tìm kiếm sản phẩm..."
                        className="flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <Button onClick={() => router.push("/admin/product/add")}>Thêm sản phẩm</Button>
            </div>
            <div className="mt-6">
                <h2 className="mb-2 text-xl font-semibold">Danh sách sản phẩm</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.productID}>
                                <TableCell>{product.productID}</TableCell>
                                <TableCell>{product.productName}</TableCell>
                                <TableCell>{product.unitPrice.toLocaleString()} VND</TableCell>
                                <TableCell>{product.productDescription || "Không có mô tả"}</TableCell>
                                <TableCell>
                                    <Button onClick={() => router.push(`/admin/product/update/${product.productID}`)}>
                                        Sửa
                                    </Button>
                                    <Button onClick={() => deleteProduct(product.productID)} className="ml-2 bg-red-600">
                                        Xóa
                                    </Button>
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