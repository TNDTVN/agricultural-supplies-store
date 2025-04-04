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
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/types/order";
import { OrderDetail } from "@/types/orderdetails";
import { addDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ApprovedInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order;
    action: "detail" | "approve" | "cancel";
    onActionComplete: () => void;
}

export default function ApprovedInvoiceModal({ isOpen, onClose, order: initialOrder, action, onActionComplete }: ApprovedInvoiceModalProps) {
    const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
    const [cancelNotes, setCancelNotes] = useState("");
    const [accountID, setAccountID] = useState<number | null>(null);
    const [updatedOrder, setUpdatedOrder] = useState<Order | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setAccountID(Number(sessionStorage.getItem("accountID")) || null);
        }
    }, []);

    useEffect(() => {
        if (isOpen && initialOrder) {
            setIsLoading(true);
            fetch(`http://localhost:8080/orders/${initialOrder.orderID}`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(fetchedOrder => {
                    setUpdatedOrder(fetchedOrder);

                    return fetch(`http://localhost:8080/orderdetails?orderID=${initialOrder.orderID}`);
                })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const details = Array.isArray(data) ? data : data.content || [];
                    setOrderDetails(details);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch order or details:", err);
                    setUpdatedOrder(initialOrder);
                    setIsLoading(false);
                });
        }
    }, [isOpen, initialOrder]);

    if (!isOpen || !updatedOrder || isLoading) return null;

    const orderTotal = orderDetails.reduce((total, detail) => {
        return total + (detail.unitPrice * detail.quantity * (1 - detail.discount));
    }, 0) + (updatedOrder.freight || 0);

    const handleApprove = async () => {
        if (!accountID) {
            toast.error("Vui lòng đăng nhập để duyệt hóa đơn!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/orders/${updatedOrder.orderID}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: accountID }),
            });
            if (!response.ok) throw new Error("Failed to approve order");
            toast.success("Duyệt hóa đơn thành công!");
            onActionComplete();
            onClose();
        } catch (error) {
            console.error("Error approving order:", error);
            toast.error("Không thể duyệt hóa đơn!");
        }
    };

    const handleCancel = async () => {
        if (!accountID) {
            toast.error("Vui lòng đăng nhập để hủy hóa đơn!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/orders/${updatedOrder.orderID}/cancel`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: accountID, notes: cancelNotes }),
            });
            if (!response.ok) throw new Error("Failed to cancel order");
            toast.success("Hủy hóa đơn thành công!");
            onActionComplete();
            onClose();
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Không thể hủy hóa đơn!");
        }
    };

    const expectedShippedDate = addDays(new Date(), 3);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">
                        {action === "detail" ? "Chi Tiết Hóa Đơn" : action === "approve" ? "Duyệt Hóa Đơn" : "Hủy Hóa Đơn"} <Badge variant="outline">#{updatedOrder.orderID}</Badge>
                        {updatedOrder.cancelled && <Badge variant="destructive" className="ml-2">Đã Hủy</Badge>}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[70vh] pr-4">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông Tin Khách Hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Tên khách hàng</Label>
                                        <p className="font-medium">{updatedOrder.customer?.customerName || "Không xác định"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Số điện thoại</Label>
                                        <p className="font-medium">{updatedOrder.customer?.phone || "Không xác định"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p className="font-medium">{updatedOrder.customer?.email || "Không xác định"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Địa chỉ</Label>
                                        <p className="font-medium">{updatedOrder.customer?.address || "Không xác định"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {updatedOrder.cancelled && updatedOrder.employee && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông Tin Nhân Viên Hủy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Tên nhân viên</Label>
                                            <p className="font-medium">
                                                {`${updatedOrder.employee?.firstName || ''} ${updatedOrder.employee?.lastName || ''}`.trim() || "Không xác định"}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Số điện thoại</Label>
                                            <p className="font-medium">{updatedOrder.employee?.phone || "Không xác định"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium">{updatedOrder.employee?.email || "Không xác định"}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông Tin Hóa Đơn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Ngày đặt hàng</Label>
                                        <p className="font-medium">
                                            {format(new Date(updatedOrder.orderDate), "PPP", { locale: vi })}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Ngày giao hàng</Label>
                                        <div className="font-medium">
                                            {updatedOrder.shippedDate
                                                ? <p>{format(new Date(updatedOrder.shippedDate), "PPP", { locale: vi })}</p>
                                                : action === "approve"
                                                    ? <p>{format(expectedShippedDate, "PPP", { locale: vi })} (Dự kiến)</p>
                                                    : <Badge variant="secondary">Chưa giao</Badge>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Địa chỉ giao</Label>
                                        <p className="font-medium">{updatedOrder.shipAddress || "Không xác định"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Phí vận chuyển</Label>
                                        <p className="font-medium">
                                            {(updatedOrder.freight || 0).toLocaleString("vi-VN")} VND
                                        </p>
                                    </div>
                                    {updatedOrder.notes && action !== "cancel" && !updatedOrder.cancelled && (
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-muted-foreground">Ghi chú</Label>
                                            <p className="font-medium">{updatedOrder.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {updatedOrder.cancelled && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Lý Do Hủy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">
                                        {updatedOrder.notes || "Không có lý do cụ thể"}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {action === "cancel" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Ghi Chú Hủy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Nhập lý do hủy hóa đơn"
                                        value={cancelNotes}
                                        onChange={(e) => setCancelNotes(e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        )}

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

                                {orderDetails.length > 0 && (
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between border-t pt-4">
                                            <Label className="text-muted-foreground">Tạm tính:</Label>
                                            <span className="font-medium">
                                                {(orderTotal - (updatedOrder.freight || 0)).toLocaleString("vi-VN")} VND
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label className="text-muted-foreground">Phí vận chuyển:</Label>
                                            <span className="font-medium">
                                                {(updatedOrder.freight || 0).toLocaleString("vi-VN")} VND
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
                    {action === "approve" && (
                        <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-700">
                            Xác nhận duyệt
                        </Button>
                    )}
                    {action === "cancel" && (
                        <Button onClick={handleCancel} className="bg-red-500 hover:bg-red-700">
                            Xác nhận hủy
                        </Button>
                    )}
                    <Button className="mb-2" variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}