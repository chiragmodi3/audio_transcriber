import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value;

    if (!user) {
        return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user });
}