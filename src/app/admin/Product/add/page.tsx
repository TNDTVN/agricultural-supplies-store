"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState<{ categoryID: number; categoryName: string }[]>([]);
    const [suppliers, setSuppliers] = useState<{ supplierID: number; supplierName: string }[]>([]);

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

        fetchCategories();
        fetchSuppliers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setProduct({
        ...product,
        [name]: type === "number" ? Number(value) : value,
        });
    };

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageNames, setImageNames] = useState<string[]>([]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
        const files = Array.from(event.target.files);
        setImages(files);
        // Tạo URL preview cho từng ảnh
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
        }
    };

    useEffect(() => {
        return () => {
        imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [imagePreviews]);

    const uploadImages = async (): Promise<string[] | null> => {
        if (images.length === 0) return null;

        const formData = new FormData();
        images.forEach((image) => formData.append("files", image));

        try {
        const response = await fetch("http://localhost:8080/images/upload-multiple", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const fileNames: string[] = await response.json();
            setImageNames(fileNames);
            return fileNames;
        } else {
            alert("Lỗi khi upload ảnh!");
            return null;
        }
        } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        return null;
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        const uploadedImageNames = await uploadImages();
        if (!uploadedImageNames || uploadedImageNames.length === 0) {
            alert("Vui lòng chọn ít nhất một ảnh!");
            setIsLoading(false);
            return;
        }

    const newProduct = { ...product, imageNames: uploadedImageNames };

    try {
        const response = await fetch("http://localhost:8080/products/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct),
        });

        if (response.ok) {
            router.push("/admin/product");
        } else {
            alert("Lỗi khi thêm sản phẩm!");
        }
        } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="p-4">
        <h1 className="text-3xl text-center font-semibold">Thêm Sản Phẩm</h1>
        <div className="rounded-md border border-gray-300 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột trái */}
                <div className="space-y-4">
                <div>
                    <label className="block font-medium">Tên sản phẩm:</label>
                    <Input
                    name="productName"
                    placeholder="Tên sản phẩm"
                    value={product.productName}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Mô tả:</label>
                    <Input
                    name="productDescription"
                    placeholder="Mô tả"
                    value={product.productDescription}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Giá:</label>
                    <Input
                    name="unitPrice"
                    type="number"
                    placeholder="Giá"
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
                    <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
                    {imagePreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {imagePreviews.map((preview, index) => (
                        <img
                            key={index}
                            src={preview}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded-md"
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
                    placeholder="Số lượng mỗi đơn vị"
                    value={product.quantityPerUnit}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Số lượng tồn kho:</label>
                    <Input
                    name="unitsInStock"
                    type="number"
                    placeholder="Số lượng tồn kho"
                    value={product.unitsInStock}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block font-medium">Số lượng đặt hàng:</label>
                    <Input
                    name="unitsOnOrder"
                    type="number"
                    placeholder="Số lượng đặt hàng"
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
                {isLoading ? "Đang xử lý..." : "Thêm"}
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