import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4 flex justify-center">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 w-full px-8 md:px-16 lg:px-32">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="w-full flex justify-center">
            <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden w-[250px] h-[340px] relative group">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative w-[250px] h-[250px]">
                  <Image src="/file.svg" alt="Sản phẩm" fill className="object-cover rounded-lg" priority />
                </div>
                <h2 className="mt-3 text-lg font-semibold">Tên sản phẩm</h2>
                <p className="text-red-500 font-bold text-base mt-1">1,000,000 VND</p>
                  <Button className="w-full bottom-0 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute">
                      <Link href={"/user/product"} className="w-full">Thêm vào giỏ hàng</Link>
                  </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
