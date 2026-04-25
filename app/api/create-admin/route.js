import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const res = await auth.api.signUpEmail({
            body: {
                email: "admin@test.com",
                password: "admin12345",
                name: "Admin",
            },
        });

        return Response.json({
            message: "Admin created",
            user: res.user,
        });
    } catch (err) {
        return Response.json({
            error: err.message,
        });
    }
}