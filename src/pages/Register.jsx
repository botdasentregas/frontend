import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://botdasentregas.hopto.org:8221/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo à plataforma!",
        });
        navigate("/payment");
      } else {
        toast({
          title: "Erro ao realizar cadastro",
          description: data.error || "Houve um problema no cadastro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no servidor",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Cadastre-se</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
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
              {isLoading ? "Cadastrando..." : "Cadastrar-se"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
