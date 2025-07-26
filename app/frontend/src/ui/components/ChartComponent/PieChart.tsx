import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
type BmiGroupData = {
    name: string;
    value: number;
};

const bmiGroupData: BmiGroupData[] = [
    { name: "Gầy (<18.5)", value: 8 },
    { name: "Bình thường (18.5 - 24.9)", value: 95 },
    { name: "Thừa cân (25 - 29.9)", value: 60 },
    { name: "Béo phì (≥30)", value: 27 }
];

// 🎨 Màu pastel hiện đại cho dashboard sức khỏe
const COLORS = ["#63b3ed", "#48bb78", "#ed8936", "#e53e3e"];

const total = bmiGroupData.reduce((sum, entry) => sum + entry.value, 0);

type CustomLabelProps = {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    index?: number;
    name?: string;
};

const renderCustomizedLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
}: CustomLabelProps): React.ReactElement => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (

        <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>


    );
};

type PieTooltipProps = {
    active?: boolean;
    payload?: {
        name: string;
        value: number;
        percent: number;
        payload: {
            name: string;
            value: number;
        };
    }[];
};

const CustomTooltip = ({ active, payload }: PieTooltipProps): React.ReactElement | null => {
    if (active && payload && payload.length) {
        const { name, value } = payload[0];
        const percent = (value / total) * 100;

        return (
            <div
                className="p-3 bg-dark text-white rounded shadow-sm"
                style={{ minWidth: 160 }}
            >
                <p className="mb-1 fw-bold">{name}</p>
                <p className="mb-1">
                    👥 Số người: <span className="fw-semibold text-warning ms-1">{value}</span>
                </p>
                <p className="mb-0">
                    📊 Tỷ lệ:{" "}
                    <span className="fw-semibold text-info ms-1">
                        {percent.toFixed(1)}%
                    </span>
                </p>
            </div>
        );
    }

    return null;
};



const CustomLegend = () => {

    return (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bmiGroupData.map((entry, index) => {
                return (
                    <li key={`legend-${index}`} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: "50%",
                                marginRight: 8,
                            }}
                        />
                        <span style={{ fontSize: 12 }}>{entry.name}</span>
                    </li>
                );
            })}
        </ul>
    );
};


const PieChartComponent: React.FC = () => {
    const [showLegend, setShowLegend] = useState<boolean>(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 992) {
                setShowLegend(false);
            } else {
                setShowLegend(true);

            }

        };

        handleResize(); // Gọi ngay khi load
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (

        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={bmiGroupData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                    label={renderCustomizedLabel}

                >
                    {bmiGroupData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                    <Legend
                        content={<CustomLegend />}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, lineHeight: "20px" }}
                    />
                )}


            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartComponent;
