import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const cookieStore = await cookies();

    const user = cookieStore.get("user")?.value;

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transcripts = await prisma.transcript.findMany({
        where: {
            userId: user,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return Response.json(transcripts);
}