
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ATMData } from '@/context/AppContext';

// Fonction pour formater les valeurs monétaires en MAD
const formatMAD = (value: number) => {
  return `${value.toLocaleString('fr-MA')} MAD`;
};

interface CriticalAtmsTableProps {
  atmData: ATMData[];
}

const CriticalAtmsTable: React.FC<CriticalAtmsTableProps> = ({ atmData }) => {
  const criticalAtms = atmData.filter(atm => atm.nbrJour <= 3);

  return (
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
                {criticalAtms.map(atm => (
                  <tr key={atm.numeroGAB} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{atm.numeroGAB}</td>
                    <td className="py-3 px-4">{atm.nomGAB}</td>
                    <td className="py-3 px-4">{formatMAD(atm.cashDisponible)}</td>
                    <td className="py-3 px-4 font-medium" style={{ color: atm.nbrJour <= 1 ? 'var(--destructive)' : '' }}>
                      {atm.nbrJour.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">{formatMAD(atm.consoMoyenne7j || 0)}</td>
                    <td className="py-3 px-4 font-medium" style={{ color: atm.aInvestir ? 'var(--accent)' : '' }}>
                      {formatMAD(atm.aInvestir || 0)}
                    </td>
                  </tr>
                ))}
                {criticalAtms.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Aucun GAB critique détecté
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CriticalAtmsTable;
