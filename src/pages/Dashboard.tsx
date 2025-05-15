
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { currentUploadId, atmData, setAtmData, isLoading, setIsLoading } = useAppContext();
  const [consumptionTrends, setConsumptionTrends] = useState<any>(null);

  useEffect(() => {
    if (currentUploadId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch ATM data based on the current upload
          const { atmData: fetchedAtmData } = await api.getDashboardData(currentUploadId);
          setAtmData(fetchedAtmData);
          
          // Fetch consumption trends
          const trends = await api.getConsumptionTrends();
          setConsumptionTrends(trends);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [currentUploadId, setAtmData, setIsLoading]);

  const handleDownload = async () => {
    if (currentUploadId) {
      try {
        await api.downloadResults(currentUploadId);
      } catch (error) {
        console.error('Error downloading results:', error);
      }
    }
  };

  // Calculate KPIs
  const criticalAtmsCount = atmData?.filter(atm => atm.nbrJour <= 3).length || 0;
  const totalInvestment = atmData?.reduce((sum, atm) => sum + (atm.aInvestir || 0), 0) || 0;

  // Prepare data for investment distribution pie chart
  const investmentRanges = [
    { name: '0 €', value: atmData?.filter(atm => !atm.aInvestir || atm.aInvestir === 0).length || 0 },
    { name: '1-1000 €', value: atmData?.filter(atm => atm.aInvestir && atm.aInvestir > 0 && atm.aInvestir <= 1000).length || 0 },
    { name: '1001-5000 €', value: atmData?.filter(atm => atm.aInvestir && atm.aInvestir > 1000 && atm.aInvestir <= 5000).length || 0 },
    { name: '5001+ €', value: atmData?.filter(atm => atm.aInvestir && atm.aInvestir > 5000).length || 0 },
  ];
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Prepare data for daily consumption line chart
  const prepareTrendsData = () => {
    if (!consumptionTrends) return [];
    
    return consumptionTrends.dates.map((date: string, index: number) => {
      const dataPoint: any = { date };
      
      Object.entries(consumptionTrends.data).forEach(([gabId, values]) => {
        dataPoint[`GAB ${gabId}`] = (values as number[])[index];
      });
      
      return dataPoint;
    });
  };
  
  // Prepare data for investment histogram
  const prepareInvestmentData = () => {
    if (!atmData) return [];
    
    return atmData
      .filter(atm => atm.aInvestir && atm.aInvestir > 0)
      .map(atm => ({
        name: `GAB ${atm.numeroGAB}`,
        investment: atm.aInvestir,
      }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!currentUploadId || !atmData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Aucun état chargé</h2>
          <p className="mb-6 text-muted-foreground">
            Veuillez importer un fichier d'état des GAB pour visualiser les analyses et recommandations.
          </p>
          <Button variant="default" asChild>
            <a href="/upload">Importer un fichier</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleDownload}>
          Télécharger les résultats
        </Button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              GABs Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{criticalAtmsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              GABs avec moins de 3 jours de trésorerie
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investissement Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInvestment.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total à investir sur les 7 prochains jours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consommation Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {atmData
                .reduce((sum, atm) => sum + (atm.consoMoyenne7j || 0), 0)
                .toLocaleString('fr-FR')} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Consommation moyenne sur 7 jours
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Critical ATMs Table */}
      <Card>
        <CardHeader>
          <CardTitle>GABs Critiques (Nbr JOUR ≤ 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Numero GAB</th>
                    <th className="py-3 px-4 text-left font-medium">Mon GAB</th>
                    <th className="py-3 px-4 text-left font-medium">Cash Disponible</th>
                    <th className="py-3 px-4 text-left font-medium">Nbr JOUR</th>
                    <th className="py-3 px-4 text-left font-medium">Conso moyenne 7j</th>
                    <th className="py-3 px-4 text-left font-medium">À investir</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {atmData
                    .filter(atm => atm.nbrJour <= 3)
                    .map(atm => (
                      <tr key={atm.numeroGAB} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">{atm.numeroGAB}</td>
                        <td className="py-3 px-4">{atm.nomGAB}</td>
                        <td className="py-3 px-4">{atm.cashDisponible.toLocaleString('fr-FR')} €</td>
                        <td className="py-3 px-4 font-medium" style={{ color: atm.nbrJour <= 1 ? 'var(--destructive)' : '' }}>
                          {atm.nbrJour.toFixed(1)}
                        </td>
                        <td className="py-3 px-4">{atm.consoMoyenne7j?.toLocaleString('fr-FR')} €</td>
                        <td className="py-3 px-4 font-medium" style={{ color: atm.aInvestir ? 'var(--accent)' : '' }}>
                          {(atm.aInvestir || 0).toLocaleString('fr-FR')} €
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Trends Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendances de consommation sur 7 jours</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareTrendsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
                <Legend />
                {consumptionTrends && Object.keys(consumptionTrends.data).map((gabId, index) => (
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
        
        {/* Investment Amounts Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Montants à investir</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareInvestmentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
                <Bar dataKey="investment" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Investment Distribution Pie Chart */}
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
      </div>
    </div>
  );
};

export default Dashboard;
