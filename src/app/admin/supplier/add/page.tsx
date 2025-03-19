    "use client";

    import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Supplier } from "@/types/supplier";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

    export default function AddSupplier() {
    const router = useRouter();
    const [supplier, setSupplier] = useState<Partial<Supplier>>({
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSupplier({ ...supplier, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
        const response = await fetch("http://localhost:8080/suppliers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(supplier),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Không thể thêm nhà cung cấp");
        }
        alert("Thêm nhà cung cấp thành công!");
        router.push("/admin/supplier");
        } catch (err) {
        const error = err as Error;
        setError(error.message);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="p-4">
        <h1 className="text-3xl text-center font-semibold mb-4">Thêm Nhà Cung Cấp</h1>
        <div className="rounded-md border border-gray-300 p-4">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột trái */}
                <div className="space-y-4">
                <div>
                    <Label htmlFor="supplierName">Tên nhà cung cấp</Label>
                    <Input
                    id="supplierName"
                    name="supplierName"
                    value={supplier.supplierName || ""}
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
                    value={supplier.contactName || ""}
                    onChange={handleChange}
                    placeholder="Nhập tên người liên hệ"
                    />
                </div>
                <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                    id="address"
                    name="address"
                    value={supplier.address || ""}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    />
                </div>
                <div>
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                    id="city"
                    name="city"
                    value={supplier.city || ""}
                    onChange={handleChange}
                    placeholder="Nhập thành phố"
                    />
                </div>
                </div>
                {/* Cột phải */}
                <div className="space-y-4">
                <div>
                    <Label htmlFor="postalCode">Mã bưu điện</Label>
                    <Input
                    id="postalCode"
                    name="postalCode"
                    value={supplier.postalCode || ""}
                    onChange={handleChange}
                    placeholder="Nhập mã bưu điện"
                    />
                </div>
                <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                    id="country"
                    name="country"
                    value={supplier.country || ""}
                    onChange={handleChange}
                    placeholder="Nhập quốc gia"
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                    id="phone"
                    name="phone"
                    value={supplier.phone || ""}
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
                    value={supplier.email || ""}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    />
                </div>
                </div>
            </div>
            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Thêm"}
                </Button>
                <Link
                href="/admin/supplier"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-gray-200 border rounded-md hover:bg-gray-300"
                >
                Trở về
                </Link>
            </div>
            </form>
        </div>
        </main>
    );
    }