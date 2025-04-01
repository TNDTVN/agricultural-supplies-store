"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CartItem } from "@/types/cartItems";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../layout";

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [shipInfo, setShipInfo] = useState({
        shipAddress: "",
        shipCity: "",
        shipPostalCode: "",
        shipCountry: "",
        notes: "",
    });
    const [errors, setErrors] = useState({
        shipAddress: false,
        shipCity: false,
        shipPostalCode: false,
        shipCountry: false,
    });
    const { setIsLoginModalOpen } = useAuth();

    const accountID = Number(sessionStorage.getItem("accountID")) || null;

    const fetchCartItems = async () => {
        if (!accountID) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`http://localhost:8080/cart/${accountID}`);
            const data: CartItem[] = await res.json();
            setCartItems(data);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            toast.error("Lỗi khi tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, [accountID]);

    const updateQuantity = async (cartItemID: number, quantity: number) => {
        if (quantity < 1) return;
        
        try {
            const res = await fetch(
                `http://localhost:8080/cart/update?cartItemID=${cartItemID}&quantity=${quantity}`,
                { method: "PUT" }
            );
            if (res.ok) {
                fetchCartItems();
                toast.success("Cập nhật số lượng thành công");
            } else {
                const error = await res.text();
                toast.error(error);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            toast.error("Lỗi khi cập nhật số lượng");
        }
    };

    const removeItem = async (cartItemID: number) => {
        try {
            const res = await fetch(`http://localhost:8080/cart/remove/${cartItemID}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchCartItems();
                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
            } else {
                const error = await res.text();
                toast.error(error);
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast.error("Lỗi khi xóa sản phẩm");
        }
    };

    const clearCart = async () => {
        if (!accountID) return;
        try {
            const res = await fetch(`http://localhost:8080/cart/clear/${accountID}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCartItems([]);
                toast.success("Đã xóa tất cả sản phẩm trong giỏ hàng");
            } else {
                const error = await res.text();
                toast.error(error);
            }
        } catch (error) {
            console.error("Lỗi khi xóa tất cả:", error);
            toast.error("Lỗi khi xóa giỏ hàng");
        }
    };

    const validateForm = () => {
        const newErrors = {
            shipAddress: !shipInfo.shipAddress.trim(),
            shipCity: !shipInfo.shipCity.trim(),
            shipPostalCode: !shipInfo.shipPostalCode.trim(),
            shipCountry: !shipInfo.shipCountry.trim(),
        };
        
        setErrors(newErrors);
        
        return !Object.values(newErrors).some(error => error);
    };

    const checkout = async () => {
        if (!accountID) return;
        
        if (!validateForm()) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
            return;
        }
        
        try {
            const res = await fetch(`http://localhost:8080/cart/checkout/${accountID}`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    shipAddress: shipInfo.shipAddress,
                    shipCity: shipInfo.shipCity,
                    shipPostalCode: shipInfo.shipPostalCode,
                    shipCountry: shipInfo.shipCountry,
                    notes: shipInfo.notes,
                }).toString(),
            });
            if (res.ok) {
                toast.success("Đặt hàng thành công!");
                setCartItems([]);
                setShipInfo({
                    shipAddress: "",
                    shipCity: "",
                    shipPostalCode: "",
                    shipCountry: "",
                    notes: "",
                });
            } else {
                const error = await res.text();
                toast.error(error);
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            toast.error("Lỗi khi đặt hàng");
        }
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );

    if (loading) return <div className="text-center py-10">Đang tải...</div>;

    if (!accountID) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
                <p>
                    Vui lòng{" "}
                    <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="text-blue-500 hover:underline"
                    >
                        đăng nhập
                    </button>{" "}
                    để xem giỏ hàng.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            {cartItems.length === 0 ? (
                <Card className="p-6 text-center">
                    <p className="text-gray-500">Giỏ hàng trống</p>
                    <Button className="mt-4" variant="outline">
                        Tiếp tục mua sắm
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 h-full">
                    {/* Thông tin giao hàng */}
                    <div className="flex flex-col h-full">
                        <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                                    <Input
                                        id="address"
                                        placeholder="Số nhà, tên đường"
                                        value={shipInfo.shipAddress}
                                        onChange={(e) =>
                                            setShipInfo({ ...shipInfo, shipAddress: e.target.value })
                                        }
                                        className={errors.shipAddress ? "border-red-500" : ""}
                                    />
                                    {errors.shipAddress && (
                                        <p className="text-sm text-red-500">Vui lòng nhập địa chỉ</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Thành phố *</Label>
                                        <Input
                                            id="city"
                                            placeholder="Thành phố"
                                            value={shipInfo.shipCity}
                                            onChange={(e) =>
                                                setShipInfo({ ...shipInfo, shipCity: e.target.value })
                                            }
                                            className={errors.shipCity ? "border-red-500" : ""}
                                        />
                                        {errors.shipCity && (
                                            <p className="text-sm text-red-500">Vui lòng nhập thành phố</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Mã bưu điện *</Label>
                                        <Input
                                            id="postalCode"
                                            placeholder="Mã bưu điện"
                                            value={shipInfo.shipPostalCode}
                                            onChange={(e) =>
                                                setShipInfo({ ...shipInfo, shipPostalCode: e.target.value })
                                            }
                                            className={errors.shipPostalCode ? "border-red-500" : ""}
                                        />
                                        {errors.shipPostalCode && (
                                            <p className="text-sm text-red-500">Vui lòng nhập mã bưu điện</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="country">Quốc gia *</Label>
                                    <Input
                                        id="country"
                                        placeholder="Quốc gia"
                                        value={shipInfo.shipCountry}
                                        onChange={(e) =>
                                            setShipInfo({ ...shipInfo, shipCountry: e.target.value })
                                        }
                                        className={errors.shipCountry ? "border-red-500" : ""}
                                    />
                                    {errors.shipCountry && (
                                        <p className="text-sm text-red-500">Vui lòng nhập quốc gia</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Ghi chú thêm (tùy chọn)"
                                        value={shipInfo.notes}
                                        onChange={(e) =>
                                            setShipInfo({ ...shipInfo, notes: e.target.value })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Tổng thanh toán */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-xl">Tổng thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{total.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span>{total.toLocaleString()} VNĐ</span>
                                </div>
                                
                                <Button
                                    onClick={checkout}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    Đặt hàng
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Danh sách sản phẩm */}
                    <div className="flex flex-col" style={{ maxHeight: 'calc(100vh)' }}>
                    <Card className="flex-1 flex flex-col h-full">
                        <CardHeader className="flex flex-row justify-between items-center sticky top-0 z-0 bg-background">
                            <CardTitle className="text-xl">Sản phẩm trong giỏ ({cartItems.length})</CardTitle>
                            <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearCart}
                            >
                            Xóa tất cả
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            <div className="relative h-full">
                            <Table>
                                <TableHeader className="sticky bg-background z-0">
                                        <TableRow>
                                            <TableHead className="w-[100px]">Sản phẩm</TableHead>
                                            <TableHead>Tên</TableHead>
                                            <TableHead className="text-right">Đơn giá</TableHead>
                                            <TableHead className="text-center">Số lượng</TableHead>
                                            <TableHead className="text-right">Tổng</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cartItems.map((item) => (
                                            <TableRow key={item.cartItemID}>
                                                <TableCell>
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={`http://localhost:8080/images/${item.imageUrl}`}
                                                            alt={item.productName}
                                                            width={80}
                                                            height={80}
                                                            className="rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                                                            No Image
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-right">
                                                    {item.unitPrice.toLocaleString()} VNĐ
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(item.cartItemID, Number(e.target.value))
                                                        }
                                                        className="w-20 text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(item.unitPrice * item.quantity).toLocaleString()} VNĐ
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.cartItemID)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;