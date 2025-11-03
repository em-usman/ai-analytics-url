import React from "react";
import RecentActivityItem from "../Home/recentActivity";
import StatCard from "../Home/statesData";
import { useGlobalData } from "../../../store/useGlobalData";
import type { Activity } from "../../../types";
import { useShallow } from "zustand/shallow";

const toolNameMap: Record<string, string> = {
  prompt_swot: "Competitor SWOT",
  prompt_trends: "Market Trend Forecast",
  prompt_sentiment: "Customer Sentiment",
  prompt_vision: "AI Vision: Brand Analysis",
  prompt_design: "Jewelry Design Concept",
  prompt_marketing: "Marketing Plan",
  prompt_redteam: "Red Team Analysis",
  prompt_seo: "SEO Content Strategy",
  prompt_pricing: "Pricing Strategy",
  prompt_copy: "Add Copy Generator",
};

const Dashboard: React.FC = () => {
  // Use useShallow to prevent infinite loop
  const {
    userProfile,
    customers,
    dashboardStats,
    recentActivity,
    error,
    isLoaded,
  } = useGlobalData(
    useShallow((state) => ({
      userProfile: state.userProfile,
      customers: state.customers,
      dashboardStats: state.dashboardStats,
      recentActivity: state.recentActivity,
      isLoading: state.isLoading,
      error: state.error,
      isLoaded: state.isLoaded,
    }))
  );

  const [showAll, setShowAll] = React.useState(false);
  const visibleActivities = showAll
    ? recentActivity
    : recentActivity.slice(0, 4);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="text-center">
          <p className="font-medium text-red-400">Failed to load dashboard</p>
          <p className="mt-1 text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const StatCardSkeleton = () => (
    <div className="bg-[var(--bg-secondary)] p-5 rounded-lg border border-[var(--border-color)] animate-pulse">
      <div className="h-4 bg-gray-700  rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-gray-700  rounded w-1/2"></div>
    </div>
  );

  // Skeleton for Recent Activity Item
  const ActivityItemSkeleton = () => (
    <li className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0 flex-grow">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
      </div>
    </li>
  );

  return (
    <div className="flex-grow p-6 pt-4 md:p-8 overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold mb-2">
        Welcome,{" "}
        {!isLoaded ? (
          <span className="h-8 w-24 inline-block bg-gray-700 rounded animate-pulse align-middle"></span>
        ) : (
          <span>{userProfile?.name ?? "User"}</span>
        )}
      </h1>
      <p className="text-[var(--text-secondary)] mb-6 md:mb-8">
        Overview of your AI Command Center.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {!isLoaded ? (
          // ✅ Show skeletons while loading
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          // ✅ Show real data when loaded
          <>
            <StatCard
              title="Active Customers"
              value={dashboardStats?.activeCustomers ?? "--"}
            />
            <StatCard
              title="Prompts in Library"
              value={dashboardStats?.promptsInLibrary ?? "--"}
            />
            <StatCard
              title="Total Analyses Run"
              value={dashboardStats?.reportsGenerated ?? "--"}
            />
          </>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
        Recent Activity
      </h2>

      <div className="bg-[var(--bg-secondary)] rounded-lg shadow border border-[var(--border-color)] overflow-hidden">
        {!isLoaded ? (
          // ✅ Skeleton activity list
          <ul className="divide-y divide-[var(--border-color)]">
            {[...Array(4)].map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </ul>
        ) : recentActivity.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-secondary)]">
            No recent activity.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[var(--border-color)]">
              {visibleActivities.map((item: Activity) => (
                <RecentActivityItem
                  key={item.id}
                  activity={item}
                  customers={customers}
                  toolNameMap={toolNameMap}
                />
              ))}
            </ul>

            {recentActivity.length > 4 && (
              <div className="text-center py-3 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-sm font-semibold text-[var(--accent-active)] hover:underline focus:outline-none transition-colors"
                >
                  {showAll ? "Show Less Activity" : "Show More Activity"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
