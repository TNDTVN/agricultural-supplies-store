"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Account } from "@/types/account";
import { Employee } from "@/types/employee";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminProfilePage() {
    const [employee, setEmployee] = useState<Employee>({
        employeeID: 0,
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
    });
    const [account, setAccount] = useState<Account>({
        accountID: 0,
        username: "",
        password: "",
        email: "",
        profileImage: "profile.jpg",
        createdDate: "",
        role: "EMPLOYEE",
    });
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const accountID = sessionStorage.getItem("accountID");
            const role = sessionStorage.getItem("role");
            if (!accountID || (role !== "EMPLOYEE" && role !== "ADMIN")) {
                toast.error("Vui lòng đăng nhập với tài khoản nhân viên hoặc admin!");
                router.push("/admin");
                return;
            }

            try {
                const accountResponse = await fetch(`http://localhost:8080/accounts/${accountID}`);
                if (!accountResponse.ok) throw new Error("Không thể lấy thông tin tài khoản");
                const accountData = await accountResponse.json();
                setAccount({
                    ...accountData,
                    accountID: accountData.accountID || 0,
                    username: accountData.username || "",
                    profileImage: accountData.profileImage || "profile.jpg",
                    email: accountData.email || "",
                    role: accountData.role || "EMPLOYEE",
                    password: accountData.password || "",
                    createdDate: accountData.createdDate || "",
                });

                const employeeResponse = await fetch(`http://localhost:8080/employees/account/${accountID}`);
                if (!employeeResponse.ok) throw new Error("Không thể lấy thông tin nhân viên");
                const employeeData = await employeeResponse.json();
                setEmployee({
                    ...employeeData,
                    employeeID: employeeData.employeeID || 0,
                    firstName: employeeData.firstName || "",
                    lastName: employeeData.lastName || "",
                    email: employeeData.email || accountData.email || "",
                    birthDate: employeeData.birthDate || "",
                    hireDate: employeeData.hireDate || "",
                    address: employeeData.address || "",
                    city: employeeData.city || "",
                    postalCode: employeeData.postalCode || "",
                    country: employeeData.country || "",
                    phone: employeeData.phone || "",
                });
            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            let profileImageName = account.profileImage;
            if (newProfileImage) {
                const formData = new FormData();
                formData.append("file", newProfileImage);
                const uploadResponse = await fetch("http://localhost:8080/images/upload-single", {
                    method: "POST",
                    body: formData,
                });
                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    throw new Error(errorText || "Không thể upload ảnh");
                }
                profileImageName = await uploadResponse.text();
            }

            // Cập nhật tài khoản
            const accountUpdateResponse = await fetch(`http://localhost:8080/accounts/${account.accountID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountID: account.accountID,
                    username: account.username,
                    password: account.password || "",
                    email: employee.email || account.email,
                    profileImage: profileImageName || "profile.jpg",
                    role: account.role || sessionStorage.getItem("role") || "EMPLOYEE",
                    createdDate: account.createdDate || new Date().toISOString(),
                }),
            });
            if (!accountUpdateResponse.ok) {
                const errorText = await accountUpdateResponse.text();
                throw new Error(errorText || "Không thể cập nhật thông tin tài khoản");
            }

            // Cập nhật thông tin nhân viên
            const employeeUpdateResponse = await fetch(`http://localhost:8080/employees/profile/${employee.employeeID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: employee.firstName || "",
                    lastName: employee.lastName || "",
                    birthDate: employee.birthDate || null,
                    hireDate: employee.hireDate || null,
                    address: employee.address || "",
                    city: employee.city || "",
                    postalCode: employee.postalCode || "",
                    country: employee.country || "",
                    phone: employee.phone || "",
                    email: employee.email || "",
                }),
            });
            if (!employeeUpdateResponse.ok) {
                const errorText = await employeeUpdateResponse.text();
                throw new Error(errorText || "Không thể cập nhật thông tin nhân viên");
            }

            // Cập nhật trạng thái account với dữ liệu mới
            const updatedAccount = await accountUpdateResponse.json();
            setAccount((prev) => ({
                ...prev,
                ...updatedAccount,
                accountID: updatedAccount.accountID || prev.accountID,
                username: updatedAccount.username || prev.username,
                profileImage: updatedAccount.profileImage || prev.profileImage || "profile.jpg",
                email: updatedAccount.email || employee.email || prev.email,
                role: updatedAccount.role || prev.role || "EMPLOYEE",
                password: prev.password, // Giữ password hiện tại
                createdDate: updatedAccount.createdDate || prev.createdDate,
            }));

            // Cập nhật trạng thái employee
            const updatedEmployee = await employeeUpdateResponse.json();
            setEmployee((prev) => ({
                ...prev,
                ...updatedEmployee,
                employeeID: updatedEmployee.employeeID || prev.employeeID,
                firstName: updatedEmployee.firstName || prev.firstName,
                lastName: updatedEmployee.lastName || prev.lastName,
                email: updatedEmployee.email || prev.email,
                birthDate: updatedEmployee.birthDate || prev.birthDate,
                hireDate: updatedEmployee.hireDate || prev.hireDate,
                address: updatedEmployee.address || prev.address,
                city: updatedEmployee.city || prev.city,
                postalCode: updatedEmployee.postalCode || prev.postalCode,
                country: updatedEmployee.country || prev.country,
                phone: updatedEmployee.phone || prev.phone,
            }));

            // Reset previewImage chỉ khi upload ảnh mới thành công
            if (newProfileImage) {
                setNewProfileImage(null);
                setPreviewImage(null);
            }

            toast.success("Cập nhật thông tin thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="space-y-4 w-full max-w-6xl">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Card 1: Profile Image and Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Thông tin tài khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center space-y-2">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage
                                        src={
                                            previewImage ||
                                            (account.profileImage && account.profileImage !== "profile.jpg"
                                                ? `http://localhost:8080/images/${account.profileImage}`
                                                : "/images/default-avatar.png")
                                        }
                                        alt="Ảnh đại diện"
                                    />
                                    <AvatarFallback>
                                        {employee.firstName
                                            ? employee.firstName.charAt(0).toUpperCase()
                                            : account.username
                                            ? account.username.charAt(0).toUpperCase()
                                            : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <Label
                                    htmlFor="profileImage"
                                    className="cursor-pointer text-primary hover:underline"
                                >
                                    Thay đổi ảnh
                                </Label>
                                <Input
                                    id="profileImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input
                                        id="username"
                                        value={account.username || ""}
                                        onChange={(e) => setAccount({ ...account, username: e.target.value })}
                                        className="mt-1"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={employee.email || ""}
                                        onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Thông tin cá nhân</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="firstName">Họ</Label>
                                <Input
                                    id="firstName"
                                    value={employee.firstName || ""}
                                    onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Tên</Label>
                                <Input
                                    id="lastName"
                                    value={employee.lastName || ""}
                                    onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    value={employee.phone || ""}
                                    onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Card 3: Address */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Địa chỉ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={employee.address || ""}
                                    onChange={(e) => setEmployee({ ...employee, address: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Thành phố</Label>
                                <Input
                                    id="city"
                                    value={employee.city || ""}
                                    onChange={(e) => setEmployee({ ...employee, city: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">Mã bưu điện</Label>
                                <Input
                                    id="postalCode"
                                    value={employee.postalCode || ""}
                                    onChange={(e) => setEmployee({ ...employee, postalCode: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Quốc gia</Label>
                                <Input
                                    id="country"
                                    value={employee.country || ""}
                                    onChange={(e) => setEmployee({ ...employee, country: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/admin")}
                        >
                            Hủy
                        </Button>
                        <Button type="submit">Lưu thay đổi</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}