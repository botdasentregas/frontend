import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Label } from "@/components/ui/label";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast({
          title: "Login realizado com sucesso!",
          description: "",
        });

        // Verificar status de pagamento
        const paymentResponse = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/check-payment-status", {
          headers: {
            "Authorization": `Bearer ${data.token}`,
            "Content-Type": "application/json"
          }
        });

        const paymentData = await paymentResponse.json();

        if (paymentResponse.ok) {
          // Redirecionar baseado no status de pagamento
          if (paymentData.paymentStatus === "paid") {
            // Verificar status do bot
            const botStatusResponse = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/status", {
              headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
              }
            });

            const botStatusData = await botStatusResponse.json();
            console.log("Status do Bot:", botStatusData);

            if (botStatusResponse.ok) {
              if (botStatusData.status === "connected" || 
                  botStatusData.status === "conectado" || 
                  botStatusData.status === "Conectado") {
                console.log("Bot está conectado, redirecionando para /assistant");
                navigate("/assistant");
              } else {
                console.log("Bot está desconectado, redirecionando para /connect");
                navigate("/connect");
              }
            } else {
              toast({
                title: "Erro",
                description: "Erro ao verificar status do bot",
                variant: "destructive",
              });
              navigate("/connect");
            }
          } else {
            navigate("/payment");
          }
        } else {
          toast({
            title: "Erro",
            description: paymentData.message || "Erro ao verificar status de pagamento",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao fazer login",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Acesse sua conta do Windsurf
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9 sm:h-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-9 sm:h-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
