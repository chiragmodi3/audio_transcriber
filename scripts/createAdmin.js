import { auth } from "../lib/auth.js";

async function createAdmin() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "admin@test.com",
        password: "admin12345",
        name: "Admin",
      },
    });

    console.log("✅ Admin created:", res.user);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

createAdmin();