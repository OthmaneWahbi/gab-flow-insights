
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { ATMData } from '@/context/AppContext';

// Fonction pour formater les valeurs monétaires en MAD
const formatMAD = (value: number) => {
  return `${value.toLocaleString('fr-MA')} MAD`;
};

interface InvestmentChartsProps {
  atmData: ATMData[];
}

const InvestmentCharts: React.FC<InvestmentChartsProps> = ({ atmData }) => {
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Préparer les données pour l'histogramme des montants à investir
  const investmentData = atmData
    .filter(atm => atm.aInvestir && atm.aInvestir > 0)
    .map(atm => ({
      name: `GAB ${atm.numeroGAB}`,
      investment: atm.aInvestir,
    }));
  
  // Préparer les données pour le graphique en camembert de répartition des GABs
  const investmentRanges = [
  {
    name: '0 MAD',
    value: atmData.filter(atm => atm.aInvestir === 0).length
  },
  {
    name: '1-600 000 MAD',
    value: atmData.filter(atm => atm.aInvestir > 1 && atm.aInvestir <= 600_000).length
  },
  {
    name: '600 001-1 200 000 MAD',
    value: atmData.filter(atm => atm.aInvestir > 600_000 && atm.aInvestir <= 1_200_000).length
  },
  {
    name: '1 200 001+ MAD',
    value: atmData.filter(atm => atm.aInvestir > 1_200_000).length
  }
];


  return (
    <>
      {/* Histogramme des montants à investir */}
      <Card>
        <CardHeader>
          <CardTitle>Montants à investir</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={investmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatMAD(value)} />
              <Bar dataKey="investment" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Camembert de répartition des GABs par investissement */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des GABs par investissement</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={investmentRanges}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                paddingAngle={2}
                outerRadius={80}
                dataKey="value"
              >
                {investmentRanges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} GAB(s)`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default InvestmentCharts;
