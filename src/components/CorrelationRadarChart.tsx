import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CorrelationRadarChartProps {
  radarData: any[];
  habitList: any[];
  chartMode: "top" | "specific";
  selectedHabitId: string;
  getCorrelationColor: (value: number) => string;
}

// Custom tooltip for radar chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mb-2">
          Correlation strengths
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {payload[0].payload &&
            Object.entries(payload[0].payload)
              .filter(([key]) => key !== "habit")
              .map(([key, value]: [string, any]) => {
                // Convert back to correlation value (-1 to 1)
                const correlationValue = (value as number) / 50 - 1;
                return (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-foreground truncate mr-2">{key}:</span>
                    <span
                      className={
                        correlationValue > 0
                          ? "text-green-500 font-medium"
                          : correlationValue < 0
                          ? "text-red-500 font-medium"
                          : "text-foreground"
                      }
                    >
                      {correlationValue.toFixed(2)}
                    </span>
                  </div>
                );
              })}
        </div>
      </div>
    );
  }
  return null;
};

const CorrelationRadarChart: React.FC<CorrelationRadarChartProps> = ({
  radarData,
  habitList,
  chartMode,
  selectedHabitId,
  getCorrelationColor,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-foreground">
          {chartMode === "top" 
            ? "Top Correlations Radar" 
            : selectedHabitId === "all" 
              ? "All Habits Correlation Radar" 
              : `Correlations for ${habitList.find(h => h.id === selectedHabitId)?.name || "Selected Habit"}`}
        </h3>
        <div className="text-xs text-muted-foreground">
          {radarData.length} habits shown
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="habit" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            {radarData.length > 0 && Object.keys(radarData[0])
              .filter(key => key !== "habit")
              .map((dataKey, index) => {
                // Find the habit object for this dataKey
                const habit = habitList.find(h => h.name === dataKey) || habitList[index % habitList.length];
                return (
                  <Radar
                    key={index}
                    name={dataKey}
                    dataKey={dataKey}
                    stroke={habit?.color || "#3B82F6"}
                    fill={habit?.color || "#3B82F6"}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                );
              })}
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              content={(props) => {
                if (!props.payload || props.payload.length === 0) return null;
                return (
                  <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                    {props.payload.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center text-xs">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-foreground truncate max-w-[100px]">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Radar chart showing correlation strengths between habits (0-100 scale)</p>
        <p className="mt-1">Values closer to 100 indicate stronger positive correlations</p>
      </div>
    </div>
  );
};

export default CorrelationRadarChart;