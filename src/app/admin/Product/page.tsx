import { Button } from "@/components/ui/button";
import Link from "next/link";

const A = () => {
    return (
        <main>
            <div>Product</div>
            <Link href="/admin">
                <Button>Về</Button>
            </Link>
        </main>
    );
};
export default A