import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export default function HomeAdmim() {
    return (
        <main className="p-4">
        <div className="mb-4 flex justify-between">
            <div className="w-1/2 flex items-center space-x-2">
            <Input placeholder="Tìm kiếm sản phẩm..." className="flex-1" />
            <Button>Tìm</Button>
            </div>
            <Button>Thêm sản phẩm</Button>
        </div>
                <div className="mt-6">
                    <h2 className="mb-2 text-xl font-semibold">Đơn hàng gần đây</h2>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>#{index + 1}</TableCell>
                            <TableCell>Nguyễn Văn A</TableCell>
                            <TableCell>1.000.000₫</TableCell>
                            <TableCell className="text-green-600">Hoàn thành</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
        </main>
    );
}
