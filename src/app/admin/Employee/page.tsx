"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Employee } from "@/types/employee";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { EmployeeModal } from "./EmployeeModal";

interface ColumnVisibilityToggleProps {
    table: ReturnType<typeof useReactTable<Employee>>;
}

const ColumnVisibilityToggle: React.FC<ColumnVisibilityToggleProps> = ({ table }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
                Cột <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                        {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

interface PageSizeSelectorProps {
    pageSize: number;
    setPageSize: (size: number) => void;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ pageSize, setPageSize }) => {
    const pageSizeOptions = [5, 10, 15, 20];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    {pageSize} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {pageSizeOptions.map((size) => (
                    <DropdownMenuItem key={size} onClick={() => setPageSize(size)}>
                        {size}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const formatDateToDDMMYYYY = (dateStr: string | undefined): string => {
    if (!dateStr) return "Không có";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

interface EmployeeDetailProps {
    employeeID: string;
    open: boolean;
    onClose: () => void;
    setEditEmployee: (employee: Employee) => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employeeID, open, onClose, setEditEmployee }) => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (employeeID && open) {
            fetchEmployee();
        }
    }, [employeeID, open]);

    const fetchEmployee = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/employees/${employeeID}`);
            if (!response.ok) throw new Error("Không thể lấy thông tin nhân viên");
            const data: Employee = await response.json();
            console.log("Employee detail response:", data); // Debug response
            setEmployee(data);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Chi Tiết Nhân Viên</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="text-center py-4">Đang tải...</div>
                ) : error || !employee ? (
                    <div className="text-center py-4">
                        <p className="text-red-500">{error || "Không tìm thấy nhân viên"}</p>
                        <Button className="mt-4" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold">ID Nhân viên</label>
                                    <p>{employee.employeeID}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Họ tên</label>
                                    <p>{employee.firstName} {employee.lastName}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Ngày sinh</label>
                                    <p>{formatDateToDDMMYYYY(employee.birthDate)}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Ngày tuyển dụng</label>
                                    <p>{formatDateToDDMMYYYY(employee.hireDate)}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold">Email</label>
                                    <p>{employee.email || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Số điện thoại</label>
                                    <p>{employee.phone || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Địa chỉ</label>
                                    <p>{employee.address || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Trạng thái tài khoản</label>
                                    <p>{employee.locked ? "Đã khóa" : "Hoạt động"}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Vai trò</label>
                                    <p>{employee.role || "Không có"}</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-6 flex justify-center space-x-4">
                            <Button
                                onClick={() => {
                                    setEditEmployee(employee);
                                    onClose();
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default function EmployeeIndex() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState<Employee | undefined>(undefined);

    useEffect(() => {
        fetchEmployees(currentPage);
    }, [currentPage, sorting, pageSize]);

    const fetchEmployees = async (page: number) => {
        try {
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/employees?page=${page}&size=${pageSize}${sortParam}`
            );
            if (!response.ok) throw new Error("Không thể lấy danh sách nhân viên");
            const data = await response.json();
            console.log("Employees list response:", data.content); // Debug response
            setEmployees(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Có lỗi xảy ra khi tải danh sách nhân viên!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSearch = async () => {
        try {
            if (!searchTerm.trim()) {
                fetchEmployees(1);
                setCurrentPage(1);
                return;
            }
            const sortParam =
                sorting.length > 0
                    ? `&sort=${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                    : "";
            const response = await fetch(
                `http://localhost:8080/employees/search?name=${encodeURIComponent(
                    searchTerm
                )}&page=1&size=${pageSize}${sortParam}`
            );
            if (!response.ok) throw new Error("Không thể tìm kiếm nhân viên");
            const data = await response.json();
            setEmployees(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching employees:", error);
            toast.error("Có lỗi xảy ra khi tìm kiếm nhân viên!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const lockEmployee = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn khóa tài khoản nhân viên này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/employees/${id}/lock`, {
                method: "POST",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể khóa tài khoản");
            }
            toast.success("Khóa tài khoản nhân viên thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            // Đồng bộ lại dữ liệu từ server
            await fetchEmployees(currentPage);
            // Cập nhật lại modal nếu đang mở
            if (selectedEmployeeId === id.toString()) {
                const detailResponse = await fetch(`http://localhost:8080/employees/${id}`);
                const updatedEmployee = await detailResponse.json();
                setEmployees((prev) =>
                    prev.map((emp) => (emp.employeeID === id ? updatedEmployee : emp))
                );
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi khóa tài khoản nhân viên!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const unlockEmployee = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn mở khóa tài khoản nhân viên này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/employees/${id}/unlock`, {
                method: "POST",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể mở khóa tài khoản");
            }
            toast.success("Mở khóa tài khoản nhân viên thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            // Đồng bộ lại dữ liệu từ server
            await fetchEmployees(currentPage);
            // Cập nhật lại modal nếu đang mở
            if (selectedEmployeeId === id.toString()) {
                const detailResponse = await fetch(`http://localhost:8080/employees/${id}`);
                const updatedEmployee = await detailResponse.json();
                setEmployees((prev) =>
                    prev.map((emp) => (emp.employeeID === id ? updatedEmployee : emp))
                );
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi mở khóa tài khoản nhân viên!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const deleteEmployee = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
        try {
            const response = await fetch(`http://localhost:8080/employees/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể xóa nhân viên");
            }
            toast.success("Xóa nhân viên thành công!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchEmployees(currentPage);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi xóa nhân viên!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const refreshEmployees = () => {
        fetchEmployees(currentPage);
    };

    const columns: ColumnDef<Employee>[] = useMemo(
        () => [
            {
                accessorFn: (_row: Employee, index: number) => (currentPage - 1) * pageSize + index + 1,
                id: "stt",
                header: "STT",
                enableSorting: false,
            },
            {
                accessorKey: "employeeID",
                header: "ID",
                enableSorting: true,
            },
            {
                accessorKey: "firstName",
                header: "Họ",
                enableSorting: true,
            },
            {
                accessorKey: "lastName",
                header: "Tên",
                enableSorting: true,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => row.original.email || "Không có",
                enableSorting: false,
            },
            {
                accessorKey: "phone",
                header: "Số điện thoại",
                cell: ({ row }) => row.original.phone || "Không có",
                enableSorting: false,
            },
            {
                accessorKey: "role",
                header: "Vai trò",
                cell: ({ row }) => row.original.role || "Không có",
                enableSorting: true,
            },
            {
                accessorKey: "isLocked",
                header: "Trạng thái",
                cell: ({ row }) => (row.original.locked ? "Đã khóa" : "Hoạt động"),
                enableSorting: true,
            },
            {
                id: "actions",
                header: "Hành động",
                cell: ({ row }) => (
                    <>
                        <Button onClick={() => setEditEmployee(row.original)}>Sửa</Button>
                        <Button
                            className="ml-2 bg-cyan-500 hover:bg-cyan-700"
                            onClick={() => setSelectedEmployeeId(row.original.employeeID.toString())}
                        >
                            Chi tiết
                        </Button>
                        {row.original.role !== "ADMIN" && (
                            <>
                                {row.original.locked ? (
                                    <Button
                                        className="ml-2 bg-green-600 hover:bg-green-800"
                                        onClick={() => unlockEmployee(row.original.employeeID)}
                                    >
                                        Mở khóa
                                    </Button>
                                ) : (
                                    <Button
                                        className="ml-2 bg-orange-600 hover:bg-orange-800"
                                        onClick={() => lockEmployee(row.original.employeeID)}
                                    >
                                        Khóa
                                    </Button>
                                )}
                                {!row.original.locked && (
                                    <Button
                                        className="ml-2 bg-red-600 hover:bg-red-800"
                                        onClick={() => deleteEmployee(row.original.employeeID)}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                ),
                enableSorting: false,
            },
        ],
        [currentPage, pageSize]
    );

    const table = useReactTable({
        data: employees,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <main className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <div className="w-1/2 flex items-center space-x-2">
                    <Input
                        placeholder="Tìm kiếm nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Tìm</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)}>Thêm nhân viên</Button>
                    <ColumnVisibilityToggle table={table} />
                    <PageSizeSelector pageSize={pageSize} setPageSize={handlePageSizeChange} />
                </div>
            </div>

            <div className="mt-6">
                <h2 className="mb-2 text-3xl text-center font-semibold">Danh Sách Nhân Viên</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            onClick={
                                                header.column.getCanSort()
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                            className={`${header.column.getCanSort() ? "cursor-pointer" : ""} ${
                                                header.column.getIsSorted()
                                                    ? "bg-blue-100 text-blue-700"
                                                    : header.column.getCanSort()
                                                    ? "hover:bg-gray-100"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Trang trước
                    </Button>
                    <span>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Trang sau
                    </Button>
                </div>
            </div>

            <EmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refreshEmployees}
            />

            <EmployeeModal
                isOpen={!!editEmployee}
                onClose={() => setEditEmployee(undefined)}
                employee={editEmployee}
                onSuccess={refreshEmployees}
            />

            {selectedEmployeeId && (
                <EmployeeDetail
                    employeeID={selectedEmployeeId}
                    open={!!selectedEmployeeId}
                    onClose={() => setSelectedEmployeeId(null)}
                    setEditEmployee={setEditEmployee}
                />
            )}
        </main>
    );
}