'use client';

import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function CustomSidebarTrigger() {
    const { toggleSidebar } = useSidebar();

    return (
        <button onClick={toggleSidebar} className="w-10 h-10 text-white cursor-pointer">
            <Menu className="w-full h-full" />
        </button>
    );
}
