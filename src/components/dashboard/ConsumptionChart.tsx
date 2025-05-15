
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Fonction pour formater les valeurs monétaires en MAD
const formatMAD = (value: number) => {
  return `${value.toLocaleString('fr-MA')} MAD`;
};
const SELECTED_GABS = ['210950010','211080015','211320015','211330014'];
interface ConsumptionChartProps {
  consumptionTrends: {
    dates: string[];
    data: {
      [gabId: string]: number[];
    };
  } | null;
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ consumptionTrends }) => {
  if (!consumptionTrends) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tendances de consommation sur 7 jours</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Données de consommation non disponibles</p>
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour le graphique
  const chartData = consumptionTrends.dates.map((date, index) => {
    const dataPoint: any = { date };
    
    Object.entries(consumptionTrends.data)
      .filter(([gabId]) => SELECTED_GABS.includes(gabId))
      .forEach(([gabId, values]) => {
        dataPoint[`GAB ${gabId}`] = values[index];
      });
    
    return dataPoint;
  });

  // Couleurs pour les lignes du graphique
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendances de consommation sur 7 jours</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatMAD(value)} />
            <Legend />
            {SELECTED_GABS.map((gabId, index) => (
              <Line 
                key={gabId}
                type="monotone"
                dataKey={`GAB ${gabId}`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConsumptionChart;
