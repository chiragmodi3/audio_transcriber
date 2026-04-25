import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import axios from "axios";

const prisma = new PrismaClient();

export async function POST(req) {
    const cookieStore = await cookies();

    const user = cookieStore.get("user")?.value;

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }

        const MAX_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            return Response.json(
                { error: "Audio must be less than 1 minute" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const base64Audio = Buffer.from(bytes).toString("base64");

        let transcriptText = "";

        try {
            console.log("Trying Gemini...");

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: "Transcribe this audio. Return only text.",
                                    },
                                    {
                                        inline_data: {
                                            mime_type: file.type,
                                            data: base64Audio,
                                        },
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            const geminiData = await geminiRes.json();

            console.log("Gemini Response:", geminiData);

            transcriptText =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!transcriptText.trim()) {
                throw new Error("Gemini returned empty");
            }

            console.log("✅ Gemini Success");
        } catch (err) {
            console.log("❌ Gemini failed → switching to AssemblyAI");

            const buffer = Buffer.from(bytes);

            const uploadRes = await axios.post(
                "https://api.assemblyai.com/v2/upload",
                buffer,
                {
                    headers: {
                        authorization: process.env.ASSEMBLYAI_API_KEY,
                        "content-type": "application/octet-stream",
                    },
                }
            );

            const audio_url = uploadRes.data.upload_url;

            const transcriptRes = await axios.post(
                "https://api.assemblyai.com/v2/transcript",
                {
                    audio_url,
                    speech_models: ["universal-2"],
                },
                {
                    headers: {
                        authorization: process.env.ASSEMBLYAI_API_KEY,
                        "content-type": "application/json",
                    },
                }
            );

            const transcriptId = transcriptRes.data.id;

            while (true) {
                const polling = await axios.get(
                    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                    {
                        headers: {
                            authorization: process.env.ASSEMBLYAI_API_KEY,
                        },
                    }
                );

                if (polling.data.status === "completed") {
                    transcriptText = polling.data.text || "";
                    break;
                }

                if (polling.data.status === "error") {
                    throw new Error("AssemblyAI failed");
                }

                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            console.log("✅ AssemblyAI Success");
        }

        if (!transcriptText.trim()) {
            return Response.json(
                { error: "No transcript generated" },
                { status: 400 }
            );
        }

        await prisma.transcript.create({
            data: {
                text: transcriptText,
                userId: user,
            },
        });

        console.log("✅ SAVED:", transcriptText);

        return Response.json({ text: transcriptText });

    } catch (error) {
        console.error("TRANSCRIBE ERROR:", error);

        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}