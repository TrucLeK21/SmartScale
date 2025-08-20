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
  CartesianGrid,
} from 'recharts';

type CustomTooltipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string | number;
};

type LineChartComponentProps = {
  data: ChartData[];
  title: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="p-3 bg-dark text-white rounded">
        <p className="fw-bold mb-1">Ngày: {label}</p>
        <p className="mb-1 text-warning">
          {payload[0].name}: <span className="ms-2">{payload[0].value}</span>
        </p>
      </div>
    );
  }

  return null;
};


const LineChartComponent = (
  { data, title }: LineChartComponentProps

) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ right: 30 }} >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false}/>
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
        <Line type="monotone" dataKey="value" stroke="#14AE8B" strokeWidth={2} name={`${title} trung bình`} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
