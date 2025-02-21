import { Button } from "@/components/ui/button";
import Link from "next/link";

const A = () => {
    return (
        <main>
            <div>Product</div>
            <Link href="/user">
                <Button>Về</Button>
            </Link>
        </main>
    );
};
export default A