import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

const BAR_COLOR = "#00e6a8";
const BAR_COLOR_HIGH = "#ff5555";

function ExposureBreakdown({ breakdown }) {

    if (!breakdown || breakdown.length === 0) return null;

    const data = [...breakdown]
        .sort((a, b) => b.weight - a.weight)
        .map((item) => ({
            category:
                item.category.charAt(0).toUpperCase() +
                item.category.slice(1),
            weight: item.weight,
            share: item.share,
        }));

    return (
        <div className="exposure-chart">
            <ResponsiveContainer width="100%" height={Math.max(data.length * 34, 120)}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                >
                    <XAxis type="number" hide domain={[0, "dataMax + 5"]} />
                    <YAxis
                        type="category"
                        dataKey="category"
                        width={90}
                        tick={{ fill: "#8496a0", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(0,230,168,0.06)" }}
                        contentStyle={{
                            background: "#0b1216",
                            border: "1px solid #1b272d",
                            borderRadius: 6,
                            fontSize: 11,
                        }}
                        formatter={(value, name, props) => [
                            `${value} pts (${props.payload.share}% of total)`,
                            "Contribution",
                        ]}
                    />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={14}>
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={entry.weight >= 25 ? BAR_COLOR_HIGH : BAR_COLOR}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ExposureBreakdown;
