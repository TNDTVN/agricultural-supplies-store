"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddProduct() {
    const router = useRouter();
    const [product, setProduct] = useState({
        productName: "",
        productDescription: "",
        unitPrice: 0,
        categoryID: 0,
        supplierID: 0,
        quantityPerUnit: "",
        unitsInStock: 0,
        unitsOnOrder: 0,
        discontinued: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setProduct({
            ...product,
            [name]: type === "number" ? Number(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch("http://localhost:8080/products/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            router.push("/admin/product");
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
        }
    };

    return (
        <main className="p-4">
            <h2 className="text-xl font-semibold">Thêm sản phẩm</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="productName" placeholder="Tên sản phẩm" value={product.productName} onChange={handleChange} />
                <Input name="productDescription" placeholder="Mô tả" value={product.productDescription} onChange={handleChange} />
                <Input name="unitPrice" type="number" placeholder="Giá" value={product.unitPrice} onChange={handleChange} />
                <Input name="categoryID" type="number" placeholder="ID Danh mục" value={product.categoryID} onChange={handleChange} />
                <Input name="supplierID" type="number" placeholder="ID Nhà cung cấp" value={product.supplierID} onChange={handleChange} />
                <Input name="quantityPerUnit" placeholder="Số lượng mỗi đơn vị" value={product.quantityPerUnit} onChange={handleChange} />
                <Input name="unitsInStock" type="number" placeholder="Số lượng tồn kho" value={product.unitsInStock} onChange={handleChange} />
                <Input name="unitsOnOrder" type="number" placeholder="Số lượng đặt hàng" value={product.unitsOnOrder} onChange={handleChange} />
                <div className="flex items-center space-x-2">
                    <label className="text-sm">Ngừng kinh doanh:</label>
                    <input
                        type="checkbox"
                        name="discontinued"
                        checked={product.discontinued}
                        onChange={(e) => setProduct({ ...product, discontinued: e.target.checked })} 
                    />
                </div>
                <Button type="submit">Thêm</Button>
            </form>
        </main>
    );
}
