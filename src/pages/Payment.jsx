import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Label } from "@/components/ui/label";

const Payment = () => {
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const originalPrice = 79.97;
  const betaPrice = 49.97;
  const discount = isValidCode ? betaPrice * 0.1 : 0;
  const finalPrice = betaPrice - discount;

  const verifyReferralCode = async () => {
    if (!referralCode) {
      toast({
        title: "Erro",
        description: "Por favor, insira um código de indicação",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingCode(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/referral/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: referralCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao verificar código");
      }

      setIsValidCode(data.valid);

      if (data.valid) {
        toast({
          title: "Sucesso",
          description: "Código de indicação válido! Desconto de 10% aplicado.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Código de indicação inválido",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      setIsValidCode(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/payments/create-payment", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          referralCode: isValidCode ? referralCode : null 
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao criar pagamento. Tente novamente.");
      }

      const data = await response.json();
      if (!data.init_point) {
        throw new Error("Link de pagamento não encontrado.");
      }

      window.location.href = data.init_point;
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Assinatura Mensal</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Ative seu Assistente de Entregas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-foreground">Preço normal:</span>
              <span className="line-through text-muted-foreground text-sm sm:text-base">R$ {originalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm sm:text-base text-foreground">Preço da versão beta:</span>
              <span className="font-medium text-sm sm:text-base text-foreground">R$ {betaPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm sm:text-base">Desconto de indicação (10%):</span>
                <span className="text-sm sm:text-base">- R$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center font-bold text-base sm:text-lg text-foreground">
              <span>Total a pagar:</span>
              <span>R$ {finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralCode">Código de indicação (opcional)</Label>
              <div className="relative">
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Digite o código de indicação"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="h-9 sm:h-10"
                />
                {isVerifyingCode && (
                  <div className="absolute right-3 top-2.5 sm:top-3">
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {isValidCode && (
                  <div className="absolute right-3 top-2.5 sm:top-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
                {!isValidCode && referralCode && !isVerifyingCode && (
                  <div className="absolute right-3 top-2.5 sm:top-3">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={verifyReferralCode}
                disabled={isVerifyingCode || !referralCode}
                className="w-full"
                size={isMobile ? "sm" : "default"}
              >
                {isVerifyingCode ? "Verificando..." : "Aplicar Código"}
              </Button>
            </div>

            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              {isLoading ? "Processando..." : "Assinar Agora"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center w-full">
            Ao realizar o pagamento, você concorda com os nossos termos de serviço.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Payment;
