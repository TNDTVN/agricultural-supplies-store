"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeAdmin() {
    const [products, setProducts] = useState<Product[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/products");
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await fetch(`http://localhost:8080/api/products/${id}`, { method: "DELETE" });
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input placeholder="Tìm kiếm sản phẩm..." className="flex-1" />
                    <Button>Tìm</Button>
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
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.price.toLocaleString()} VND</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>
                                    <Button onClick={() => router.push(`/admin/product/edit/${product.id}`)}>Sửa</Button>
                                    <Button onClick={() => deleteProduct(product.id)} className="ml-2 bg-red-600">Xóa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
}
