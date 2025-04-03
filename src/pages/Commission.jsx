"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, User, Copy, Users, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Commission = () => {
  const [referralCode, setReferralCode] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("indicacoes");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const isMobile = useIsMobile();

  const loadWithdrawalHistory = async () => {
    setIsLoadingWithdrawals(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setIsLoadingWithdrawals(false);
      return;
    }

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/withdrawal/withdrawals", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const formattedWithdrawals = data.withdrawals.map(withdrawal => ({
          date: new Date(withdrawal.createdAt).toLocaleDateString("pt-BR"),
          amount: Number(withdrawal.amount),
          pixKey: withdrawal.pixKey,
          status: withdrawal.status,
          rejectionReason: withdrawal.rejectionReason
        }));
        setWithdrawalHistory(formattedWithdrawals);
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao carregar histórico de saques",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de saques:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de saques.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  useEffect(() => {
    loadWithdrawalHistory();
    handleCheckBalance();
  }, []);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setIsGeneratingCode(false);
      return;
    }

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/referral/generate", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReferralCode(data.code);
        toast({
          title: "Sucesso",
          description: data.message,
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao gerar código de indicação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código de indicação.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleRefreshCount = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/referral/stats", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTotalReferrals(data.uses);
        const calculatedEarnings = data.uses * 10;
        setEarnings(calculatedEarnings);
        toast({
          title: "Estatísticas atualizadas!",
          description: data.uses > 0 
            ? `Você tem ${data.uses} indicação(ões) e R$ ${calculatedEarnings.toFixed(2)} em ganhos!` 
            : "Você ainda não tem indicações.",
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao atualizar estatísticas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as estatísticas.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Código copiado!",
        description: "O código de indicação foi copiado para a área de transferência.",
      });
    }
  };

  const handleCheckBalance = async () => {
    setIsCheckingBalance(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setIsCheckingBalance(false);
      return;
    }

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/withdrawal/check-balance", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const balance = Number(data.availableBalance);
        setAvailableBalance(balance);
        if (balance > 0) {
          toast({
            title: "Saldo disponível!",
            description: `Seu saldo disponível é R$ ${balance.toFixed(2)}`,
          });
        }
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao verificar saldo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar saldo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o saldo.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const requestWithdrawal = async () => {
    if (!pixKey) {
      toast({
        title: "Chave PIX necessária",
        description: "Por favor, insira sua chave PIX para receber o pagamento.",
        variant: "destructive",
      });
      return;
    }

    if (availableBalance <= 0) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo disponível para saque.",
        variant: "destructive",
      });
      return;
    }

    if (availableBalance < 50) {
      toast({
        title: "Valor mínimo não atingido",
        description: "O valor mínimo para saque é de R$ 50,00.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    // Processar o saque
    const date = new Date().toLocaleDateString("pt-BR");
    setWithdrawalHistory([
      ...withdrawalHistory,
      {
        date,
        amount: availableBalance,
        status: "pending",
      },
    ]);

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/withdrawal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ pixKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setAvailableBalance(0);
        setWithdrawalHistory((prev) =>
          prev.map((item, index) => (index === prev.length - 1 ? { ...item, status: "approved" } : item)),
        );
        toast({
          title: "Saque realizado com sucesso!",
          description: `R$ ${availableBalance.toFixed(2)} foi enviado para sua chave PIX.`,
        });
        setPixKey("");
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao processar o saque",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar saque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o saque.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16 sm:p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-0">
          <div className="p-6 text-center border-b">
            <h1 className="text-2xl font-bold text-foreground">Programa de Indicação</h1>
            <p className="text-muted-foreground mt-1">Indique amigos e ganhe comissões sobre as vendas</p>
          </div>

          <Tabs defaultValue="indicacoes" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="flex w-full justify-center">
              <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
              <TabsTrigger value="saques">Saques</TabsTrigger>
            </TabsList>

            <TabsContent value="indicacoes" className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-foreground mb-1">Seu código de indicação:</p>
                  {referralCode ? (
                    <div className="flex items-center gap-2">
                      <code className="bg-background px-3 py-1 rounded border text-lg font-medium flex-1">{referralCode}</code>
                      <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copiar código">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum código gerado. Clique no botão abaixo para gerar.</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">Total de indicações:</span>
                  </div>
                  <span className="text-xl font-semibold">{totalReferrals}</span>
                </div>

                {referralCode && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">Saldo disponível:</span>
                    </div>
                    <span className="text-xl font-semibold text-green-600">R$ {earnings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {!referralCode ? (
                  <Button 
                    className="w-full bg-[#111827] hover:bg-[#1e293b] text-white" 
                    onClick={handleGenerateCode} 
                    disabled={isGeneratingCode}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {isGeneratingCode ? "Gerando código..." : "Gerar código de indicação"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCopyCode} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar código de indicação
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleRefreshCount}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? "Atualizando..." : "Atualizar minhas indicações"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saques" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    placeholder="Digite sua chave PIX"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="h-9 sm:h-10"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">Saldo disponível:</span>
                  </div>
                  <span className="text-xl font-semibold text-green-600">R$ {availableBalance.toFixed(2)}</span>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Valor mínimo para saque: R$ 50,00</p>
                  <p>• Saques são creditados em até 24 horas úteis</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleCheckBalance}
                  disabled={isCheckingBalance}
                  size={isMobile ? "sm" : "default"}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isCheckingBalance ? 'animate-spin' : ''}`} />
                  {isCheckingBalance ? "Verificando..." : "Verificar saldo disponível"}
                </Button>

                <Button 
                  className="w-full" 
                  onClick={requestWithdrawal}
                  disabled={isCheckingBalance || availableBalance < 50}
                  size={isMobile ? "sm" : "default"}
                >
                  {isCheckingBalance ? "Processando..." : availableBalance < 50 ? "Saldo insuficiente" : "Solicitar Saque"}
                </Button>
              </div>

              {withdrawalHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Histórico de Saques</h3>
                  <div className="space-y-2">
                    {withdrawalHistory.map((withdrawal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">R$ {withdrawal.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.date}</p>
                          {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">Motivo: {withdrawal.rejectionReason}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : withdrawal.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {withdrawal.status === 'approved' ? 'Concluído' : 
                           withdrawal.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commission;
