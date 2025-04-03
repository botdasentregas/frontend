import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Power, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const Connect = () => {
  const [qrCode, setQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Função para extrair o userId do token JWT
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    console.log("Token encontrado:", token ? "Sim" : "Não");
    
    if (!token) {
      console.log("Nenhum token encontrado no localStorage");
      return null;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Token decodificado:", decodedToken);
      
      if (!decodedToken || !decodedToken.id) {
        console.log("Token não contém id");
        return null;
      }
      
      return decodedToken.id;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  };

  useEffect(() => {
    // Inicializar socket apenas uma vez
    const newSocket = io("http://botdasentregas.hopto.org:8221/", { 
      transports: ["websocket"]
    });

    // Configurar listeners do socket
    newSocket.on("connect", () => {
      const userId = getUserIdFromToken();
      if (userId) {
        newSocket.emit("register", { userId });
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Erro na conexão WebSocket:", error);
    });

    setSocket(newSocket);

    // Limpar socket ao desmontar
    return () => {
      newSocket.disconnect();
    };
  }, []); // Executar apenas uma vez ao montar o componente

  useEffect(() => {
    if (!socket) return;

    // Extrair userId do token
    const extractedUserId = getUserIdFromToken();

    if (!extractedUserId) {
      console.error("Não foi possível extrair userId do token");
      return;
    }

    setUserId(extractedUserId);

    // Configurar listener específico para o QR code deste usuário
    socket.on(`qr-code-${extractedUserId}`, (data) => {
      try {
        if (data.error === "LIMITE_ATINGIDO") {
          toast({
            title: "Limite atingido",
            description: data.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (data.qr) {
          setQrCode(data.qr);
          setIsLoading(false);
          toast({ title: "QR Code recebido!", description: "Escaneie para conectar." });
        } else {
          toast({
            title: "Erro",
            description: "Formato do QR Code inválido.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar o QR Code.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });

    // Listener para conexão do bot
    socket.on("bot-connected", (data) => {
      if (data.userId === extractedUserId) {
        toast({
          title: "Bot Conectado!",
          description: "Redirecionando para o assistente...",
        });
        setTimeout(() => {
          navigate("/assistant");
        }, 1500);
      }
    });

    // Listener para bot já em execução
    socket.on("bot-already-running", (data) => {
      if (data.userId === extractedUserId) {
        toast({
          title: "Bot já está ativo!",
          description: "Redirecionando para o assistente...",
        });
        setTimeout(() => {
          navigate("/assistant");
        }, 1500);
      }
    });

    // Limpar listeners ao desmontar
    return () => {
      socket.off(`qr-code-${extractedUserId}`);
      socket.off("bot-connected");
      socket.off("bot-already-running");
    };
  }, [socket, navigate]);

  const handleStartSession = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://botdasentregas.hopto.org:8221/api/bot/start", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Se receber QR code, mostra ele
        if (data.qrCode) {
          console.log("QR Code recebido na resposta direta:", data.qrCode);
          setQrCode(data.qrCode);
          setIsLoading(false);
          toast({ title: "QR Code recebido!", description: "Escaneie para conectar." });
          return;
        }

        // Se não receber QR code, aguarda pelo socket
        toast({ title: "Aguardando conexão...", description: "Por favor, aguarde." });
      } else {
        console.error("Erro na resposta:", data);
        
        if (data.error === "LIMITE_ATINGIDO") {
          toast({
            title: "Limite atingido",
            description: data.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao iniciar sessão",
            description: data.message || "Tente novamente.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Erro",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://botdasentregas.hopto.org:8221/api/bot/session", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sessão apagada",
          description: "Sua sessão foi apagada com sucesso. Aguarde alguns segundos antes de iniciar uma nova sessão.",
        });
        setQrCode(null);
        setIsLoading(false);
        // Força uma limpeza do socket para garantir que não haja estados residuais
        if (socket) {
          socket.disconnect();
          const newSocket = io("http://botdasentregas.hopto.org:8221/", { 
            transports: ["websocket"]
          });
          setSocket(newSocket);
        }
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao apagar sessão",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao apagar sessão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível apagar a sessão.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Conectar Assistente</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Conecte seu WhatsApp com o assistente de entregas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Button 
              onClick={handleStartSession} 
              className="w-full" 
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              <Power className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isLoading ? "Iniciando sessão..." : "Iniciar Sessão"}
            </Button>
            {!qrCode && (
              <Button 
                onClick={handleDeleteSession}
                variant="destructive"
                className="w-full"
                size={isMobile ? "sm" : "default"}
              >
                <Trash2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Apagar Sessão
              </Button>
            )}
          </div>
          {qrCode && (
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="w-64 h-64 bg-white p-2 rounded-md flex items-center justify-center mx-auto">
                <QRCodeSVG
                  value={qrCode}
                  size={256}
                  level="H"
                  includeMargin={true}
                  style={{
                    backgroundColor: 'white',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                Abra o WhatsApp no seu celular e vá em WhatsApp Web
              </p>
              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                Escaneie este QR Code para conectar ao assistente
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center w-full">
            A conexão permanecerá ativa até que você a encerre manualmente.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Connect;
