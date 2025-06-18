import { useEffect, useState } from "react";
import apiHelper from "../../../utils/ApiHelper";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import Navbar from "../../components/Navbar";

ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const timePresets = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "3m": "Last 3 months",
    "12m": "Last 12 months",
    "3y": "Last 3 years",
};

const getStartDate = (range) => {
    const start = new Date();
    switch (range) {
        case "7d":
            start.setDate(start.getDate() - 7);
            break;
        case "30d":
            start.setDate(start.getDate() - 30);
            break;
        case "3m":
            start.setMonth(start.getMonth() - 3);
            break;
        case "12m":
            start.setFullYear(start.getFullYear() - 1);
            break;
        case "3y":
            start.setFullYear(start.getFullYear() - 3);
            break;
        default:
            start.setFullYear(start.getFullYear() - 3);
            break;
    }
    return start;
};


function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [range, setRange] = useState("7d");
    const [chartType, setChartType] = useState("bar");

    useEffect(() => {
        apiHelper
            .getAuthorization(`/dashboard?range=${range}`)
            .then((res) => {
                if (res.condition) setStats(res.stats);
            })
            .catch((err) => console.error("Failed to fetch stats", err));
    }, [range]);

    if (!stats) return <div className="p-4">Loading...</div>;

    const startDate = getStartDate(range);

    const today = new Date();

    const dayMap = {};
    stats.trends.data.forEach((d) => {
        dayMap[d.date] = d;
    });

    const fullTrend = [];
    const curDate = new Date(startDate);
    while (curDate <= today) {
        const key = curDate.toISOString().split("T")[0];
        fullTrend.push({
            date: key,
            spent: dayMap[key]?.spent || 0,
            gained: dayMap[key]?.gained || 0,
            items: dayMap[key]?.items || 0,
        });
        curDate.setDate(curDate.getDate() + 1);
    }

    const ChartComponent = chartType === "bar" ? Bar : Line;

    return (
        <div>
            <Navbar />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">📊 Dashboard</h1>

                {/* Range Buttons & Toggle */}

                {/* 💰 Money Stats */}
                <div>
                    <h2 className="font-semibold text-lg mb-2">💰 Money Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <StatCard title="Total Spent" value={stats.totals?.spent} isMoney />
                        <StatCard title="Total Gained" value={stats.totals?.gained} isMoney />
                        <StatCard title="Net Gain" value={stats.totals?.net_gain} isMoney />
                        <StatCard title="Shipping Fee" value={stats.totals?.shipping_fee} isMoney />
                        <StatCard title="Admin Fee" value={stats.totals?.admin_fee} isMoney />
                    </div>
                </div>

                {/* 📦 Item Stats */}
                <div>
                    <h2 className="font-semibold text-lg mt-6 mb-2">📦 Item Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <StatCard title="Items Bought" value={stats.totals?.items_bought} />
                        <StatCard title="Sales Count" value={stats.totals?.sales_count} />

                        <StatCard
                            title="Most Bought"
                            value={
                                stats.top_item?.name
                                    ? `${stats.top_item.name} (${stats.top_item.quantity})`
                                    : "-"
                            }
                        />
                    </div>
                </div>

                {/* 🆚 Monthly Comparison */}
                <div>
                    <h2 className="font-semibold text-lg mt-6 mb-2">📅 Monthly Comparison</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <CompareCard
                            title="Spent"
                            current={stats.comparison?.this_month.spent}
                            previous={stats.comparison?.last_month.spent}
                            isMoney
                        />
                        <CompareCard
                            title="Gained"
                            current={stats.comparison?.this_month.gained}
                            previous={stats.comparison?.last_month.gained}
                            isMoney
                        />
                        <CompareCard
                            title="Net Gain"
                            current={stats.comparison?.this_month.net_gain}
                            previous={stats.comparison?.last_month.net_gain}
                            isMoney
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                    {Object.entries(timePresets).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setRange(key)}
                            className={`px-3 py-1 rounded border text-sm ${
                                range === key ? "bg-blue-600 text-white" : "bg-gray-100"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                        className="px-3 py-1 text-sm border rounded bg-gray-200"
                    >
                        Toggle Chart Type
                    </button>
                </div>

                {/* 📈 Chart */}
                <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <div className="overflow-x-auto">
                        <div className="relative min-w-[600px] w-full h-[500px]">
                            <ChartComponent
                                data={{
                                    labels: fullTrend.map((d) => d.date),
                                    datasets: [
                                        {
                                            type: chartType,
                                            label: "Spent",
                                            data: fullTrend.map((d) => d.spent),
                                            borderColor: "rgba(255, 99, 132, 1)",
                                            backgroundColor:
                                                chartType === "bar"
                                                    ? "rgba(255, 99, 132, 0.6)"
                                                    : undefined,
                                            yAxisID: "y",
                                            fill: false,
                                            tension: 0.3,
                                        },
                                        {
                                            type: chartType,
                                            label: "Gained",
                                            data: fullTrend.map((d) => d.gained),
                                            borderColor: "rgba(75, 192, 192, 1)",
                                            backgroundColor:
                                                chartType === "bar"
                                                    ? "rgba(75, 192, 192, 0.6)"
                                                    : undefined,
                                            yAxisID: "y",
                                            fill: false,
                                            tension: 0.3,
                                        },
                                        {
                                            type: chartType,
                                            label: "Items Bought",
                                            data: fullTrend.map((d) => d.items),
                                            borderColor: "rgba(54, 162, 235, 1)",
                                            backgroundColor:
                                                chartType === "bar"
                                                    ? "rgba(54, 162, 235, 0.6)"
                                                    : undefined,
                                            yAxisID: "y1",
                                            fill: false,
                                            tension: 0.3,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    layout: { padding: 0 },
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: { font: { size: 12 } },
                                        },
                                        title: { display: false },
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                maxRotation: 30,
                                                minRotation: 0,
                                                autoSkip: true,
                                                maxTicksLimit: 10,
                                            },
                                            title: { display: true, text: "Date" },
                                        },
                                        y: {
                                            type: "linear",
                                            position: "left",
                                            title: { display: true, text: "IDR" },
                                            beginAtZero: true,
                                        },
                                        y1: {
                                            type: "linear",
                                            position: "right",
                                            title: { display: true, text: "Items Bought" },
                                            grid: { drawOnChartArea: false },
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Stat Card
function StatCard({ title, value, isMoney }) {
    const displayValue =
        value == null ? "-" : isMoney ? `Rp.${Number(value).toLocaleString("id-ID")}` : value;

    return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <div className="text-gray-500">{title}</div>
            <div className="text-xl font-semibold">{displayValue}</div>
        </div>
    );
}

// Comparison Card with % difference
function CompareCard({ title, current = 0, previous = 0, isMoney }) {
    const delta =
        previous === 0
            ? current === 0
                ? 0
                : 100
            : ((current - previous) / Math.abs(previous)) * 100;

    const isPositive = current >= previous;
    const arrow = isPositive ? "▲" : "▼";

    const formatted = (val) =>
        isMoney ? `Rp.${Number(val).toLocaleString("id-ID")}` : Number(val).toLocaleString("id-ID");

    return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <div className="text-gray-500">{title}</div>
            <div className="text-xl font-semibold">
                {formatted(current)}{" "}
                <span className={isPositive ? "text-green-600" : "text-red-500"}>
                    ({arrow} {Math.abs(delta).toFixed(1)}%)
                </span>
            </div>
            <div className="text-xs text-gray-400">Last month: {formatted(previous)}</div>
        </div>
    );
}

export default DashboardPage;
