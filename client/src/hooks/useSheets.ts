// Client-side Google Sheets data management hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { googleSheetsClient } from '@/services/googleSheets';

interface Sheet {
  id: string;
  name: string;
  googleSheetId: string;
  sheetTabId: number;
  headers: string[];
}

interface SheetRecord {
  [key: string]: string;
}

const SPREADSHEET_ID = () => {
  const config = (window as any).__APP_CONFIG__;
  return config?.GOOGLE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';
};

export function useSheets() {
  return useQuery({
    queryKey: ['sheets'],
    queryFn: async () => {
      try {
        // Check if user is authenticated with Google Sheets first
        if (!googleSheetsClient.isAuthenticated()) {
          console.log('User not authenticated with Google Sheets, returning empty sheets array');
          return [];
        }

        const spreadsheetInfo = await googleSheetsClient.getSpreadsheetInfo(SPREADSHEET_ID());
        
        // Convert Google Sheets tabs to our Sheet format
        const sheets: Sheet[] = spreadsheetInfo.sheets.map((sheet, index) => ({
          id: sheet.id.toString(),
          name: sheet.title,
          googleSheetId: SPREADSHEET_ID(),
          sheetTabId: sheet.id,
          headers: []
        }));
        
        return sheets;
      } catch (error) {
        console.error('Error fetching sheets:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSheetData(sheetName: string) {
  return useQuery({
    queryKey: ['sheet-data', sheetName],
    queryFn: async () => {
      if (!sheetName) return null;
      
      try {
        const data = await googleSheetsClient.getSheetData(SPREADSHEET_ID(), sheetName);
        
        if (data.length === 0) {
          return {
            headers: [],
            records: []
          };
        }
        
        const headers = data[0] || [];
        const records = data.slice(1).map((row, index) => {
          const record: SheetRecord = { _rowIndex: index.toString() };
          headers.forEach((header, colIndex) => {
            record[header] = row[colIndex] || '';
          });
          return record;
        });
        
        return {
          headers,
          records
        };
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
      }
    },
    enabled: !!sheetName,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sheetName, record }: { sheetName: string, record: any }) => {
      const rowData = [
        record.date || '',
        record.description || '',
        record.amount?.toString() || '',
        record.type || '',
        record.category || ''
      ];
      
      await googleSheetsClient.appendSheetData(SPREADSHEET_ID(), sheetName, [rowData]);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch sheet data
      queryClient.invalidateQueries({ queryKey: ['sheet-data', variables.sheetName] });
    }
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sheetName, 
      rowIndex, 
      record 
    }: { 
      sheetName: string, 
      rowIndex: number, 
      record: any 
    }) => {
      const rowData = Object.values(record).map(val => val?.toString() || '');
      const range = `${sheetName}!A${rowIndex + 2}:${String.fromCharCode(65 + rowData.length - 1)}${rowIndex + 2}`;
      
      await googleSheetsClient.updateSheetData(SPREADSHEET_ID(), range, [rowData]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sheet-data', variables.sheetName] });
    }
  });
}

export function useCreateSheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, template }: { name: string, template: string }) => {
      const headers = googleSheetsClient.getTemplateHeaders(template);
      await googleSheetsClient.createSheet(SPREADSHEET_ID(), name, headers);
    },
    onSuccess: () => {
      // Invalidate sheets list
      queryClient.invalidateQueries({ queryKey: ['sheets'] });
    }
  });
}

export function useDeleteSheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sheetTabId }: { sheetTabId: number }) => {
      await googleSheetsClient.deleteSheet(SPREADSHEET_ID(), sheetTabId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheets'] });
    }
  });
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        // Check if user is authenticated with Google Sheets first
        if (!googleSheetsClient.isAuthenticated()) {
          console.log('User not authenticated with Google Sheets, returning default data');
          return {
            totalSheets: 0,
            recentActivity: [],
            stats: { income: 0, expenses: 0, projects: 0 }
          };
        }

        const sheets = await googleSheetsClient.getSpreadsheetInfo(SPREADSHEET_ID());
        
        // Simple dashboard data - you can enhance this
        return {
          totalSheets: sheets.sheets.length,
          recentActivity: [],
          stats: {
            income: 0,
            expenses: 0,
            projects: 0
          }
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Return default data instead of throwing
        return {
          totalSheets: 0,
          recentActivity: [],
          stats: { income: 0, expenses: 0, projects: 0 }
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
