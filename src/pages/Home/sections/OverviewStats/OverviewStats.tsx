import { useEffect, useState, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Package, Users, Building2 } from "lucide-react";
import { getOverviewStats, type OverviewStats as OverviewStatsType } from "../../../../services/dashboardService";

interface StatItem {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  delay: number;
}

const OverviewStats = () => {
  const { t } = useTranslation();
  const [countedValues, setCountedValues] = useState({
    products: 0,
    users: 0,
    companies: 0,
  });
  const [apiData, setApiData] = useState<OverviewStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fetch data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOverviewStats();
        setApiData(data);
      } catch (error) {
        console.error("Failed to fetch overview stats:", error);
        // Fallback values if API fails
        setApiData({ products: 0, users: 0, companies: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: t("home.stats.products"),
        value: apiData?.products ?? 0,
        icon: Package,
        iconColor: "text-secondary",
        delay: 0.1,
      },
      {
        title: t("home.stats.users"),
        value: apiData?.users ?? 0,
        icon: Users,
        iconColor: "text-secondary",
        delay: 0.2,
      },
      {
        title: t("home.stats.companies"),
        value: apiData?.companies ?? 0,
        icon: Building2,
        iconColor: "text-secondary",
        delay: 0.3,
      },
    ],
    [t, apiData]
  );

  // Animate counting numbers
  useEffect(() => {
    if (!isInView || isLoading || !apiData) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    const timers: ReturnType<typeof setInterval>[] = [];

    stats.forEach((stat, index) => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = stat.value;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easeOutQuart
        );

        setCountedValues((prev) => {
          const key =
            index === 0 ? "products" : index === 1 ? "users" : "companies";
          return { ...prev, [key]: currentValue };
        });

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, interval);

      timers.push(timer);
    });

    // Cleanup function
    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [isInView, isLoading, apiData, stats]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
      className="bg-[#3a4b95]/80 py-6 "
    >
      <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Separator Lines - Only visible on desktop */}
          <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-1 bg-secondary " />
          <div className="hidden md:block absolute left-2/3 top-0 bottom-0 w-1 bg-secondary " />

          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const currentValue =
              index === 0
                ? countedValues.products
                : index === 1
                  ? countedValues.users
                  : countedValues.companies;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.5,
                  delay: stat.delay,
                }}
                className="flex flex-col items-center justify-center text-center px-4 py-6 md:py-8"
              >
                {/* Title */}
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 md:mb-8">
                  {stat.title}
                </h3>

                <div className="flex items-center justify-center gap-3 md:gap-4">
                  <div className={stat.iconColor}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {stat.suffix}
                    {currentValue.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewStats;
