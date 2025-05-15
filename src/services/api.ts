
import { ATMData } from '../context/AppContext';
import * as XLSX from 'xlsx';

// Chemins vers les fichiers Excel
const DATA_FOLDER = '/data';
const PREVISIONS_PATH = `${DATA_FOLDER}/previsions.xlsx`;
const PONDERATION_PATH = `${DATA_FOLDER}/ponderation_gab.xlsx`;
const TEMP_UPLOADS_FOLDER = `${DATA_FOLDER}/uploads`;

// Cache pour stocker les données uploadées
interface UploadCache {
  [uploadId: string]: {
    fileName: string;
    uploadDate: Date;
    atmData: ATMData[];
    rawData?: any;
  };
}

const uploadCache: UploadCache = {};

// Vérifier si les fichiers existent
const checkFileExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Erreur lors de la vérification du fichier ${path}:`, error);
    return false;
  }
};

// Charger un fichier Excel
const loadExcelFile = async (path: string): Promise<any | null> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Impossible de charger le fichier: ${path}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error(`Erreur lors du chargement du fichier ${path}:`, error);
    return null;
  }
};

// Traiter les données de l'état des GABs
const processAtmData = async (atmStateData: any[], uploadId: string): Promise<ATMData[]> => {
  // Vérifier et charger les fichiers de pondération et de prévisions
  const ponderationExists = await checkFileExists(PONDERATION_PATH);
  const previsionsExists = await checkFileExists(PREVISIONS_PATH);
  
  let ponderation: any[] = [];
  let previsions: any[] = [];
  
  if (ponderationExists) {
    const ponderationData = await loadExcelFile(PONDERATION_PATH);
    if (ponderationData) {
      ponderation = ponderationData;
      console.log("Données de pondération chargées:", ponderation.length, "entrées");
    }
  }
  
  if (previsionsExists) {
    const previsionsData = await loadExcelFile(PREVISIONS_PATH);
    if (previsionsData) {
      previsions = previsionsData;
      console.log("Données de prévisions chargées:", previsions.length, "entrées");
    }
  }
  
  // Si les fichiers n'existent pas, on utilise le mock
  if (!ponderationExists || !previsionsExists || ponderation.length === 0 || previsions.length === 0) {
    console.log("Utilisation des données mock par défaut");
    return mockAtmData;
  }
  
  // Sinon, on fait le traitement
  console.log("Traitement des données réelles");
  const today = new Date();
  
  // Filtrer les prévisions pour les 7 prochains jours
  const nextWeekPrevisions = previsions.filter((prev: any) => {
    const prevDate = new Date(prev.Date);
    return prevDate >= today && prevDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  });
  
  // Traitement des données selon la logique décrite
  const processedData: ATMData[] = atmStateData.map((atm: any) => {
    // Trouver la pondération pour ce GAB
    const gabPonderation = ponderation.find((p: any) => p['Numero GAB'] === atm['Numero GAB']);
    const ponderationValue = gabPonderation ? gabPonderation.ponderation : 0;
    
    // Calculer la consommation moyenne sur 7 jours
    let consoMoyenne7j = 0;
    if (nextWeekPrevisions.length > 0) {
      const totalConso = nextWeekPrevisions.reduce((sum: number, prev: any) => {
        return sum + (prev.conso_journaliere * ponderationValue);
      }, 0);
      consoMoyenne7j = totalConso / nextWeekPrevisions.length;
    }
    
    // Calculer le montant à investir
    const somme7jours = consoMoyenne7j * 7;
    const aInvestir = Math.max(0, somme7jours - atm['Cash Disponible']);
    
    return {
      numeroGAB: atm['Numero GAB'],
      nomGAB: atm['Mon GAB'],
      cashDisponible: atm['Cash Disponible'],
      nbrJour: atm['Nbr JOUR'],
      consoMoyenne7j,
      aInvestir
    };
  });
  
  // Sauvegarder dans le cache
  uploadCache[uploadId] = {
    fileName: `etat_gab_${uploadId}.xlsx`,
    uploadDate: new Date(),
    atmData: processedData,
    rawData: {
      atmState: atmStateData,
      ponderation,
      previsions
    }
  };
  
  return processedData;
};

// Mock data pour démonstration
const mockAtmData: ATMData[] = [
  { numeroGAB: 1001, nomGAB: "Agence Centrale", cashDisponible: 12500, nbrJour: 1.2, consoMoyenne7j: 8400, aInvestir: 6300 },
  { numeroGAB: 1002, nomGAB: "Centre Commercial", cashDisponible: 8700, nbrJour: 2.1, consoMoyenne7j: 4100, aInvestir: 0 },
  { numeroGAB: 1003, nomGAB: "Gare Nord", cashDisponible: 5200, nbrJour: 0.8, consoMoyenne7j: 6500, aInvestir: 5300 },
  { numeroGAB: 1004, nomGAB: "Aéroport T2", cashDisponible: 24600, nbrJour: 3.0, consoMoyenne7j: 8200, aInvestir: 0 },
  { numeroGAB: 1005, nomGAB: "Quartier Affaires", cashDisponible: 3200, nbrJour: 0.5, consoMoyenne7j: 6400, aInvestir: 6400 },
  { numeroGAB: 1006, nomGAB: "Université", cashDisponible: 9800, nbrJour: 2.8, consoMoyenne7j: 3500, aInvestir: 0 },
  { numeroGAB: 1007, nomGAB: "Centre Ville", cashDisponible: 4200, nbrJour: 1.1, consoMoyenne7j: 3800, aInvestir: 2600 },
];

const mockDailyConsumption = {
  dates: ["2023-05-15", "2023-05-16", "2023-05-17", "2023-05-18", "2023-05-19", "2023-05-20", "2023-05-21"],
  data: {
    1001: [8200, 8400, 8600, 8300, 8500, 8400, 8200],
    1003: [6300, 6400, 6600, 6500, 6700, 6800, 6200],
    1005: [6200, 6300, 6500, 6400, 6600, 6700, 6100],
    1007: [3700, 3800, 3900, 3800, 3700, 3900, 3800],
  }
};

export const api = {
  uploadFile: async (file: File): Promise<{ uploadId: string }> => {
    try {
      // Simuler un délai API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lire le fichier Excel
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            if (!e.target?.result) {
              throw new Error("Échec de lecture du fichier");
            }
            
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const atmStateData = XLSX.utils.sheet_to_json(worksheet);
            
            // Générer un ID d'upload aléatoire
            const uploadId = Math.random().toString(36).substring(2, 15);
            
            // Traiter les données de l'état des GABs
            await processAtmData(atmStateData, uploadId);
            
            resolve({ uploadId });
          } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            reject(new Error("Erreur lors du traitement du fichier"));
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Erreur lors de la lecture du fichier"));
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  },
  
  getDashboardData: async (uploadId: string): Promise<{ atmData: ATMData[] }> => {
    // Vérifier si les données sont dans le cache
    if (uploadCache[uploadId]) {
      console.log('Utilisation des données du cache pour l\'ID upload:', uploadId);
      return { atmData: uploadCache[uploadId].atmData };
    }
    
    // Simuler un délai API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Si pas de données dans le cache, retourner les données mock
    console.log('Aucune donnée trouvée pour l\'ID upload:', uploadId, 'utilisation des mock data');
    return { atmData: mockAtmData };
  },
  
  getConsumptionTrends: async (uploadId?: string): Promise<typeof mockDailyConsumption> => {
    // Simuler un délai API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Si un uploadId est fourni et qu'il existe dans le cache, on pourrait retourner des données personnalisées
    // Pour l'instant, on retourne simplement les mock data
    return mockDailyConsumption;
  },
  
  getUploadHistory: async (): Promise<Array<{ id: string, fileName: string, date: Date }>> => {
    // Retourner l'historique des uploads à partir du cache
    return Object.entries(uploadCache).map(([id, data]) => ({
      id,
      fileName: data.fileName,
      date: data.uploadDate
    }));
  },
  
  downloadResults: async (uploadId: string): Promise<void> => {
    // Simuler un délai API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Vérifier si les données existent dans le cache
      if (!uploadCache[uploadId]) {
        throw new Error("Données non trouvées pour cet ID d'upload");
      }
      
      // Préparer les données pour le fichier de résultats
      const atmData = uploadCache[uploadId].atmData;
      const resultData = atmData
        .filter(atm => atm.nbrJour <= 3 && atm.aInvestir > 0)
        .map(atm => ({
          'Numero GAB': atm.numeroGAB,
          'À investir': atm.aInvestir
        }));
      
      // Créer un workbook et l'exporter
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(resultData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Résultats");
      
      // Générer et télécharger le fichier
      XLSX.writeFile(workbook, `resultats_${uploadId}.xlsx`);
      
      console.log('Téléchargement des résultats pour ID upload:', uploadId);
    } catch (error) {
      console.error('Erreur lors du téléchargement des résultats:', error);
      alert(`Erreur lors du téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
};
