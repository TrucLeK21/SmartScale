'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';


type LineChartComponentProps = {
  data: ChartData[];
  title: string;
  unit?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string | number;
  unit?: string;
  mode: 'daily' | 'monthly';
};

const CustomTooltip = ({ active, payload, label, unit, mode }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const d = new Date(label as string);
    const formattedLabel =
      mode === 'monthly'
        ? `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`
        : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    return (
      <div className="p-3 bg-dark text-white rounded">
        <p className="fw-bold mb-1">Ngày: {formattedLabel}</p>
        <p className="mb-1 text-info">
          {payload[0].name}:
          <span className="ms-2">{payload[0].value} {unit || ''}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Hàm lấy ra tối đa n điểm đều nhau
const sampleData = (data: ChartData[], n: number): ChartData[] => {
  if (data.length <= n) return data;
  const step = data.length / n;
  return Array.from({ length: n }, (_, i) => data[Math.floor(i * step)]);
};

const LineChartComponent = ({ data, title, unit }: LineChartComponentProps) => {
  if (!data || data.length === 0) return null;

  // Kiểm tra dữ liệu có trải dài nhiều tháng không
  const months = new Set(data.map(d => new Date(d.date).getMonth()));
  const mode: 'daily' | 'monthly' = months.size > 1 ? 'monthly' : 'daily';

  let processedData: ChartData[];

  if (mode === 'monthly') {
    // Gom theo tháng và tính trung bình
    const grouped = data.reduce<Record<string, { total: number; count: number; date: string }>>(
      (acc, cur) => {
        const d = new Date(cur.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!acc[key]) {
          acc[key] = {
            total: 0,
            count: 0,
            date: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
          };
        }
        acc[key].total += cur.value;
        acc[key].count += 1;
        return acc;
      },
      {}
    );

    processedData = Object.values(grouped).map(item => ({
      date: item.date,
      value: item.total / item.count,
    }));
  } else {
    // Daily mode -> lấy 15 điểm đều trong tháng
    processedData = sampleData(data, 15);
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={processedData} margin={{ right: 30 }} className='line-chart'>
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          stroke="#ffffff"
          tickFormatter={(dateStr) => {
            const d = new Date(dateStr);
            return mode === 'monthly'
              ? `T${d.getMonth() + 1}` // hiển thị tháng
              : `${d.getDate()}`; // hiển thị ngày
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          stroke="#ffffff"
          tick={{ dx: -20, fill: "#ffffff", fontSize: 12 }}
        />
        <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} mode={mode} />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#14AE8B"
          strokeWidth={2}
          name={`${title} trung bình (${unit})`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
