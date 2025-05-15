
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addUpload, setIsLoading } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Check if the file is an Excel file
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner un fichier Excel (.xls, .xlsx)",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier Excel à télécharger",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + (100 - prev) * 0.1;
        return nextProgress > 95 ? 95 : nextProgress;
      });
    }, 200);
    
    try {
      const { uploadId } = await api.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add the upload to history
      addUpload(uploadId, file.name);
      
      toast({
        title: "Téléchargement réussi",
        description: "Le fichier a été téléchargé et traité avec succès.",
      });
      
      // Wait a moment before navigating to show the 100% progress
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur s'est produite lors du téléchargement du fichier.",
        variant: "destructive",
      });
      
      clearInterval(progressInterval);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Télécharger un fichier d'état</h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            
            <h2 className="text-xl font-medium mb-2">Déposer votre fichier ici</h2>
            <p className="text-sm text-muted-foreground mb-4">
              ou cliquer pour parcourir vos fichiers
            </p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
            />
            
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Parcourir les fichiers
            </Button>
            
            {file && (
              <p className="mt-4 text-sm">
                Fichier sélectionné : <strong>{file.name}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {uploadProgress > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium mb-1">
            Téléchargement en cours ({Math.round(uploadProgress)}%)
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Button
          variant="default"
          onClick={handleUpload}
          disabled={!file || uploadProgress > 0}
        >
          Télécharger et traiter
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Annuler
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Instructions:</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Téléchargez un fichier Excel (.xlsx) contenant l'état courant des GABs.</li>
          <li>Le fichier doit contenir les colonnes : Numero GAB, Mon GAB, Cash Disponible, Nbr JOUR.</li>
          <li>Une fois téléchargé, le système analysera les GABs critiques (Nbr JOUR &lt;= 3).</li>
          <li>Les résultats seront affichés sur le dashboard avec des recommandations.</li>
          <li>L'application s'appuiera également sur les fichiers de prévisions et de pondération stockés dans le dossier /data.</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;
