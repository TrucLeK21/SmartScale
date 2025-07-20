


import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type BmiGroupData = {
    name: string;
    value: number;
};

const bmiGroupData: BmiGroupData[] = [
    { name: "Gầy (<18.5)", value: 8 },
    { name: "Bình thường (18.5 - 24.9)", value: 95 },
    { name: "Thừa cân (25 - 29.9)", value: 60 },
    { name: "Béo phì (>=30)", value: 27 }
];
const COLORS = ["#90cdf4", "#68d391", "#f6ad55", "#f56565"];


const PieChartComponent: React.FC = () => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={bmiGroupData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                >
                    {bmiGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                />

            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartComponent;
