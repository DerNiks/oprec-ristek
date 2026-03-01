"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

type Props = {
    spec: Record<string, unknown>;
};

export default function ReactSwagger({ spec }: Props) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <SwaggerUI spec={spec as any} />
    );
}
