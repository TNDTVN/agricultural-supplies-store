"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from "chart.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OrderStats {
    orderID: number;
    orderDate: string;
    totalPrice: number;
    employeeID: number;
    employeeName: string;
}

interface StatsData {
    totalOrders: number;
    totalRevenue: number;
    orders: OrderStats[];
}

export default function Statistics() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [filteredStats, setFilteredStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [role, setRole] = useState<string | null>(null);
    const [accountID, setAccountID] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const pageSize = 5;

    useEffect(() => {
        if (typeof window !== "undefined") {
        setRole(sessionStorage.getItem("role"));
        setAccountID(sessionStorage.getItem("accountID"));
        }
    }, []);

    useEffect(() => {
        if (role !== null && accountID !== null) {
        fetchStatistics();
        }
    }, [role, accountID]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            let url = "http://localhost:8080/orders/statistics";
            if (role !== "ADMIN" && accountID) {
                url += `?accountID=${accountID}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu thống kê");
            }
            const data: StatsData = await response.json();
            setStats(data);
            setFilteredStats(data);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            toast.error(error.message, { position: "top-right", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        }).format(value) + " VND";
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    };

    const getUniqueMonths = () => {
        if (!stats?.orders) return [];
        const months = new Set<string>();
        stats.orders.forEach((order) => {
        const date = new Date(order.orderDate);
        months.add(`${date.getMonth() + 1}/${date.getFullYear()}`);
        });
        return Array.from(months);
    };

    const filterByMonth = (month: string) => {
        if (!stats) return;
        if (month === "all") {
        setFilteredStats(stats);
        } else {
        const [selectedMonthNum, selectedYear] = month.split("/").map(Number);
        const filteredOrders = stats.orders.filter((order) => {
            const date = new Date(order.orderDate);
            return (
            date.getMonth() + 1 === selectedMonthNum &&
            date.getFullYear() === selectedYear
            );
        });
        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        setFilteredStats({ totalOrders, totalRevenue, orders: filteredOrders });
        }
        setCurrentPage(1);
    };

    const getChartData = () => {
        if (!filteredStats?.orders) return { labels: [], data: [] };

        if (selectedMonth === "all") {
        const monthlyData: { [key: string]: number } = {};
        filteredStats.orders.forEach((order) => {
            const date = new Date(order.orderDate);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + order.totalPrice;
        });
        return {
            labels: Object.keys(monthlyData),
            data: Object.values(monthlyData),
        };
        } else {
        return {
            labels: filteredStats.orders.map((order) => `HĐ ${order.orderID}`),
            data: filteredStats.orders.map((order) => order.totalPrice),
        };
        }
    };

    const chartRevenue = getChartData();

    const chartData = {
        labels: chartRevenue.labels,
        datasets: [
        {
            label: "Doanh Thu (VND)",
            data: chartRevenue.data,
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
        },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
        legend: { position: "top" as const },
        title: { 
            display: true, 
            text: selectedMonth === "all" ? "Doanh Thu Theo Tháng" : "Doanh Thu Theo Hóa Đơn",
            font: {
            size: 16
            }
        },
        },
        scales: {
        y: {
            beginAtZero: true,
            title: { display: true, text: "Doanh Thu (VND)" },
            grid: { display: true },
        },
        x: {
            grid: { display: true },
        },
        },
    };

    const totalPages = filteredStats ? Math.ceil(filteredStats.orders.length / pageSize) : 1;
    const paginatedOrders = filteredStats?.orders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        }
    };

    const exportToExcel = async () => {
        if (role !== "ADMIN") return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Thống Kê Hóa Đơn");

        // Worksheet data
        const data = filteredStats?.orders.map((order) => ({
        "Mã Hóa Đơn": order.orderID,
        "Ngày Lập": formatDate(order.orderDate),
        "Tổng Tiền": order.totalPrice,
        "Nhân Viên": order.employeeName || "Không xác định",
        })) || [];

        worksheet.addRow(["Mã Hóa Đơn", "Ngày Lập", "Tổng Tiền", "Nhân Viên"]);
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
        data.forEach((row) => worksheet.addRow(Object.values(row)));

        // Apply borders
        for (let row = 1; row <= data.length + 1; row++) {
        for (let col = 1; col <= 4; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
            };
        }
        }

        // Adjust column widths
        worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        for (let row = 1; row <= data.length + 1; row++) {
            const cellValue = worksheet.getCell(row, i + 1).value?.toString() || "";
            maxLength = Math.max(maxLength, cellValue.length);
        }
        column.width = maxLength + 2;
        column.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Add chart data
        const chartStartRow = data.length + 3;
        worksheet.addRow([]);
        worksheet.addRow([selectedMonth === "all" ? "Tháng" : "Hóa Đơn", "Doanh Thu"]);
        chartRevenue.labels.forEach((label, index) => {
        worksheet.addRow([label, chartRevenue.data[index]]);
        });

        // Add chart image
        const chartBuffer = await createChartImageBuffer();
        worksheet.addImage(
        workbook.addImage({
            buffer: chartBuffer,
            extension: "png",
        }),
        {
            tl: { col: 5, row: 1 },
            ext: { width: 400, height: 300 },
        }
        );

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `ThongKeHoaDon_${selectedMonth === "all" ? "TatCa" : selectedMonth.replace("/", "-")}.xlsx`);
    };

    const createChartImageBuffer = async (): Promise<ExcelJS.Buffer> => {
        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 900, 400);

        // Draw grid
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.5;
        for (let y = 50; y < 400; y += 50) {
            ctx.beginPath();
            ctx.moveTo(100, y);
            ctx.lineTo(850, y);
            ctx.stroke();
        }
        for (let x = 100; x < 850; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 50);
            ctx.lineTo(x, 350);
            ctx.stroke();
        }

        // Draw bars
        const barWidth = 40;
        const spacing = 20;
        const totalBars = chartRevenue.data.length;
        const totalWidth = totalBars * (barWidth + spacing) - spacing;
        const startX = (900 - totalWidth) / 2;
        const maxValue = Math.max(...chartRevenue.data) || 1;
        chartRevenue.data.forEach((value, index) => {
            ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
            const barHeight = (value / maxValue) * 300;
            const x = startX + index * (barWidth + spacing);
            ctx.fillRect(x, 400 - barHeight, barWidth, barHeight);

            // X-axis labels
            ctx.fillStyle = "#000";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(chartRevenue.labels[index], x + barWidth / 2, 370);

            // Value labels
            ctx.fillText(value.toLocaleString("vi-VN"), x + barWidth / 2, 400 - barHeight - 10);
        });

        // Title
        ctx.font = "16px Arial";
        ctx.fillText(
            selectedMonth === "all" ? "Doanh Thu Theo Tháng" : "Doanh Thu Theo Hóa Đơn",
            450,
            30
        );

        // Y-axis label
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Doanh Thu (VND)", 50, 40);
        }
        return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            blob?.arrayBuffer().then((buffer) => {
            resolve(new Uint8Array(buffer) as unknown as ExcelJS.Buffer);
            });
        });
        });
    };

    if (loading) {
        return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-8">
            <Skeleton className="h-10 w-64 mx-auto" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-96 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
            </div>
            </div>
        </div>
        );
    }

    if (error || !stats) {
        return (
        <div className="container mx-auto py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error || "Không có dữ liệu"}</span>
            </div>
        </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-center">
            Thống Kê Hóa Đơn {role === "ADMIN" ? "Tất Cả" : "Cá Nhân"}
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-600">
                    Tổng Số Hóa Đơn Đã Duyệt
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                    {filteredStats?.totalOrders || 0}
                </p>
                </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-600">
                    Tổng Doanh Thu
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(filteredStats?.totalRevenue || 0)}
                </p>
                </CardContent>
            </Card>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-4">
            <label htmlFor="monthSelect" className="text-sm font-medium text-gray-700">
                Lọc theo tháng:
            </label>
            <Select
                value={selectedMonth}
                onValueChange={(value) => {
                setSelectedMonth(value);
                filterByMonth(value);
                }}
            >
                <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {getUniqueMonths().map((month) => (
                    <SelectItem key={month} value={month}>
                    {month}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Table */}
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                    Danh Sách Hóa Đơn Đã Duyệt
                    </CardTitle>
                    {role === "ADMIN" && (
                    <Button
                        onClick={exportToExcel}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                    )}
                </div>
                </CardHeader>
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="font-medium">Mã HĐ</TableHead>
                        <TableHead className="font-medium">Ngày Lập</TableHead>
                        <TableHead className="font-medium text-right">Tổng Tiền</TableHead>
                        <TableHead className="font-medium">Nhân Viên</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paginatedOrders && paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                        <TableRow key={order.orderID} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{order.orderID}</TableCell>
                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                            <TableCell className="text-right">
                            {formatCurrency(order.totalPrice)}
                            </TableCell>
                            <TableCell>{order.employeeName || "Không xác định"}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Không có hóa đơn nào
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="gap-1"
                    >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                    </Button>
                    <div className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                    </div>
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="gap-1"
                    >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                </CardContent>
            </Card>

            {/* Chart */}
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold">
                    {selectedMonth === "all"
                    ? "Biểu Đồ Doanh Thu Theo Tháng"
                    : "Biểu Đồ Doanh Thu Theo Hóa Đơn"}
                </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
        </div>
    );
}