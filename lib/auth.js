import { betterAuth } from "better-auth";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    database: prisma,

    emailAndPassword: {
        enabled: true,
    },

    baseURL: "http://localhost:3000",
});