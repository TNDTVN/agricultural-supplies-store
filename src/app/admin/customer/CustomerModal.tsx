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
import { Customer } from "@/types/customer"; // Giả sử bạn có type Customer
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface CustomerModalProps {
    isOpen: boolean; // Sửa từ booleancamera thành boolean
    onClose: () => void;
    customer?: Customer;
    onSuccess: () => void;
}

export function CustomerModal({ isOpen, onClose, customer, onSuccess }: CustomerModalProps) {
    const isEdit = !!customer;
    const [formData, setFormData] = useState<Partial<Customer & { username: string }>>({
        customerName: "",
        contactName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
        email: "",
        username: "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    useEffect(() => {
        if (customer && isOpen) {
            setFormData({
                customerName: customer.customerName || "",
                contactName: customer.contactName || "",
                address: customer.address || "",
                city: customer.city || "",
                postalCode: customer.postalCode || "",
                country: customer.country || "",
                phone: customer.phone || "",
                email: customer.email || "",
                username: "",
            });
        } else if (!customer && isOpen) {
            setFormData({
                customerName: "",
                contactName: "",
                address: "",
                city: "",
                postalCode: "",
                country: "",
                phone: "",
                email: "",
                username: "",
            });
        }
    }, [customer, isOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = isEdit
                ? `http://localhost:8080/customers/${customer?.customerID}`
                : "http://localhost:8080/customers";
            const method = isEdit ? "PUT" : "POST";

            let payload;
            if (isEdit) {
                payload = {
                    customerName: formData.customerName,
                    contactName: formData.contactName || undefined,
                    address: formData.address || undefined,
                    city: formData.city || undefined,
                    postalCode: formData.postalCode || undefined,
                    country: formData.country || undefined,
                    phone: formData.phone || undefined,
                    email: formData.email,
                };
            } else {
                payload = {
                    customerName: formData.customerName,
                    contactName: formData.contactName || undefined,
                    address: formData.address || undefined,
                    city: formData.city || undefined,
                    postalCode: formData.postalCode || undefined,
                    country: formData.country || undefined,
                    phone: formData.phone || undefined,
                    email: formData.email,
                    username: formData.username,
                };
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Không thể ${isEdit ? "cập nhật" : "thêm"} khách hàng`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorText || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            if (isEdit) {
                toast.success("Cập nhật khách hàng thành công!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setShowSuccessModal(true);
            }

            onSuccess();
            if (isEdit) onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            toast.error(`Có lỗi xảy ra: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Chỉnh Sửa Khách Hàng" : "Thêm Khách Hàng"}</DialogTitle>
                    </DialogHeader>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="customerName">Tên khách hàng</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        value={formData.customerName || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập tên khách hàng"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactName">Tên liên hệ</Label>
                                    <Input
                                        id="contactName"
                                        name="contactName"
                                        value={formData.contactName || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập tên liên hệ"
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập email"
                                        required
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
                            </div>
                        </div>
                        {!isEdit && (
                            <div>
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username || ""}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                />
                            </div>
                        )}
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

            <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Thêm Khách Hàng Thành Công</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Tài khoản khách hàng đã được tạo với:</p>
                        <p className="mt-2">
                            <strong>Tên đăng nhập:</strong> {formData.username}
                        </p>
                        <p>
                            <strong>Mật khẩu:</strong> Password123
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Vui lòng yêu cầu khách hàng đổi mật khẩu sau khi đăng nhập lần đầu.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCloseSuccessModal}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}