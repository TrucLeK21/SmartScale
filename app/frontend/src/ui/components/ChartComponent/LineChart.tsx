'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  // CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: "2025-07-01", avg_bmi: 23.4, total_measurements: 50 },
  { date: "2025-07-02", avg_bmi: 23.6, total_measurements: 55 },
  { date: "2025-07-03", avg_bmi: 24.1, total_measurements: 62 },
  { date: "2025-07-04", avg_bmi: 23.9, total_measurements: 58 },
  { date: "2025-07-05", avg_bmi: 24.3, total_measurements: 64 },
  { date: "2025-07-06", avg_bmi: 24.5, total_measurements: 70 },
  { date: "2025-07-07", avg_bmi: 24.2, total_measurements: 66 },
];

type CustomTooltipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-dark text-white rounded">
        <p className="fw-bold mb-1">Ngày: {label}</p>
        <p className="mb-1 text-warning">
          BMI trung bình: <span className="ms-2">{payload[0].value}</span>
        </p>
        <p className="mb-0 text-info">
          Lượt đo: <span className="ms-2">{payload[1].value}</span>
        </p>
      </div>
    );
  }

  return null;
};

const LineChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ right: 30 }}>
        {/* <CartesianGrid stroke="#ccc" strokeDasharray="3 3" /> */}
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(dateStr) => new Date(dateStr).getDate().toString()}
          stroke="#ffffff"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          stroke="#ffffff" 
          tick={{ dx: -20, fill: "#ffffff", fontSize: 12 }}
          
          />
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
        <Legend />
        <Line type="monotone" dataKey="avg_bmi" stroke="#FFD700" strokeWidth={2} name="BMI Trung bình" />
        <Line type="monotone" dataKey="total_measurements" stroke="#00E5FF" strokeWidth={2} name="Lượt đo" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
