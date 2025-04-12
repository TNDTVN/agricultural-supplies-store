"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Account } from "@/types/account";
import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const [customer, setCustomer] = useState<Customer>({
        customerID: 0,
        customerName: "",
        contactName: "",
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
        profileImage: "",
        createdDate: "",
        role: "CUSTOMER",
    });
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const accountID = sessionStorage.getItem("accountID");
            if (!accountID) {
                toast.error("Vui lòng đăng nhập để xem thông tin cá nhân!");
                router.push("/user");
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
                    profileImage: accountData.profileImage || "profile.jpg", // Đảm bảo giá trị mặc định
                });

                const customerResponse = await fetch(`http://localhost:8080/customers/account/${accountID}`);
                if (!customerResponse.ok) throw new Error("Không thể lấy thông tin khách hàng");
                const customerData = await customerResponse.json();
                setCustomer({
                    ...customerData,
                    customerID: customerData.customerID || 0,
                    customerName: customerData.customerName || "",
                    email: customerData.email || accountData.email || "",
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
            let profileImageName = account.profileImage; // Giữ nguyên ảnh cũ nếu không có thay đổi
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
                    username: account.username,
                    password: account.password || "", // Đảm bảo password không undefined
                    email: customer.email,
                    profileImage: profileImageName || "profile.jpg", // Đảm bảo giá trị hợp lệ
                    role: sessionStorage.getItem("role") || "CUSTOMER",
                }),
            });
            if (!accountUpdateResponse.ok) {
                const errorText = await accountUpdateResponse.text();
                throw new Error(errorText || "Không thể cập nhật thông tin tài khoản");
            }

            // Cập nhật thông tin khách hàng
            const customerUpdateResponse = await fetch(`http://localhost:8080/customers/profile/${customer.customerID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: customer.customerName,
                    contactName: customer.contactName,
                    address: customer.address,
                    city: customer.city,
                    postalCode: customer.postalCode,
                    country: customer.country,
                    phone: customer.phone,
                    email: customer.email,
                }),
            });
            if (!customerUpdateResponse.ok) {
                const errorText = await customerUpdateResponse.text();
                throw new Error(errorText || "Không thể cập nhật thông tin khách hàng");
            }

            // Cập nhật trạng thái account với dữ liệu mới
            const updatedAccount = await accountUpdateResponse.json();
            setAccount({
                ...updatedAccount,
                accountID: updatedAccount.accountID || 0,
                username: updatedAccount.username || "",
                profileImage: updatedAccount.profileImage || "profile.jpg", // Đảm bảo giá trị hợp lệ
                email: updatedAccount.email || customer.email,
                role: updatedAccount.role || "CUSTOMER",
                password: account.password, // Giữ password hiện tại
                createdDate: updatedAccount.createdDate || "",
            });

            // Reset previewImage nếu không có ảnh mới
            if (!newProfileImage) {
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
                                        {account.username ? account.username.charAt(0).toUpperCase() : "U"}
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
                                        value={customer.email || ""}
                                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
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
                                <Label htmlFor="customerName">Họ tên</Label>
                                <Input
                                    id="customerName"
                                    value={customer.customerName || ""}
                                    onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactName">Tên liên hệ</Label>
                                <Input
                                    id="contactName"
                                    value={customer.contactName || ""}
                                    onChange={(e) => setCustomer({ ...customer, contactName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    value={customer.phone || ""}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
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
                                    value={customer.address || ""}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Thành phố</Label>
                                <Input
                                    id="city"
                                    value={customer.city || ""}
                                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">Mã bưu điện</Label>
                                <Input
                                    id="postalCode"
                                    value={customer.postalCode || ""}
                                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Quốc gia</Label>
                                <Input
                                    id="country"
                                    value={customer.country || ""}
                                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
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
                            onClick={() => router.push("/user")}
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