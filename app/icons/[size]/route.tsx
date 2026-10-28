import { appIcon } from "@/lib/app-icon";

const SIZES = ["192", "512"];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_: Request, { params }: RouteContext<"/icons/[size]">) {
  const { size } = await params;
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  return appIcon(Number(size));
}
