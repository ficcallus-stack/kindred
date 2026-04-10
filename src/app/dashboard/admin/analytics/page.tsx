import { getSafetyOpsData, getFinancialIntelData, getMarketplaceHealthData } from "./actions";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = 'force-dynamic';

export default async function AdvancedAnalyticsPage() {
  const [safetyData, financialData, marketplaceData] = await Promise.all([
    getSafetyOpsData(),
    getFinancialIntelData(),
    getMarketplaceHealthData()
  ]);

  return (
    <AnalyticsClient 
      safetyData={safetyData}
      financialData={financialData}
      marketplaceData={marketplaceData}
    />
  );
}
