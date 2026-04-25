import { cookies } from "next/headers";

export async function POST(req) {
    const { username, password } = await req.json();

    if (username === "admin" && password === "admin123") {
        const cookieStore = await cookies();

        cookieStore.set("user", username, {
            httpOnly: true,
            path: "/",
        });

        return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 });
}