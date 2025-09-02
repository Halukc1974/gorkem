import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CreateSheetModal from "./create-sheet-modal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSheets, useDeleteSheet } from "@/hooks/useSheets";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const { data: sheets = [], isLoading } = useSheets();
  const deleteSheetMutation = useDeleteSheet();

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleDeleteSheet = (sheetTabId: number, sheetName: string) => {
    if (confirm(`"${sheetName}" adlı sheet'i silmek istediğinizden emin misiniz?`)) {
      deleteSheetMutation.mutate({ sheetTabId }, {
        onSuccess: () => {
          toast({
            title: "Sheet Silindi",
            description: "Sheet başarıyla silindi.",
          });
        },
        onError: () => {
          toast({
            title: "Silme Hatası",
            description: "Sheet silinirken bir hata oluştu.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-border">
        <div className="flex items-center">
          <i className="fas fa-building text-primary text-2xl mr-3"></i>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Görkem İnşaat</h1>
            <p className="text-sm text-muted-foreground">Proje Takip Sistemi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button
          onClick={() => handleNavigation("/")}
          className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            location === "/" 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          data-testid="nav-dashboard"
        >
          <i className="fas fa-chart-line mr-3 h-5 w-5"></i>
          Dashboard
        </button>
        
        {/* Google Sheets List */}
        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Google Sheets
          </h3>
          <div className="mt-2 space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-3 py-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : sheets.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Henüz sheet yok</p>
                <p className="text-xs text-muted-foreground">İlk sheet'inizi oluşturun</p>
              </div>
            ) : (
              sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location === `/sheets/${sheet.id}`
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <button
                    onClick={() => handleNavigation(`/sheets/${sheet.id}`)}
                    className="flex items-center flex-1 text-left"
                    data-testid={`nav-sheet-${sheet.id}`}
                  >
                    <i className="fas fa-table mr-3 h-4 w-4 text-muted-foreground"></i>
                    <span className="truncate">{sheet.name}</span>
                  </button>
                  <div className="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSheet(sheet.sheetTabId, sheet.name);
                      }}
                      className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                      data-testid={`button-delete-sheet-${sheet.id}`}
                    >
                      <i className="fas fa-trash h-3 w-3"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="outline"
            className="mt-3 w-full border-dashed"
            data-testid="button-create-sheet"
          >
            <i className="fas fa-plus mr-2 h-4 w-4"></i>
            Yeni Sheet Oluştur
          </Button>
        </div>
      </nav>

      {/* Create Sheet Modal */}
      {showCreateModal && (
        <CreateSheetModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={onClose}
              data-testid="overlay-mobile-sidebar"
            ></div>
            <div className="fixed inset-y-0 left-0 w-80">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="hidden md:flex md:w-80 md:flex-col">
      {sidebarContent}
    </div>
  );
}
