
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { uploadHistory, setCurrentUploadId } = useAppContext();

  const formatDate = (date: Date): string => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewUpload = (uploadId: string) => {
    setCurrentUploadId(uploadId);
    navigate('/');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Historique des uploads</h1>
      
      {uploadHistory.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-muted-foreground"
            >
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            
            <h2 className="text-xl font-medium mb-2">Aucun historique disponible</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Vous n'avez pas encore téléchargé de fichier d'état de GAB.
            </p>
            
            <Button onClick={() => navigate('/upload')}>
              Télécharger un fichier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers téléchargés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Date et heure</th>
                      <th className="py-3 px-4 text-left font-medium">Nom du fichier</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {uploadHistory.map((upload) => (
                      <tr key={upload.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">{formatDate(upload.timestamp)}</td>
                        <td className="py-3 px-4">{upload.filename}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUpload(upload.id)}
                          >
                            Voir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;
