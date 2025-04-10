"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Customer } from "@/types/customer";
import { Notification } from "@/types/notification";
import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [receiverID, setReceiverID] = useState<string>("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [accountID, setAccountID] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const storedRole = sessionStorage.getItem("role");
        const storedAccountID = sessionStorage.getItem("accountID");
        setRole(storedRole);
        setAccountID(storedAccountID ? parseInt(storedAccountID) : null);

        if (storedRole && storedAccountID) {
            fetchNotifications(parseInt(storedAccountID), storedRole);
            fetchCustomers();
        }
    }, [currentPage]);

    const fetchNotifications = async (accountID: number, role: string) => {
        try {
            const response = await fetch(
                `http://localhost:8080/notifications/user?accountID=${accountID}&role=${role}&page=${currentPage - 1}&size=${itemsPerPage}&t=${new Date().getTime()}`
            );
            if (!response.ok) throw new Error("Không thể lấy thông báo");
            const data = await response.json();
            console.log("Raw data from server:", data.content);
            setNotifications(data.content);
            setTotalItems(data.totalElements);
        } catch (err: any) {
            toast.error(err.message, { position: "top-right", autoClose: 3000 });
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch("http://localhost:8080/customers");
            if (!response.ok) throw new Error("Không thể lấy danh sách khách hàng");
            const data = await response.json();
            setCustomers(Array.isArray(data) ? data : data.content || []);
        } catch (err: any) {
            toast.error(err.message, { position: "top-right", autoClose: 3000 });
        }
    };

    const handleSendNotification = async () => {
        if (!title || !content) {
            toast.error("Vui lòng nhập tiêu đề và nội dung", { position: "top-right", autoClose: 3000 });
            return;
        }
        if (!accountID || !role) {
            toast.error("Bạn cần đăng nhập để gửi thông báo", { position: "top-right", autoClose: 3000 });
            return;
        }
        if (role !== "ADMIN") {
            toast.error("Chỉ admin mới có thể gửi thông báo", { position: "top-right", autoClose: 3000 });
            return;
        }

        const notification: Notification = {
            notificationID: 0,
            title,
            content,
            senderID: accountID,
            receiverID: receiverID === "all" || receiverID === "" ? null : parseInt(receiverID), // Nếu không chọn hoặc chọn "all", receiverID = null
            createdDate: new Date().toISOString(),
            read: false,
        };

        try {
            const response = await fetch("http://localhost:8080/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notification),
            });
            if (!response.ok) throw new Error("Không thể gửi thông báo");
            toast.success("Thông báo đã được gửi!", { position: "top-right", autoClose: 3000 });
            setTitle("");
            setContent("");
            setReceiverID("");
            setCurrentPage(1); // Quay về trang đầu để hiển thị thông báo mới
            fetchNotifications(accountID, role);
        } catch (err: any) {
            toast.error(err.message, { position: "top-right", autoClose: 3000 });
        }
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản Lý Thông Báo</h1>
                <p className="text-gray-600 mt-2">Gửi và quản lý thông báo đến khách hàng</p>
            </div>

            {role === "ADMIN" && (
                <Card className="shadow-lg">
                    <CardHeader className="border-b">
                        <CardTitle className="text-xl">Gửi Thông Báo Mới</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                            <Editor
                                apiKey="3kihomhe46p4ovs1yfzp7nwx7teow1djjb1kj5yejcgtqfuq"
                                value={title}
                                onEditorChange={(newValue) => setTitle(newValue)}
                                init={{
                                    height: 200,
                                    menubar: false,
                                    plugins: ["link", "lists"],
                                    toolbar:
                                        "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
                                    placeholder: "Nhập tiêu đề...",
                                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                            <Editor
                                apiKey="3kihomhe46p4ovs1yfzp7nwx7teow1djjb1kj5yejcgtqfuq"
                                value={content}
                                onEditorChange={(newValue) => setContent(newValue)}
                                init={{
                                    height: 300,
                                    menubar: false,
                                    plugins: ["link", "lists"],
                                    toolbar:
                                        "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
                                    placeholder: "Nhập nội dung...",
                                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Người nhận</label>
                            <Select onValueChange={setReceiverID} value={receiverID}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn người nhận (để trống để gửi cho tất cả)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Gửi cho tất cả</SelectItem>
                                    {Array.isArray(customers) && customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <SelectItem
                                                key={customer.customerID}
                                                value={customer.accountID ? customer.accountID.toString() : "unknown"}
                                            >
                                                {customer.customerName} ({customer.email})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>Không có khách hàng nào</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSendNotification}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Gửi Thông Báo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl">Lịch Sử Thông Báo</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="rounded-md border">
                        <ShadcnTable>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[20%]">Tiêu đề</TableHead>
                                    <TableHead className="w-[30%]">Nội dung</TableHead>
                                    <TableHead>Người gửi</TableHead>
                                    <TableHead>Người nhận</TableHead>
                                    <TableHead className="text-right">Ngày gửi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <TableRow key={notification.notificationID} className="hover:bg-gray-50">
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {stripHtml(notification.title)}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] line-clamp-2">
                                                <div dangerouslySetInnerHTML={{ __html: notification.content }} />
                                            </TableCell>
                                            <TableCell>
                                                {notification.senderName || `ID: ${notification.senderID}`}
                                            </TableCell>
                                            <TableCell>
                                                {notification.receiverName || (notification.receiverID ? `ID: ${notification.receiverID}` : "Tất cả khách hàng")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Date(notification.createdDate).toLocaleString("vi-VN")}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                            Không có thông báo nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </ShadcnTable>
                    </div>

                    {totalItems > itemsPerPage && (
                        <div className="mt-4 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                            className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-4 py-2">
                                            Trang {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                currentPage < Math.ceil(totalItems / itemsPerPage) && paginate(currentPage + 1)
                                            }
                                            className={
                                                currentPage === Math.ceil(totalItems / itemsPerPage)
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "cursor-pointer"
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