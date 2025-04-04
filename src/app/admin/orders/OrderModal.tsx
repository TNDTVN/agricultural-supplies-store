"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Order } from "@/types/order";
import { OrderDetail } from "@/types/orderdetails";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order;
}

export default function OrderModal({ isOpen, onClose, order }: OrderModalProps) {
    const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

    useEffect(() => {
        if (isOpen && order) {
        fetch(`http://localhost:8080/orderdetails?orderID=${order.orderID}`)
            .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
            })
            .then(data => {
            const details = Array.isArray(data) ? data : data.content || [];
            setOrderDetails(details);
            })
            .catch(err => console.error("Failed to fetch order details:", err));
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    // Calculate order total
    const orderTotal = orderDetails.reduce((total, detail) => {
        return total + (detail.unitPrice * detail.quantity * (1 - detail.discount));
    }, 0) + (order.freight || 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
            <DialogTitle className="text-2xl text-center">
                Chi Tiết Đơn Hàng <Badge variant="outline">#{order.orderID}</Badge>
            </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Khách Hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Tên khách hàng</Label>
                        <p className="font-medium">{order.customer?.customerName || "Không xác định"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Số điện thoại</Label>
                        <p className="font-medium">{order.customer?.phone || "Không xác định"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{order.customer?.email || "Không xác định"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Địa chỉ</Label>
                        <p className="font-medium">{order.customer?.address || "Không xác định"}</p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Employee Information */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Nhân Viên</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Tên nhân viên</Label>
                        <p className="font-medium">
                        {`${order.employee?.firstName || ''} ${order.employee?.lastName || ''}`.trim() || "Không xác định"}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Số điện thoại</Label>
                        <p className="font-medium">{order.employee?.phone || "Không xác định"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{order.employee?.email || "Không xác định"}</p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Order Information */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Ngày đặt hàng</Label>
                        <p className="font-medium">
                        {format(new Date(order.orderDate), "PPP", { locale: vi })}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Ngày giao hàng</Label>
                        <p className="font-medium">
                        {order.shippedDate 
                            ? format(new Date(order.shippedDate), "PPP", { locale: vi }) 
                            : <Badge variant="secondary">Chưa giao</Badge>}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Địa chỉ giao</Label>
                        <p className="font-medium">{order.shipAddress || "Không xác định"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Phí vận chuyển</Label>
                        <p className="font-medium">
                        {(order.freight || 0).toLocaleString("vi-VN")} VND
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Order Details */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Chi Tiết Sản Phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    {orderDetails.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                        <TableHeader className="bg-secondary">
                            <TableRow>
                            <TableHead className="w-[300px]">Sản phẩm</TableHead>
                            <TableHead className="text-right">Đơn giá</TableHead>
                            <TableHead className="text-right">Số lượng</TableHead>
                            <TableHead className="text-right">Giảm giá</TableHead>
                            <TableHead className="text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderDetails.map((detail) => (
                            <TableRow key={detail.orderDetailID}>
                                <TableCell className="font-medium">
                                {detail.product?.productName || `Sản phẩm #${detail.productID}`}
                                </TableCell>
                                <TableCell className="text-right">
                                {detail.unitPrice.toLocaleString("vi-VN")} VND
                                </TableCell>
                                <TableCell className="text-right">
                                {detail.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                <Badge variant="outline">
                                    {(detail.discount * 100).toFixed(2)}%
                                </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                {(detail.unitPrice * detail.quantity * (1 - detail.discount)).toLocaleString("vi-VN")} VND
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                    ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Không có chi tiết sản phẩm nào.</p>
                    </div>
                    )}

                    {/* Order Summary */}
                    {orderDetails.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between border-t pt-4">
                        <Label className="text-muted-foreground">Tạm tính:</Label>
                        <span className="font-medium">
                            {(orderTotal - (order.freight || 0)).toLocaleString("vi-VN")} VND
                        </span>
                        </div>
                        <div className="flex justify-between">
                        <Label className="text-muted-foreground">Phí vận chuyển:</Label>
                        <span className="font-medium">
                            {(order.freight || 0).toLocaleString("vi-VN")} VND
                        </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                        <Label className="text-muted-foreground font-bold">Tổng cộng:</Label>
                        <span className="text-lg font-bold text-primary">
                            {orderTotal.toLocaleString("vi-VN")} VND
                        </span>
                        </div>
                    </div>
                    )}
                </CardContent>
                </Card>
            </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-2">
            <Button
                variant="default"
                onClick={() => console.log("Xuất hóa đơn cho đơn hàng:", order.orderID)}
            >
                Xuất hóa đơn
            </Button>
            <Button className="mb-2" variant="outline" onClick={onClose}>
                Đóng
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    );
}