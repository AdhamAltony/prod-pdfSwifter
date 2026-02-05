import ToolsPageView from "@/features/utilities/ui/ToolsPageView";
import { getAllowedToolKeys } from "@/lib/utilities/tools-policy";

export const metadata = {
  title: "All utilities | pdfSwifter",
  description:
    "Browse every pdfSwifter utility by tier and category. Convert, compress, rotate, and download with a clean workflow.",
};
export const dynamic = "force-dynamic";

export default async function UtilitiesPage() {
  const allowedToolKeys = await getAllowedToolKeys();
  return <ToolsPageView allowedToolKeys={allowedToolKeys} />;
}
