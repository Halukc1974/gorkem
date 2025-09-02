import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SheetTable from "@/components/sheet-table";
import AddRecordModal from "@/components/add-record-modal";
import { useState } from "react";
import { useSheets, useSheetData } from "@/hooks/useSheets";

export default function SheetView() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Get sheets to find the sheet name by id
  const { data: sheets } = useSheets();
  const sheet = sheets?.find(s => s.id === id);
  
  // Get sheet data using sheet name
  const { data: sheetData, isLoading, error, refetch } = useSheetData(sheet?.name || '');

  // Transform data to match expected format
  const transformedData = sheetData ? {
    sheet: sheet,
    records: sheetData.records,
    headers: sheetData.headers
  } : null;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-muted rounded w-48"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
            </div>
          </div>
          <Card>
            <div className="p-6">
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-6 text-center">
            <div className="text-destructive mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sheet Verisi Yüklenemedi</h3>
            <p className="text-muted-foreground mb-4">Sheet verilerini yüklerken bir hata oluştu.</p>
            <Button onClick={() => refetch()} data-testid="button-retry-sheet">
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!transformedData) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <i className="fas fa-table text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sheet Bulunamadı</h3>
            <p className="text-muted-foreground">Bu sheet mevcut değil veya silinmiş olabilir.</p>
          </div>
        </Card>
      </div>
    );
  }

  const filteredRecords = transformedData.records.filter((record: any) =>
    Object.values(record).some((cell: any) => 
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 space-y-6">
      {/* Sheet Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-sheet-name">
            {transformedData.sheet?.name || 'Sheet'}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid="text-record-count">
            {filteredRecords.length} kayıt
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
              data-testid="input-search"
            />
            <i className="fas fa-search absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"></i>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-record"
          >
            <i className="fas fa-plus h-4 w-4 mr-2"></i>
            Yeni Kayıt
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {sheetData.headers.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <i className="fas fa-table text-4xl"></i>
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">Sheet Boş</h4>
            <p className="text-muted-foreground mb-4">Bu sheet henüz başlık veya veri içermiyor.</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              data-testid="button-add-first-record"
            >
              İlk Kaydı Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <SheetTable
          headers={sheetData.headers}
          records={filteredRecords}
          sheetName={sheet.name}
          onDataChange={() => refetch()}
        />
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <AddRecordModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          sheetId={sheetData.sheet.id}
          headers={sheetData.headers}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
