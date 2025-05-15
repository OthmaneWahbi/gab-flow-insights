
import { ATMData } from '../context/AppContext';

// Mock data for demonstration
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would send the file to the backend
    console.log('File uploaded:', file.name);
    
    // Generate a random upload ID
    const uploadId = Math.random().toString(36).substring(2, 15);
    
    return { uploadId };
  },
  
  getDashboardData: async (uploadId: string): Promise<{ atmData: ATMData[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would fetch data based on the upload ID
    console.log('Fetching dashboard data for upload ID:', uploadId);
    
    return { atmData: mockAtmData };
  },
  
  getConsumptionTrends: async (): Promise<typeof mockDailyConsumption> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockDailyConsumption;
  },
  
  downloadResults: async (uploadId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would trigger a file download
    console.log('Downloading results for upload ID:', uploadId);
    
    // Simulate a file download by creating and clicking an anchor element
    alert('Le téléchargement du fichier résultat commencerait ici');
  }
};
