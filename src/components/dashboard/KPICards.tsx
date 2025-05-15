
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ATMData } from '@/context/AppContext';

// Fonction pour formater les valeurs monétaires en MAD
const formatMAD = (value: number) => {
  return `${value.toLocaleString('fr-MA')} MAD`;
};

interface KPICardsProps {
  atmData: ATMData[];
}

const KPICards: React.FC<KPICardsProps> = ({ atmData }) => {
  // Calculer les KPIs
  const criticalAtmsCount = atmData.filter(atm => atm.nbrJour <= 3).length;
  const totalInvestment = atmData.reduce((sum, atm) => sum + (atm.aInvestir || 0), 0);
  const averageConsumption = atmData.reduce((sum, atm) => sum + (atm.consoMoyenne7j || 0), 0);

  return (
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
          <div className="text-3xl font-bold">{formatMAD(totalInvestment)}</div>
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
          <div className="text-3xl font-bold">{formatMAD(averageConsumption)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Consommation moyenne sur 7 jours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
