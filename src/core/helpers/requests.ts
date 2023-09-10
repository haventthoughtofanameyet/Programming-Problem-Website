import { z } from "zod";
import { Job } from "@prisma/client";

const testCodeResponseObject = z.object({
    success: z.literal(true),
    detail: z.string(),
    jobID: z.string().uuid(),
});

const getJobStatusResponseObject = z.object({
    success: z.literal(true),
    completed: z.boolean(),
});

export async function testCode(
    code: string,
    id: string,
    mode: "run" | "submit"
) {
    let response;
    try {
        response = await new Promise((resolve, reject) => {
            fetch("https://rce.fusionsid.xyz/testcode", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code,
                    problem_id: id,
                    mode: mode,
                }),
                cache: "no-store",
            })
                .then((response) => response.json())
                .then((json) => resolve(json))
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (err) {
        return console.log("FAILED TO QUEUE JOB", err);
    }
    const parsedResponse = testCodeResponseObject.safeParse(response);
    if (!parsedResponse.success) {
        return console.log("FAILED TO FIND PROBLEM", response);
    }
    return parsedResponse.data.jobID;
}

export async function getJob(id: string) {
    let response;
    try {
        response = await new Promise((resolve, reject) => {
            fetch(`/api/jobs?id=${id}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            })
                .then((response) => response.json())
                .then((json) => resolve(json))
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (err) {
        return console.log("FAILED TO MAKE GET JOB REQUEST", err);
    }

    return response;
}

export async function getJobStatus(id: string): Promise<boolean | void> {
    let response;
    try {
        response = await new Promise((resolve, reject) => {
            fetch(`/api/job_status?id=${id}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            })
                .then((response) => response.json())
                .then((json) => resolve(json))
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (err) {
        return console.log("FAILED TO MAKE FETCH JOB STATUS REQUEST", err);
    }

    const parsedResponse = getJobStatusResponseObject.safeParse(response);
    if (!parsedResponse.success) {
        return console.log("FAILED TO FETCH JOB STATUS", response);
    }
    return parsedResponse.data.completed;
}
