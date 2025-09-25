import React from "react";
import { useHabitStore } from "../stores/habitStore";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";

interface CorrelationMatrixProps {
  correlationMatrix: number[][];
  habitList: any[];
  getCorrelationColor: (value: number) => string;
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  correlationMatrix,
  habitList,
  getCorrelationColor,
}) => {
  return (
    <div className="mb-8">
      <h3 className="font-medium text-foreground mb-3">Correlation Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs text-muted-foreground p-2"></th>
              {habitList.map((habit) => (
                <th
                  key={habit.id}
                  className="text-center text-xs text-muted-foreground p-2 transform -rotate-45 origin-center"
                  style={{ minWidth: "40px" }}
                >
                  <div className="flex items-center justify-center">
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor: habit.color || "#3B82F6",
                      }}
                    ></span>
                    {habit.name.substring(0, 3)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correlationMatrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="text-left text-xs text-muted-foreground p-2">
                  <div className="flex items-center">
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          habitList[rowIndex].color || "#3B82F6",
                      }}
                    ></span>
                    {habitList[rowIndex].name.substring(0, 3)}
                  </div>
                </td>
                {row.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className={`text-center p-2 text-xs font-medium ${
                      rowIndex === colIndex
                        ? "bg-primary/10"
                        : Math.abs(value) > 0.5
                        ? "bg-secondary"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${getCorrelationColor(
                        value
                      )}`}
                    >
                      {rowIndex !== colIndex ? value.toFixed(1) : "-"}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CorrelationMatrix;