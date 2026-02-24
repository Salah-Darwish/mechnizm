import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { getPublicSalesReport, type SalesDayData } from "../../../../services/salesReportService";

interface SalesData {
  day: string;
  storeSales: number;
  merchantSales: number;
}

// Format currency for tooltip (handles both small and large values)
const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ر.س`;
  }
  return `${value.toLocaleString()} ر.س`;
};

// Tooltip payload type
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

// Custom tooltip component - defined outside to avoid recreation on each render
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalesReport = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // API state
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sales data from API
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicSalesReport();

        // Transform API data to chart format
        const transformedData: SalesData[] = response.data.sales_data.map((item: SalesDayData) => ({
          day: isRTL ? t(`home.salesReport.days.${item.day.toLowerCase()}`) : item.day,
          storeSales: item.storeSales,
          merchantSales: item.merchantSales,
        }));

        setSalesData(transformedData);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError(isRTL ? "فشل في تحميل بيانات المبيعات" : "Failed to load sales data");

        // Fallback to sample data if API fails
        setSalesData([
          { day: t("home.salesReport.days.saturday"), storeSales: 250000, merchantSales: 0 },
          { day: t("home.salesReport.days.sunday"), storeSales: 50000, merchantSales: 400000 },
          { day: t("home.salesReport.days.monday"), storeSales: 466000, merchantSales: 450000 },
          { day: t("home.salesReport.days.tuesday"), storeSales: 50000, merchantSales: 350000 },
          { day: t("home.salesReport.days.wednesday"), storeSales: 300000, merchantSales: 480000 },
          { day: t("home.salesReport.days.thursday"), storeSales: 450000, merchantSales: 200000 },
          { day: t("home.salesReport.days.friday"), storeSales: 150000, merchantSales: 250000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [isRTL, t]);

  // Calculate dynamic Y-axis domain based on actual data
  const { maxValue, yAxisTicks, formatYAxisValue } = useMemo(() => {
    if (salesData.length === 0) {
      return { maxValue: 1000, yAxisTicks: [0, 250, 500, 750, 1000], formatYAxisValue: (v: number) => `${v}` };
    }

    // Find the maximum value in the data
    const allValues = salesData.flatMap(d => [d.storeSales, d.merchantSales]);
    const dataMax = Math.max(...allValues, 0);

    // Add 20% padding to the max for better visualization
    let calculatedMax = dataMax * 1.2;

    // Round up to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(calculatedMax || 1)));
    calculatedMax = Math.ceil(calculatedMax / magnitude) * magnitude;

    // Ensure minimum scale for visibility
    if (calculatedMax < 100) calculatedMax = 100;
    if (calculatedMax === 0) calculatedMax = 1000;

    // Generate nice tick values (5 ticks)
    const tickStep = calculatedMax / 4;
    const ticks = [0, tickStep, tickStep * 2, tickStep * 3, calculatedMax];

    // Format function based on the magnitude
    const formatValue = (value: number): string => {
      if (calculatedMax >= 100000) {
        return `${(value / 1000).toFixed(0)}K`;
      } else if (calculatedMax >= 1000) {
        return `${value.toLocaleString()}`;
      } else {
        return `${value}`;
      }
    };

    return { maxValue: calculatedMax, yAxisTicks: ticks, formatYAxisValue: formatValue };
  }, [salesData]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
      className="my-12 md:my-16 lg:my-20"
    >
      <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12  ">
          {/* Text Description Section */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={
              isInView
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: isRTL ? -50 : 50 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3a4b95] mb-6 text-center lg:text-right">
              {t("home.salesReport.title")}
            </h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed text-justify">
              {t("home.salesReport.description")}
            </p>
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={
              isInView
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: isRTL ? 50 : -50 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#3a4b95] mb-6 text-center lg:text-right">
              {t("home.salesReport.chartTitle")}
            </h3>
            <div className="rounded-xl shadow-xl mx-auto p-3 min-h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-12 h-12 text-[#3a4b95]" />
                  </motion.div>
                </div>
              ) : error && salesData.length === 0 ? (
                <div className="flex justify-center items-center h-[400px]">
                  <p className="text-gray-500 text-lg">{error}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={salesData}
                  //   margin={{ top: 20, right: 30, left: 50, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#666", fontSize: 12 }}
                      angle={45}
                      textAnchor="end"
                      // height={80}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      tick={{ fill: "#666", fontSize: 12 }}
                      label={{
                        value: "ر.س",
                        style: { textAnchor: "middle", fill: "#666" },
                      }}
                      domain={[0, maxValue]}
                      ticks={yAxisTicks}
                      tickFormatter={formatYAxisValue}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                      dataKey="storeSales"
                      fill="#c4886a"
                      radius={[4, 4, 0, 0]}
                      name={t("home.salesReport.storeSales")}
                    />
                    <Bar
                      dataKey="merchantSales"
                      fill="#3a4b95"
                      radius={[4, 4, 0, 0]}
                      name={t("home.salesReport.merchantSales")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default SalesReport;
