"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Import toast

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "add" | "edit" | "detail";
    product?: Product;
    onSave?: () => void;
}

export default function ProductModal({ isOpen, onClose, mode, product, onSave }: ProductModalProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Product>({
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
        images: [],
    });
    const [categories, setCategories] = useState<{ categoryID: number; categoryName: string }[]>([]);
    const [suppliers, setSuppliers] = useState<{ supplierID: number; supplierName: string }[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMode, setCurrentMode] = useState<"add" | "edit" | "detail">(mode);

    useEffect(() => {
        if (isOpen) {
            setCurrentMode(mode);
            fetchCategories();
            fetchSuppliers();
            if (mode !== "add" && product) {
                setFormData({
                    ...product,
                    productDescription: product.productDescription || "",
                    quantityPerUnit: product.quantityPerUnit || "",
                    images: product.images || [],
                });
                if (product.images) {
                    setPreviewImages(product.images.map(img => `http://localhost:8080/images/${img.imageName}`));
                }
            } else {
                resetForm();
            }
        }
    }, [isOpen, mode, product]);

    const fetchCategories = async () => {
        const res = await fetch("http://localhost:8080/categories/all");
        const data = await res.json();
        setCategories(data);
    };

    const fetchSuppliers = async () => {
        const res = await fetch("http://localhost:8080/suppliers/all");
        const data = await res.json();
        setSuppliers(data);
    };

    const resetForm = () => {
        setFormData({
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
            images: [],
        });
        setSelectedImages([]);
        setPreviewImages([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const validFiles = Array.from(files).filter(file => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
            setSelectedImages(validFiles);
            setPreviewImages(validFiles.map(file => URL.createObjectURL(file)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let imageNames: string[] = [];
            if (currentMode === "edit" && product?.images) {
                imageNames = product.images.map(img => img.imageName);
            }

            if (selectedImages.length > 0) {
                const formData = new FormData();
                selectedImages.forEach(file => formData.append("files", file));
                const uploadRes = await fetch("http://localhost:8080/images/upload-multiple", {
                    method: "POST",
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error("Failed to upload images");
                imageNames = await uploadRes.json();
            }

            const productData = {
                ...formData,
                imageNames,
            };
            const url = currentMode === "add"
                ? "http://localhost:8080/products/add"
                : `http://localhost:8080/products/update/${product?.productID}`;
            const method = currentMode === "add" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error("Failed to save product");

            // Hiển thị thông báo thành công
            toast.success(currentMode === "add" ? "Thêm sản phẩm thành công!" : "Cập nhật sản phẩm thành công!", {
                position: "top-right",
                autoClose: 3000,
            });

            onSave?.();
            onClose();
        } catch (err) {
            setError((err as Error).message);
            toast.error("Có lỗi xảy ra: " + (err as Error).message, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const switchToEditMode = () => {
        setCurrentMode("edit");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    {currentMode === "add" ? "Thêm Sản Phẩm" : currentMode === "edit" ? "Sửa Sản Phẩm" : "Chi Tiết Sản Phẩm"}
                </h2>
                {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {currentMode === "detail" && (
                                <div>
                                    <Label className="font-medium">ID Sản phẩm</Label>
                                    <p className="text-gray-700">{formData.productID}</p>
                                </div>
                            )}
                            <div>
                                <Label className="font-medium">Tên sản phẩm</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.productName}</p>
                                ) : (
                                    <Input name="productName" value={formData.productName} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Mô tả</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.productDescription || "Không có"}</p>
                                ) : (
                                    <Input name="productDescription" value={formData.productDescription || ""} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Giá</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.unitPrice.toLocaleString()} VND</p>
                                ) : (
                                    <Input name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Danh mục</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{categories.find(c => c.categoryID === formData.categoryID)?.categoryName || "Không xác định"}</p>
                                ) : (
                                    <select name="categoryID" value={formData.categoryID} onChange={handleChange} className="p-2 border rounded w-full border-gray-300 focus:border-blue-500">
                                        <option value={0}>Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {currentMode !== "detail" && (
                                <div>
                                    <Label className="font-medium">Ảnh sản phẩm</Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={currentMode !== "add" && currentMode !== "edit"}
                                        className="border-gray-300"
                                    />
                                    {previewImages.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {previewImages.map((src, index) => (
                                                <Image key={index} src={src} alt={`Preview ${index}`} width={80} height={80} className="object-cover rounded shadow-sm" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="font-medium">Số lượng mỗi đơn vị</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.quantityPerUnit || "Không xác định"}</p>
                                ) : (
                                    <Input name="quantityPerUnit" value={formData.quantityPerUnit || ""} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Số lượng tồn kho</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.unitsInStock}</p>
                                ) : (
                                    <Input name="unitsInStock" type="number" value={formData.unitsInStock} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Số lượng đặt hàng</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{formData.unitsOnOrder}</p>
                                ) : (
                                    <Input name="unitsOnOrder" type="number" value={formData.unitsOnOrder} onChange={handleChange} className="border-gray-300 focus:border-blue-500" />
                                )}
                            </div>
                            <div>
                                <Label className="font-medium">Nhà cung cấp</Label>
                                {currentMode === "detail" ? (
                                    <p className="text-gray-700">{suppliers.find(s => s.supplierID === formData.supplierID)?.supplierName || "Không xác định"}</p>
                                ) : (
                                    <select name="supplierID" value={formData.supplierID} onChange={handleChange} className="p-2 border rounded w-full border-gray-300 focus:border-blue-500">
                                        <option value={0}>Chọn nhà cung cấp</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.supplierID} value={sup.supplierID}>{sup.supplierName}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {currentMode !== "add" && (
                                <div>
                                    <Label className="font-medium">Ngừng kinh doanh</Label>
                                    {currentMode === "detail" ? (
                                    <p className={formData.discontinued ? "text-red-500" : "text-green-500"}>
                                        {formData.discontinued ? "Ngừng kinh doanh" : "Đang kinh doanh"}
                                    </p>
                                    ) : (
                                    <input
                                        type="checkbox"
                                        name="discontinued"
                                        checked={formData.discontinued}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discontinued: e.target.checked }))}
                                        className="mt-1"
                                    />
                                    )}
                                </div>
                            )}
                            {currentMode === "detail" && previewImages.length > 0 && (
                                <div>
                                    <Label className="font-medium">Ảnh sản phẩm</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {previewImages.map((src, index) => (
                                            <Image key={index} src={src} alt={`Image ${index}`} width={80} height={80} className="object-cover rounded shadow-sm" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        {currentMode !== "detail" && (
                            <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                                {isLoading ? "Đang xử lý..." : currentMode === "add" ? "Thêm" : "Cập nhật"}
                            </Button>
                        )}
                        {currentMode === "detail" && (
                            <Button onClick={switchToEditMode} className="bg-blue-500 hover:bg-blue-600">
                                Chỉnh sửa
                            </Button>
                        )}
                        <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-100">Đóng</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}