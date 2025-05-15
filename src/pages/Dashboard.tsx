
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import KPICards from '@/components/dashboard/KPICards';
import CriticalAtmsTable from '@/components/dashboard/CriticalAtmsTable';
import ConsumptionChart from '@/components/dashboard/ConsumptionChart';
import InvestmentCharts from '@/components/dashboard/InvestmentCharts';

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
          const trends = await api.getConsumptionTrends(currentUploadId);
          setConsumptionTrends(trends);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger les données du dashboard.",
            variant: "destructive",
          });
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
        toast({
          title: "Téléchargement réussi",
          description: "Le fichier des résultats a été généré et téléchargé.",
        });
      } catch (error) {
        console.error('Error downloading results:', error);
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible de télécharger les résultats.",
          variant: "destructive",
        });
      }
    }
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
      <KPICards atmData={atmData} />
      
      {/* Critical ATMs Table */}
      <CriticalAtmsTable atmData={atmData} />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Trends Line Chart */}
        <ConsumptionChart consumptionTrends={consumptionTrends} />
        
        {/* Investment Charts (Bar and Pie) */}
        <InvestmentCharts atmData={atmData} />
      </div>
    </div>
  );
};

export default Dashboard;
