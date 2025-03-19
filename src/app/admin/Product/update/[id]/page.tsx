"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProduct() {
    const router = useRouter();
    const { id } = useParams();

    const [categories, setCategories] = useState<{ categoryID: number; categoryName: string }[]>([]);
    const [suppliers, setSuppliers] = useState<{ supplierID: number; supplierName: string }[]>([]);
    const [selectedImage, setSelectedImage] = useState<File[]>([]);
    const [product, setProduct] = useState({
    productID: 0,
    productName: "",
    productDescription: "",
    unitPrice: 0,
    categoryID: 0,
    supplierID: 0,
    quantityPerUnit: "",
    unitsInStock: 0,
    unitsOnOrder: 0,
    discontinued: false,
    imageUrl: "",
    });
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:8080/categories/all");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
        };

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("http://localhost:8080/suppliers/all");
            const data = await res.json();
            setSuppliers(data);
        } catch (error) {
            console.error("Lỗi khi tải nhà cung cấp:", error);
        }
        };

    const fetchProduct = async () => {
        try {
            const res = await fetch(`http://localhost:8080/products/${id}`);
            const data = await res.json();
            setProduct(data);
            if (data.images && data.images.length > 0) {
            setPreviewImages(
                data.images.map((img: { imageName: string }) => `http://localhost:8080/images/${img.imageName}`)
            );
            }
        } catch (err) {
            console.error("Lỗi khi lấy sản phẩm:", err);
        }
        };

        fetchCategories();
        fetchSuppliers();
        if (id) fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setProduct({
        ...product,
        [name]: type === "number" ? Number(value) : value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
        const validFiles = Array.from(files).filter((file) => {
            if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, etc.).");
            return false;
            }
            if (file.size > 5 * 1024 * 1024) {
            alert("Kích thước file ảnh không được vượt quá 5MB.");
            return false;
            }
            return true;
        });

        setSelectedImage(validFiles);
        setPreviewImages(validFiles.map((file) => URL.createObjectURL(file)));
        }
    };

    useEffect(() => {
        return () => {
        previewImages.forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [previewImages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
        let imageNames = product.imageUrl ? [product.imageUrl] : [];

        if (selectedImage.length > 0) {
            const formData = new FormData();
            selectedImage.forEach((file) => formData.append("files", file));
            const uploadRes = await fetch("http://localhost:8080/images/upload-multiple", {
            method: "POST",
            body: formData,
            });

            if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            throw new Error(`Upload failed: ${errorText}`);
            }

            imageNames = await uploadRes.json();
        }

        const productData = {
            productName: product.productName,
            productDescription: product.productDescription,
            unitPrice: product.unitPrice,
            categoryID: product.categoryID,
            supplierID: product.supplierID,
            quantityPerUnit: product.quantityPerUnit,
            unitsInStock: product.unitsInStock,
            unitsOnOrder: product.unitsOnOrder,
            discontinued: product.discontinued,
            imageNames: imageNames,
        };

        const updateRes = await fetch(`http://localhost:8080/products/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            throw new Error(`Update failed: ${errorText}`);
        }

        router.push("/admin/product");
        } catch (error: any) {
        console.error("Error:", error);
        setError(error.message || "Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.");
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <h1 className="text-3xl text-center font-semibold">Chỉnh Sửa Sản Phẩm</h1>
        <div className="rounded-md border border-gray-300 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột trái */}
                <div className="space-y-4">
                <div>
                    <label className="block font-medium">Tên sản phẩm:</label>
                    <Input
                    name="productName"
                    value={product.productName}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Mô tả:</label>
                    <Input
                    name="productDescription"
                    value={product.productDescription}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Giá:</label>
                    <Input
                    name="unitPrice"
                    type="number"
                    value={product.unitPrice}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Danh mục:</label>
                    <select
                    name="categoryID"
                    value={product.categoryID}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                    >
                    <option value="0">Chọn danh mục</option>
                    {categories.map((category) => (
                        <option key={category.categoryID} value={category.categoryID}>
                        {category.categoryName}
                        </option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium">Ảnh sản phẩm:</label>
                    <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="mt-2"
                    />
                    {previewImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {previewImages.map((imgSrc, index) => (
                        <Image
                            key={index}
                            src={imgSrc}
                            alt={`Ảnh ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded"
                        />
                        ))}
                    </div>
                    )}
                </div>
                </div>
                {/* Cột phải */}
                <div className="space-y-4">
                <div>
                    <label className="block font-medium">Số lượng mỗi đơn vị:</label>
                    <Input
                    name="quantityPerUnit"
                    value={product.quantityPerUnit}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Số lượng tồn kho:</label>
                    <Input
                    name="unitsInStock"
                    type="number"
                    value={product.unitsInStock}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Số lượng đặt hàng:</label>
                    <Input
                    name="unitsOnOrder"
                    type="number"
                    value={product.unitsOnOrder}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Nhà cung cấp:</label>
                    <select
                    name="supplierID"
                    value={product.supplierID}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                    >
                    <option value="0">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.supplierID} value={supplier.supplierID}>
                        {supplier.supplierName}
                        </option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium">Ngừng kinh doanh:</label>
                    <div className="flex mt-2 items-center space-x-2">
                    <input
                        type="checkbox"
                        name="discontinued"
                        checked={product.discontinued}
                        onChange={(e) => setProduct({ ...product, discontinued: e.target.checked })}
                        className="h-4 w-4"
                    />
                    <span className="text-sm">Có</span>
                    </div>
                </div>
                </div>
            </div>
            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Cập nhật"}
                </Button>
                <Link
                href={"/admin/product"}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-gray-200 border rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                Trở về
                </Link>
            </div>
            </form>
        </div>
        </main>
    );
}