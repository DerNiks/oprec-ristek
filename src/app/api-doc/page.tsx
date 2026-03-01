import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
    const spec = await getApiDocs();
    return (
        <div className="container mx-auto py-10">
            <section className="bg-white p-4 rounded-xl shadow-sm border">
                <ReactSwagger spec={spec} />
            </section>
        </div>
    );
}
