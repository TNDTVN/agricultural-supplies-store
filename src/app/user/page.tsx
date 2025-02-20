import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <main className="p-4">
      <a href="/admin">
        <Button>Trang Quản Trị</Button>
      </a>
      <Link href={"/user/Product"}>
      <Button>Product</Button>
      </Link>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
            <Card key={index}>
                <CardContent className="p-4">
                    <div className="relative w-full aspect-[4/4]">
                    <Image src="/file.svg" alt="Sản phẩm" fill className="object-cover rounded-lg" priority />
                    </div>
                    <h2 className="mt-2 text-lg font-semibold">Tên sản phẩm</h2>
                    <p className="text-sm text-gray-600">Mô tả sản phẩm ngắn...</p>
                <Button className="mt-2 w-full">Xem chi tiết</Button>
                </CardContent>
            </Card>
            ))}
        </div>
    </main>
  );
}
