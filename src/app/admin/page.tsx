"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Package, Truck, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, CartesianGrid, Legend, BarChart as RechartsBarChart, Tooltip, XAxis, YAxis } from "recharts";

interface Stats {
    totalOrders: number;
    totalSuppliers: number;
    totalProducts: number;
    totalCustomers: number;
}

interface ApprovedOrder {
    firstName: string;
    lastName: string;
    email: string;
    totalPrice: number;
}

interface RevenueData {
    month: number;
    revenue: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [filterMode, setFilterMode] = useState<"all" | "specific">("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    const currentUserID = 1;

    useEffect(() => {
        fetchStats();
        fetchApprovedOrders();
        fetchRevenue();
    }, [filterMode, selectedMonth]);

    const fetchStats = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/dashboard/stats");
            if (!response.ok) throw new Error("Failed to fetch stats");
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchApprovedOrders = async () => {
        let url = "http://localhost:8080/api/dashboard/approved-orders";
        if (filterMode === "specific" && selectedMonth) {
            const [year, month] = selectedMonth.split("-").map(Number);
            url += `?year=${year}&month=${month}`;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error("Expected an array but got:", data);
                setApprovedOrders([]);
                return;
            }
            setApprovedOrders(
                data.map((item: any) => ({
                    firstName: item[0],
                    lastName: item[1],
                    email: item[2],
                    totalPrice: Number(item[3]),
                }))
            );
        } catch (error) {
            console.error("Error fetching approved orders:", error);
            setApprovedOrders([]);
        }
    };

    const fetchRevenue = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/dashboard/revenue");
            if (!response.ok) throw new Error("Failed to fetch revenue");
            const data = await response.json();
            setRevenueData(
                data.map((item: any) => ({
                    month: item[0],
                    revenue: item[1],
                }))
            );
        } catch (error) {
            console.error("Error fetching revenue:", error);
        }
    };

    const chartData = revenueData.map((d) => ({
        month: `Tháng ${d.month}`,
        revenue: d.revenue,
    }));

    const chartConfig: ChartConfig = {
        revenue: {
            label: "Doanh thu",
            color: "hsl(var(--chart-1))",
        },
    };

    const formatNumber = (num: number) => {
        let formattedNum: string;
        let divisor: number;
        let suffix: string;

        if (num >= 1_000_000_000) {
            divisor = 1_000_000_000;
            suffix = "b";
        } else if (num >= 1_000_000) {
            divisor = 1_000_000;
            suffix = "m";
        } else if (num >= 1_000) {
            divisor = 1_000;
            suffix = "k";
        } else {
            divisor = 1;
            suffix = "";
        }

        const result = num / divisor;
        if (Number.isInteger(result)) {
            formattedNum = result.toString();
        } else {
            formattedNum = result.toFixed(1);
        }

        return `${formattedNum}${suffix} VND`;
    };

    const formatPrice = (num: number) => {
        return `+${num.toLocaleString("vi-VN")} VND`;
    };

    return (
        <main className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Tổng đơn hàng</CardTitle>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalOrders ?? "Loading..."}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Tổng nhà cung cấp</CardTitle>
                        <Truck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalSuppliers ?? "Loading..."}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Tổng sản phẩm</CardTitle>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalProducts ?? "Loading..."}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Tổng khách hàng</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalCustomers ?? "Loading..."}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-[420px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Nhân viên đã duyệt hóa đơn</CardTitle>
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="relative z-10 flex items-center gap-4">
                                <Select onValueChange={(value) => setFilterMode(value as "all" | "specific")} defaultValue="all">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chọn chế độ lọc" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50">
                                        <SelectItem value="all">Tất cả hóa đơn</SelectItem>
                                        <SelectItem value="specific">Hóa đơn trong tháng cụ thể</SelectItem>
                                    </SelectContent>
                                </Select>
                                {filterMode === "specific" && (
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="border rounded-md p-2"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Có {approvedOrders.length} hóa đơn đã được duyệt (chưa bị hủy).
                            </p>
                            <div className="flex-1 max-h-[240px] overflow-y-auto space-y-4">
                                {Array.isArray(approvedOrders) && approvedOrders.length > 0 ? (
                                    approvedOrders.map((order, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src="" alt={`${order.firstName} ${order.lastName}`} />
                                                    <AvatarFallback>
                                                        {order.firstName[0]}
                                                        {order.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {order.firstName} {order.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{order.email}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-green-600">
                                                {formatPrice(order.totalPrice)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground">
                                        Không có hóa đơn nào đã được duyệt hoặc tất cả đã bị hủy.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-[420px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="whitespace-nowrap">Doanh thu theo tháng</CardTitle>
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer config={chartConfig} className="h-[270px] w-full">
                            <RechartsBarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => formatNumber(value)} width={80} tickMargin={10} />
                                <Tooltip formatter={(value: number) => [formatNumber(value), "Doanh thu"]} />
                                <Legend />
                                <Bar dataKey="revenue" fill={chartConfig.revenue.color} name="Doanh thu" />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardDescription className="text-center text-sm text-muted-foreground p-4">
                        Chú thích: 1k = 1.000, 1m = 1.000.000, 1b = 1.000.000.000
                    </CardDescription>
                </Card>
            </div>
        </main>
    );
}