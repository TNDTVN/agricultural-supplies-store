"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [product, setProduct] = useState<any>(null);
    const [category, setCategory] = useState<string>("");
    const [supplier, setSupplier] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
        fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/products/${id}`);
        if (!response.ok) throw new Error("Không thể lấy thông tin sản phẩm");
        const productData = await response.json();
        setProduct(productData);

        const categoryRes = await fetch(`http://localhost:8080/categories/${productData.categoryID}`);
        if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            setCategory(categoryData.categoryName);
        }

        const supplierRes = await fetch(`http://localhost:8080/suppliers/${productData.supplierID}`);
        if (supplierRes.ok) {
            const supplierData = await supplierRes.json();
            setSupplier(supplierData.supplierName);
        }
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    if (loading) {
        return (
        <main className="p-4">
            <div className="text-center">Đang tải...</div>
        </main>
        );
    }

    if (error || !product) {
        return (
        <main className="p-4">
            <div className="text-center text-red-500">
            {error || "Không tìm thấy sản phẩm"}
            </div>
            <div className="mt-4 text-center">
            <Button onClick={() => router.push("/admin/product")}>
                Quay lại danh sách
            </Button>
            </div>
        </main>
        );
    }

    return (
        <main className="p-4 rounded-md border">
        <h1 className="text-3xl text-center font-semibold mb-6">
            Chi Tiết Sản Phẩm
        </h1>
        <div className="rounded-md border border-gray-300 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cơ bản (bên trái) */}
            <div className="space-y-4">
                <div>
                <Label className="font-semibold">ID Sản phẩm</Label>
                <p>{product.productID}</p>
                </div>
                <div>
                <Label className="font-semibold">Tên sản phẩm</Label>
                <p>{product.productName}</p>
                </div>
                <div>
                <Label className="font-semibold">Mô tả</Label>
                <p>{product.productDescription || "Không có mô tả"}</p>
                </div>
                <div>
                <Label className="font-semibold">Giá</Label>
                <p>{product.unitPrice.toLocaleString()} VND</p>
                </div>
                <div>
                <Label className="font-semibold">Danh mục</Label>
                <p>{category || "Không xác định"}</p>
                </div>
                <div>
                <Label className="font-semibold">Nhà cung cấp</Label>
                <p>{supplier || "Không xác định"}</p>
                </div>
            </div>

            {/* Ảnh và thông tin bổ sung (bên phải) */}
            <div className="space-y-4">
                <div>
                <Label className="font-semibold">Ảnh sản phẩm</Label>
                {product.images && product.images.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-4">
                    {product.images.map((img: { imageName: string }, index: number) => (
                        <Image
                        key={index}
                        src={`http://localhost:8080/images/${img.imageName}`}
                        alt={`Ảnh ${index + 1}`}
                        width={150}
                        height={150}
                        className="object-cover rounded-md border"
                        />
                    ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Chưa có ảnh sản phẩm</p>
                )}
                </div>
                {/* Thông tin bổ sung hiển thị ngang */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="font-semibold">Số lượng mỗi đơn vị</Label>
                    <p>{product.quantityPerUnit || "Không xác định"}</p>
                </div>
                <div>
                    <Label className="font-semibold">Số lượng tồn kho</Label>
                    <p>{product.unitsInStock}</p>
                </div>
                <div>
                    <Label className="font-semibold">Số lượng đặt hàng</Label>
                    <p>{product.unitsOnOrder}</p>
                </div>
                <div>
                    <Label className="font-semibold">Trạng thái</Label>
                    <p
                    className={
                        product.discontinued ? "text-red-500" : "text-green-500"
                    }
                    >
                    {product.discontinued ? "Ngừng kinh doanh" : "Đang kinh doanh"}
                    </p>
                </div>
                </div>
            </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 flex space-x-4 justify-center">
            <Button
                onClick={() => router.push(`/admin/product/update/${product.productID}`)}
            >
                Chỉnh sửa
            </Button>
            <Link
                href="/admin/product"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-gray-200 border rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                Trở về
            </Link>
            </div>
        </div>
        </main>
    );
}