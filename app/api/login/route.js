import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req) {
    const { email, password } = await req.json();

    const user = await prisma.admin.findFirst({
        where: { email, password },
    });

    if (!user) {
        return Response.json({ error: "Invalid login" }, { status: 401 });
    }

    const cookieStore = await cookies();

    cookieStore.set("user", user.email, {
        httpOnly: true,
        path: "/",
    });

    return Response.json({ success: true });
}