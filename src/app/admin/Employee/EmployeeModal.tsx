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
import { Employee } from "@/types/employee";
import { Calendar } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: Employee;
    onSuccess: () => void;
}

export function EmployeeModal({ isOpen, onClose, employee, onSuccess }: EmployeeModalProps) {
    const isEdit = !!employee;
    const [formData, setFormData] = useState<Partial<Employee & { username: string }>>({
        firstName: "",
        lastName: "",
        birthDate: "",
        hireDate: "",
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
        if (employee && isOpen) {
            setFormData({
                firstName: employee.firstName || "",
                lastName: employee.lastName || "",
                birthDate: employee.birthDate || "",
                hireDate: employee.hireDate || "",
                address: employee.address || "",
                city: employee.city || "",
                postalCode: employee.postalCode || "",
                country: employee.country || "",
                phone: employee.phone || "",
                email: employee.email || "",
                username: "",
            });
        } else if (!employee && isOpen) {
            setFormData({
                firstName: "",
                lastName: "",
                birthDate: "",
                hireDate: "",
                address: "",
                city: "",
                postalCode: "",
                country: "",
                phone: "",
                email: "",
                username: "",
            });
        }
    }, [employee, isOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (date: Date | null, field: "birthDate" | "hireDate") => {
        const isoDate = date ? date.toISOString().split("T")[0] : "";
        setFormData({ ...formData, [field]: isoDate });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = isEdit
                ? `http://localhost:8080/employees/${employee?.employeeID}`
                : "http://localhost:8080/employees";
            const method = isEdit ? "PUT" : "POST";

            let payload;
            if (isEdit) {
                payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthDate: formData.birthDate || undefined,
                    hireDate: formData.hireDate || undefined,
                    address: formData.address || undefined,
                    city: formData.city || undefined,
                    postalCode: formData.postalCode || undefined,
                    country: formData.country || undefined,
                    phone: formData.phone || undefined,
                    email: formData.email,
                };
            } else {
                payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthDate: formData.birthDate || undefined,
                    hireDate: formData.hireDate || undefined,
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
                let errorMessage = `Không thể ${isEdit ? "cập nhật" : "thêm"} nhân viên`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorText || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            if (isEdit) {
                toast.success("Cập nhật nhân viên thành công!", {
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

    const CustomDateInput = ({ value, onClick }: { value?: string; onClick?: () => void }) => (
        <div className="relative">
            <Input
                defaultValue={value || ""}
                onClick={onClick}
                placeholder="dd/mm/yyyy"
                readOnly
                className="pr-10"
            />
            <Calendar
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
                onClick={onClick}
            />
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Chỉnh Sửa Nhân Viên" : "Thêm Nhân Viên"}</DialogTitle>
                    </DialogHeader>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="firstName">Họ</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập họ"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Tên</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập tên"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="birthDate">Ngày sinh</Label>
                                    <DatePicker
                                        selected={formData.birthDate ? new Date(formData.birthDate) : null}
                                        onChange={(date: Date | null) => handleDateChange(date, "birthDate")}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<CustomDateInput />}
                                        showYearDropdown // Hiển thị dropdown chọn năm
                                        showMonthDropdown // Hiển thị dropdown chọn tháng
                                        yearDropdownItemNumber={50} // Số năm hiển thị trong dropdown (tùy chọn)
                                        scrollableYearDropdown // Cho phép cuộn danh sách năm
                                        showPopperArrow={false}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="hireDate">Ngày tuyển dụng</Label>
                                    <DatePicker
                                        selected={formData.hireDate ? new Date(formData.hireDate) : null}
                                        onChange={(date: Date | null) => handleDateChange(date, "hireDate")}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<CustomDateInput />}
                                        showYearDropdown // Hiển thị dropdown chọn năm
                                        showMonthDropdown // Hiển thị dropdown chọn tháng
                                        yearDropdownItemNumber={50} // Số năm hiển thị trong dropdown (tùy chọn)
                                        scrollableYearDropdown // Cho phép cuộn danh sách năm
                                        showPopperArrow={false}
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
                        <DialogTitle>Thêm Nhân Viên Thành Công</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Tài khoản nhân viên đã được tạo với:</p>
                        <p className="mt-2">
                            <strong>Tên đăng nhập:</strong> {formData.username}
                        </p>
                        <p>
                            <strong>Mật khẩu:</strong> Password123
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Vui lòng yêu cầu nhân viên đổi mật khẩu sau khi đăng nhập lần đầu.
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