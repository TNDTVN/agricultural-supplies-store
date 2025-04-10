"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Notification } from "@/types/notification";
import { Bell, Package, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Hàm làm sạch HTML để chỉ lấy văn bản thuần túy
const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [accountID, setAccountID] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const storedAccountID = sessionStorage.getItem("accountID");
        const storedRole = sessionStorage.getItem("role");
        setAccountID(storedAccountID ? parseInt(storedAccountID) : null);
        setRole(storedRole);

        if (storedAccountID && storedRole) {
            fetchNotifications(parseInt(storedAccountID), storedRole);
        }
    }, [currentPage]);

    const fetchNotifications = async (accountID: number, role: string) => {
        try {
            const response = await fetch(
                `http://localhost:8080/notifications/user?accountID=${accountID}&role=${role}&page=${currentPage - 1}&size=${itemsPerPage}`,
                { headers: { "Cache-Control": "no-cache" } }
            );
            if (!response.ok) throw new Error("Không thể lấy thông báo");
            const data = await response.json();
            console.log("Fetched notifications:", data.content); // Debug dữ liệu từ server
            data.content.forEach((notif: Notification) =>
                console.log(`ID: ${notif.notificationID}, isRead: ${notif.read}`)
            ); // Debug từng thông báo
            setNotifications(data.content);
            setTotalItems(data.totalElements);
        } catch (err: any) {
            toast.error(err.message, { position: "top-right", autoClose: 3000 });
        }
    };

    const markAsRead = async (notificationID: number) => {
        console.log("Marking as read:", notificationID); // Debug xem hàm có được gọi không
        try {
            const response = await fetch(`http://localhost:8080/notifications/mark-as-read/${notificationID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Không thể đánh dấu đã đọc");
            console.log("Mark as read successful for ID:", notificationID);
            if (accountID && role) {
                fetchNotifications(accountID, role); // Tải lại danh sách từ server
            }
        } catch (err: any) {
            console.error("Error marking as read:", err);
            toast.error(err.message, { position: "top-right", autoClose: 3000 });
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        console.log("Clicked notification:", notification); // Debug thông báo được nhấn
        if (notification.receiverID !== null && !notification.read) {
            markAsRead(notification.notificationID);
        } else {
            console.log("No action: receiverID is null or already read");
        }
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getNotificationIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "order":
                return <ShoppingCart className="h-5 w-5 text-orange-500" />;
            case "delivery":
                return <Truck className="h-5 w-5 text-blue-500" />;
            case "product":
                return <Package className="h-5 w-5 text-green-500" />;
            case "promotion":
                return <Bell className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <main className="p-4 md:p-6 mx-auto space-y-6">
            <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary to-primary-dark text-white">
                    <div className="flex items-center space-x-3">
                        <Bell className="h-6 w-6" />
                        <CardTitle className="text-lg md:text-xl">Danh sách thông báo</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.notificationID}
                                    className={`p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                                        notification.read || notification.receiverID === null ? "bg-white" : "bg-blue-50"
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.title || "default")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3
                                                    className={`text-base md:text-lg font-semibold ${
                                                        notification.read || notification.receiverID === null
                                                            ? "text-gray-800"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {stripHtml(notification.title)}
                                                </h3>
                                                {notification.receiverID !== null && (
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                            notification.read
                                                                ? "text-gray-500 bg-gray-100"
                                                                : "text-white bg-primary"
                                                        }`}
                                                    >
                                                        {notification.read ? "Đã xem" : "Mới"}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="text-gray-600 text-sm md:text-base mt-1"
                                                dangerouslySetInnerHTML={{ __html: notification.content }}
                                            />
                                            <div className="flex items-center mt-2 text-xs text-gray-400">
                                                {new Date(notification.createdDate).toLocaleString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Không có thông báo</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Khi có thông báo mới, chúng sẽ xuất hiện tại đây.
                            </p>
                        </div>
                    )}

                    {totalItems > itemsPerPage && (
                        <div className="mt-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                            className={
                                                currentPage === 1
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "cursor-pointer hover:bg-gray-200"
                                            }
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-4 py-2 text-sm text-gray-700">
                                            Trang {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                currentPage < Math.ceil(totalItems / itemsPerPage) &&
                                                paginate(currentPage + 1)
                                            }
                                            className={
                                                currentPage === Math.ceil(totalItems / itemsPerPage)
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "cursor-pointer hover:bg-gray-200"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}