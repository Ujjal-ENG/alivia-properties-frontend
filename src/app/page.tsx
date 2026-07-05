// TEMP: root path renders the construction marketplace directly under the root
// layout (the marketplace component renders its own footer). Restore the landing
// page by moving (site)/landing.tsx back to (site)/page.tsx and deleting this file.
import MarketplacePage, { metadata } from "@/app/marketplace/page";

export const dynamic = "force-dynamic";
export { metadata };
export default MarketplacePage;
