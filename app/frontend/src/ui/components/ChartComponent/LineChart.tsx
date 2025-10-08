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

type ChartData = {
  date: string; // ISO date
  value: number;
};

type LineChartComponentProps = {
  data: ChartData[];
  title: string;
  unit?: string;
  mode: 'day' | 'month' | 'year'; // <-- thêm props
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string | number;
  unit?: string;
  mode: 'day' | 'month' | 'year';
};

const CustomTooltip = ({ active, payload, label, unit, mode }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const d = new Date(label as string);

    let formattedLabel = '';
    if (mode === 'year') {
      formattedLabel = `Năm ${d.getFullYear()}`;
    } else if (mode === 'month') {
      formattedLabel = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    } else {
      formattedLabel = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    return (
      <div className="p-3 bg-dark text-white rounded">
        <p className="fw-bold mb-1">{formattedLabel}</p>
        <p className="mb-1 text-info">
          {payload[0].name}:
          <span className="ms-2">
            {payload[0].value} {unit || ''}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// Hàm lấy ra tối đa n điểm đều nhau
const sampleData = (data: ChartData[], n: number): ChartData[] => {
  if (data.length <= n) return data.map(d => ({
    ...d,
    value: parseFloat(d.value.toFixed(2))
  }));

  const step = data.length / n;
  return Array.from({ length: n }, (_, i) => {
    const point = data[Math.floor(i * step)];
    return {
      ...point,
      value: parseFloat(point.value.toFixed(2)),
    };
  });
};


const LineChartComponent = ({ data, title, unit, mode }: LineChartComponentProps) => {
  if (!data || data.length === 0) return null;

  let processedData: ChartData[] = [];

  if (mode === 'month') {
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
      value: parseFloat((item.total / item.count).toFixed(2)),
    }));

  } else if (mode === 'year') {
    // Gom theo năm và tính trung bình
    const grouped = data.reduce<Record<string, { total: number; count: number; date: string }>>(
      (acc, cur) => {
        const d = new Date(cur.date);
        const key = `${d.getFullYear()}`;
        if (!acc[key]) {
          acc[key] = {
            total: 0,
            count: 0,
            date: new Date(d.getFullYear(), 0, 1).toISOString(),
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
      value: parseFloat((item.total / item.count).toFixed(2)),
    }));

  } else {
    // Daily mode -> lấy 15 điểm đều trong tháng
    processedData = sampleData(data, 30);
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={processedData} margin={{ right: 30 }} className="line-chart">
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          stroke="#ffffff"
          tickFormatter={(dateStr) => {
            const d = new Date(dateStr);
            if (mode === 'year') return `${d.getFullYear()}`;
            if (mode === 'month') return `T${d.getMonth() + 1}`;
            return `${d.getDate()}`;
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
          name={`${title}${unit ? ` (${unit})` : ''}`}

        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
