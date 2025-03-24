"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Supplier } from "@/types/supplier";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier?: Supplier;
    onSuccess: () => void;
}

export function SupplierModal({ isOpen, onClose, supplier, onSuccess }: SupplierModalProps) {
    const isEdit = !!supplier;
    const [formData, setFormData] = useState<Partial<Supplier>>({
        supplierName: "",
        contactName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
        email: "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cập nhật formData khi supplier thay đổi (khi mở modal chỉnh sửa)
    useEffect(() => {
        if (supplier && isOpen) {
        setFormData({
            supplierName: supplier.supplierName || "",
            contactName: supplier.contactName || "",
            address: supplier.address || "",
            city: supplier.city || "",
            postalCode: supplier.postalCode || "",
            country: supplier.country || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
        });
        } else if (!supplier && isOpen) {
        // Reset form khi mở modal thêm mới
        setFormData({
            supplierName: "",
            contactName: "",
            address: "",
            city: "",
            postalCode: "",
            country: "",
            phone: "",
            email: "",
        });
        }
    }, [supplier, isOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
        const url = isEdit 
            ? `http://localhost:8080/suppliers/${supplier?.supplierID}`
            : "http://localhost:8080/suppliers";
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Không thể ${isEdit ? "cập nhật" : "thêm"} nhà cung cấp`);
        }

        alert(`${isEdit ? "Cập nhật" : "Thêm"} nhà cung cấp thành công!`);
        onSuccess();
        onClose();
        } catch (err) {
        const error = err as Error;
        setError(error.message);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>{isEdit ? "Chỉnh Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}</DialogTitle>
            </DialogHeader>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                <div>
                    <Label htmlFor="supplierName">Tên nhà cung cấp</Label>
                    <Input
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName || ""}
                    onChange={handleChange}
                    placeholder="Nhập tên nhà cung cấp"
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="contactName">Người liên hệ</Label>
                    <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName || ""}
                    onChange={handleChange}
                    placeholder="Nhập tên người liên hệ"
                    />
                </div>
                <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    />
                </div>
                <div>
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder="Nhập thành phố"
                    />
                </div>
                </div>
                <div className="space-y-4">
                <div>
                    <Label htmlFor="postalCode">Mã bưu điện</Label>
                    <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode || ""}
                    onChange={handleChange}
                    placeholder="Nhập mã bưu điện"
                    />
                </div>
                <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                    id="country"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    placeholder="Nhập quốc gia"
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    />
                </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                Hủy
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
}