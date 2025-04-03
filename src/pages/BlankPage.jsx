"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, CreditCard, Key } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const BlankPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleRefreshWithdrawals = async () => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua API Key para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://botdasentregas.hopto.org:8221/api/withdrawal/admin/withdrawals", {
        headers: {
          "x-api-key": apiKey,
        },
      });

      if (response.status === 401) {
        toast({
          title: "Erro",
          description: "API Key inválida ou expirada.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setWithdrawals(data.withdrawals);
        toast({
          title: "Saques atualizados",
          description: "A lista de saques foi atualizada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao atualizar saques",
          description: data.message || "Não foi possível atualizar a lista de saques.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar saques:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista de saques.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua API Key para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://botdasentregas.hopto.org:8221/api/withdrawal/admin/withdrawal/${withdrawalId}`, {
        method: "PUT",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "approved" })
      });

      if (response.status === 401) {
        toast({
          title: "Erro",
          description: "API Key inválida ou expirada.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setWithdrawals(withdrawals.map(w => 
          w._id === withdrawalId ? { ...w, status: "approved" } : w
        ));
        toast({
          title: "Saque aprovado",
          description: "O saque foi aprovado com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao aprovar saque",
          description: data.message || "Não foi possível aprovar o saque.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao aprovar saque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o saque.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua API Key para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo necessário",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://botdasentregas.hopto.org:8221/api/withdrawal/admin/withdrawal/${withdrawalId}`, {
        method: "PUT",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: "rejected",
          rejectionReason: rejectionReason.trim()
        })
      });

      if (response.status === 401) {
        toast({
          title: "Erro",
          description: "API Key inválida ou expirada.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setWithdrawals(withdrawals.map(w => 
          w._id === withdrawalId ? { ...w, status: "rejected" } : w
        ));
        toast({
          title: "Saque rejeitado",
          description: "O saque foi rejeitado com sucesso.",
        });
        setRejectionDialogOpen(false);
        setRejectionReason("");
      } else {
        toast({
          title: "Erro ao rejeitar saque",
          description: data.message || "Não foi possível rejeitar o saque.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao rejeitar saque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o saque.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectionDialog = (withdrawalId) => {
    setSelectedWithdrawalId(withdrawalId);
    setRejectionDialogOpen(true);
  };

  useEffect(() => {
    handleRefreshWithdrawals();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg sm:text-xl">Aprovação de Saques</CardTitle>
              <CardDescription className="text-sm">
                Gerencie os saques pendentes dos usuários
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleRefreshWithdrawals}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Digite sua API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>

            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {withdrawal.userId.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R$ {withdrawal.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chave PIX: {withdrawal.pixKey}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {withdrawal.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2 sm:px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openRejectionDialog(withdrawal._id)}
                          disabled={isLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 px-2 sm:px-3"
                          onClick={() => handleApproveWithdrawal(withdrawal._id)}
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      withdrawal.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : withdrawal.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status === 'approved' ? 'Aprovado' : 
                       withdrawal.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum saque pendente para aprovação
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Saque</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição do saque.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Digite o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleRejectWithdrawal(selectedWithdrawalId)}
              disabled={isLoading || !rejectionReason.trim()}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlankPage; 
