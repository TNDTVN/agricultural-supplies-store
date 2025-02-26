"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProduct() {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
    });

    useEffect(() => {
        if (id) {
            fetch(`http://localhost:8080/api/products/${id}`)
                .then((res) => res.json())
                .then((data) => setProduct(data))
                .catch((err) => console.error("Lỗi khi lấy sản phẩm:", err));
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`http://localhost:8080/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });
        router.push("/admin/product");
    };

    return (
        <main className="p-4">
            <h2 className="text-xl font-semibold">Chỉnh sửa sản phẩm</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Tên sản phẩm" value={product.name} onChange={handleChange} />
                <Input name="description" placeholder="Mô tả" value={product.description} onChange={handleChange} />
                <Input name="price" type="number" placeholder="Giá" value={product.price} onChange={handleChange} />
                <Input name="imageUrl" placeholder="URL Hình ảnh" value={product.imageUrl} onChange={handleChange} />
                <Button type="submit">Cập nhật</Button>
            </form>
        </main>
    );
}
