'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';



type BarChartComponentProps = {
    data: BMIGroupByGender[];
};

type CustomTooltipProps = {
    active?: boolean;
    payload?: { name?: string; value?: number }[];
    label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    backgroundColor: 'var(--sub-background-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
            >
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Nhóm tuổi: {label}
                </p>
                <p style={{ margin: '4px 0', color: '#14AE8B' }}>
                    BMI Nam: <span style={{ marginLeft: 4 }}>{payload[0]?.value}</span>
                </p>
                <p style={{ margin: '4px 0', color: '#FF79C6' }}>
                    BMI Nữ: <span style={{ marginLeft: 4 }}>{payload[1]?.value}</span>
                </p>
            </div>
        );
    }
    return null;
};

const BarChartComponent = ({ data }: BarChartComponentProps) => {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart
                className='chart-no-outline'
                data={data}
                margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis domain={[20, 26]} />
                <Tooltip trigger='click' content={<CustomTooltip />} />
                <Legend verticalAlign="top" />
                <Bar dataKey="maleBMI" name="Nam" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="femaleBMI" name="Nữ" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartComponent;
