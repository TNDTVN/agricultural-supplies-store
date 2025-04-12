"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { OrderDetail } from "@/types/orderdetails";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PurchaseHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(5); // Số đơn hàng mỗi trang
    const [accountID, setAccountID] = useState<number | null>(null);

    // Lấy accountID từ sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
        const storedAccountID = sessionStorage.getItem("accountID");
        setAccountID(storedAccountID ? parseInt(storedAccountID) : null);
        }
    }, []);

    // Lấy danh sách đơn hàng
    const fetchPurchaseHistory = async (page: number) => {
        if (!accountID) {
        toast.error("Vui lòng đăng nhập để xem lịch sử mua hàng!");
        return;
        }

        const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-Account-ID": accountID.toString(),
        };

        try {
        const response = await fetch(
            `http://localhost:8080/orders/history?page=${page}&size=${pageSize}&sort=orderDate,desc`,
            { headers }
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi khi lấy lịch sử mua hàng: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        const orders = data.content || [];
        // Lấy chi tiết đơn hàng cho từng đơn
        const ordersWithDetails = await Promise.all(
            orders.map(async (order: Order) => {
            const detailsResponse = await fetch(`http://localhost:8080/orderdetails?orderID=${order.orderID}`);
            const detailsData = await detailsResponse.json();
            return { ...order, orderDetails: Array.isArray(detailsData) ? detailsData : [] };
            })
        );

        setOrders(ordersWithDetails);
        setTotalPages(data.totalPages || 1);
        } catch (error) {
        console.error("Lỗi fetchPurchaseHistory:", error);
        toast.error("Không thể tải lịch sử mua hàng!");
        }
    };

    useEffect(() => {
        if (accountID) {
        fetchPurchaseHistory(currentPage);
        }
    }, [currentPage, accountID]);

    // Xử lý thay đổi trang
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        }
    };

    // Hàm xác định trạng thái đơn hàng
    const getOrderStatus = (order: Order) => {
        if (order.employeeID == null) {
        return { text: "Chưa duyệt", className: "bg-yellow-100 text-yellow-700" };
        } else if (order.cancelled) {
        return { text: "Đã bị hủy", className: "bg-red-100 text-red-700" };
        } else {
        return { text: "Đã được duyệt", className: "bg-green-100 text-green-700" };
        }
    };

    // Hàm xác định ngày giao
    const getShippingInfo = (order: Order) => {
        if (order.employeeID != null && !order.cancelled) {
        return order.shippedDate
            ? `Ngày giao: ${new Date(order.shippedDate).toLocaleDateString("vi-VN")}`
            : "Chưa giao";
        }
        return "Chưa xác định";
    };

    // Nếu chưa đăng nhập
    if (!accountID) {
        return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Lịch Sử Mua Hàng</h1>
            <p>Vui lòng đăng nhập để xem lịch sử mua hàng.</p>
        </div>
        );
    }

    return (
        <main className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Lịch Sử Mua Hàng</h1>

        {orders.length === 0 ? (
            <div className="text-center py-10">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
            </div>
        ) : (
            <div className="grid gap-6">
            {orders.map((order) => {
                const status = getOrderStatus(order);
                const shippingInfo = getShippingInfo(order);
                return (
                <Card key={order.orderID} className="shadow-md">
                    <CardHeader>
                    <CardTitle className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                        <span>Đơn Hàng #{order.orderID}</span>
                        <span className="text-sm text-gray-500">
                            Ngày đặt: {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                        </span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${status.className}`}>
                            {status.text}
                        </span>
                        <span className="text-sm text-gray-600">{shippingInfo}</span>
                        </div>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-4">
                        {/* Thông tin đơn hàng */}
                        <div>
                        <p>
                            <strong>Tổng tiền:</strong>{" "}
                            {order.orderDetails
                            ?.reduce(
                                (sum: number, detail) =>
                                sum +
                                (detail.unitPrice || 0) * (detail.quantity || 0) * (1 - (detail.discount || 0)),
                                0
                            )
                            .toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " VND"}
                        </p>
                        <p>
                            <strong>Địa chỉ giao hàng:</strong>{" "}
                            {`${order.shipAddress}, ${order.shipCity}, ${order.shipPostalCode}, ${order.shipCountry}`}
                        </p>
                        {order.notes && (
                            <p>
                            <strong>Ghi chú:</strong> {order.notes}
                            </p>
                        )}
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div>
                        <h3 className="font-semibold mb-2">Sản phẩm đã mua:</h3>
                        <div className="grid gap-4">
                            {order.orderDetails?.map((detail: OrderDetail) => {
                            const imageUrl =
                                detail.product?.images && detail.product.images.length > 0
                                ? `http://localhost:8080/images/${detail.product.images[0].imageName}`
                                : "/images/no-image.jpg";
                            return (
                                <div
                                key={detail.orderDetailID}
                                className="flex items-center gap-4 border-b py-2"
                                >
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <Image
                                    src={imageUrl}
                                    alt={detail.product?.productName || "Sản phẩm"}
                                    fill
                                    className="object-cover rounded-md"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{detail.product?.productName || "Không xác định"}</p>
                                    <p className="text-sm text-gray-600">
                                    Đơn giá: {(detail.unitPrice || 0).toLocaleString("vi-VN")} VND
                                    </p>
                                    <p className="text-sm text-gray-600">Số lượng: {detail.quantity}</p>
                                    <p className="text-sm font-semibold">
                                    Tổng: {((detail.unitPrice || 0) * (detail.quantity || 0)).toLocaleString("vi-VN")} VND
                                    </p>
                                </div>
                                </div>
                            );
                            })}
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        )}

        {/* Điều hướng phân trang */}
        {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
            <Button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                variant="outline"
            >
                Trang trước
            </Button>
            <span>
                Trang {currentPage} / {totalPages}
            </span>
            <Button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                variant="outline"
            >
                Trang sau
            </Button>
            </div>
        )}
        </main>
    );
}