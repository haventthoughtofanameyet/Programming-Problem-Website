import { z } from "zod";
import React from "react";
import { getServerSession } from "next-auth/next";

import prisma from "@/core/db/orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const page = async ({
    params,
}: {
    params: { solution_id: string; problem_id: string };
}) => {
    const session = await getServerSession(authOptions);
    if (!session) return <>NOT LOGGED IN</>;

    const isUUID =
        z.string().uuid().safeParse(params.solution_id).success &&
        z.string().uuid().safeParse(params.problem_id).success;

    if (!isUUID) {
        return <div>Not valid</div>;
    }

    const solution = await prisma.solution.findUnique({
        where: { id: params.solution_id },
    });
    const problem = await prisma.problem.findUnique({
        where: { id: params.problem_id },
    });
    if (!solution || !problem) {
        return <>404</>;
    }

    return (
        <div>
            <pre className="text-white">{JSON.stringify(solution)}</pre>
        </div>
    );
};

export default page;
