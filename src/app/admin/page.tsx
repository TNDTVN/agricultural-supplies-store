"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

export default function HomeAdmim() {
    const [products, setProducts] = useState<Product[]>([]);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/products");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);
    return (
        <main className="p-4">
        <div className="mb-4 flex justify-between">
            <div className="w-1/2 flex items-center space-x-2">
            <Input placeholder="Tìm kiếm sản phẩm..." className="flex-1" />
            <Button>Tìm</Button>
            </div>
            <Button>Thêm sản phẩm</Button>
        </div>
                <div className="mt-6">
                    <h2 className="mb-2 text-xl font-semibold">Đơn hàng gần đây</h2>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Giới thiệu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell> {product.price.toLocaleString()} VND</TableCell>
                            <TableCell className="text-green-600">{product.description}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
        </main>
    );
}
