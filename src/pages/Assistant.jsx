import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Power, MessageSquare, Plus, Check, Users, RefreshCw } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://alive-kind-jennet.ngrok-free.app/", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

socket.on("connect", () => {
  console.log("Socket conectado com sucesso!");
});

socket.on("disconnect", () => {
  console.log("Socket desconectado!");
});

socket.on("connect_error", (error) => {
  console.error("Erro na conexão do socket:", error);
});

// Log de todos os eventos
socket.onAny((eventName, ...args) => {
  console.log("Evento recebido:", eventName, "Dados:", args);
});

const Assistant = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [customResponse, setCustomResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast({
      title: "Sessão expirada",
      description: "Por favor, faça login novamente.",
      variant: "destructive",
    });
  };

  const handleToggleBot = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const endpoint = isActive ? "deactivate" : "activate";
      const response = await fetch(`https://alive-kind-jennet.ngrok-free.app/api/bot/${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setIsActive(!isActive);
        toast({
          title: isActive ? "Bot Desativado" : "Bot Ativado",
          description: data.message,
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao alterar status do bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao alterar status do bot:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do bot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomResponse = async () => {
    setIsLoading(true);
    
    if (!customResponse.trim()) {
      toast({
        title: "Erro ao salvar resposta",
        description: "Por favor, adicione uma resposta personalizada.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          triggerWord: "default",
          responseText: customResponse
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Resposta personalizada salva",
          description: "Sua resposta personalizada foi configurada com sucesso."
        });
        setCustomResponse("");
      } else {
        toast({
          title: "Erro ao salvar resposta",
          description: data.message || "Não foi possível salvar a resposta personalizada.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a resposta personalizada.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConversation = async (id) => {
    setIsLoading(true);
  
    const token = localStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return;
    }
  
    const conversation = conversations.find((conv) => conv.id === id);
    if (!conversation) {
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/groups/toggle-response", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation.id,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
  
      const data = await response.json();
  
      if (response.ok) {
        setConversations(
          conversations.map((conv) =>
            conv.id === id ? { ...conv, enabled: !conv.enabled } : conv
          )
        );
  
        const newState = !conversation.enabled;
        toast({
          title: newState ? "Grupo ativado" : "Grupo desativado",
          description: `O grupo "${conversation.title}" foi ${newState ? "ativado" : "desativado"} com sucesso.`,
        });
      } else {
        toast({
          title: "Erro ao alterar status do grupo",
          description: data.message || "Não foi possível alterar o status do grupo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao alterar status do grupo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefreshGroups = async () => {
    setIsLoading(true);
  
    const token = localStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return;
    }
  
    try {
      const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/groups/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        if (!Array.isArray(data.groups)) {
          toast({
            title: "Erro",
            description: "Dados inválidos recebidos da API.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
  
        const formattedGroups = data.groups.map((group) => ({
          id: group.conversation_id,
          title: group.name,
          description: "Grupo do WhatsApp",
          enabled: group.enabled,
        }));
  
        setConversations(formattedGroups);
        toast({
          title: "Grupos atualizados",
          description: "A lista de grupos foi atualizada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao atualizar grupos",
          description: data.message || "Não foi possível atualizar a lista de grupos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar grupos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista de grupos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchBotStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        const response = await fetch("https://alive-kind-jennet.ngrok-free.app/api/bot/bot-status", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        const data = await response.json();
        if (response.ok && data.success) {
          setIsActive(data.status === "Conectado");
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível verificar o status do bot.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar status do bot:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o status do bot.",
          variant: "destructive",
        });
      }
    };

    fetchBotStatus();
  }, []);

  useEffect(() => {
    socket.on("bot-status-changed", (data) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentUserId = payload.id;

      if (data.userId === currentUserId) {
        setIsActive(data.status);
        toast({
          title: "Status do Bot Alterado",
          description: `O assistente foi ${data.status ? "ativado" : "desativado"}.`,
        });
      }
    });

    return () => {
      socket.off("bot-status-changed");
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Assistente de Entregas</h1>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Status do Assistente</CardTitle>
            <CardDescription className="text-sm">Ative ou desative seu assistente de entregas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">Status atual:</span>
              </div>
              <div className={`flex items-center gap-1 ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm sm:text-base">{isActive ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleToggleBot} 
                variant={isActive ? "outline" : "default"}
                className="flex-1"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : (isActive ? "Desativar" : "Ativar")}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Resposta Personalizada</CardTitle>
            <CardDescription className="text-sm">Adicione uma mensagem personalizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Digite sua resposta personalizada aqui..."
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <Button 
              onClick={handleSaveCustomResponse} 
              className="w-full" 
              size="sm"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Salvar Resposta
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg sm:text-xl">Grupos do WhatsApp</CardTitle>
                <CardDescription className="text-sm">
                  Selecione quais grupos o assistente deve monitorar e responder
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleRefreshGroups}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar Grupos</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="space-y-0.5">
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {conv.title}
                      </label>
                      <p className="text-xs text-muted-foreground">{conv.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant={conv.enabled ? "outline" : "default"}
                      className="h-8 px-2 sm:px-3"
                      onClick={() => handleToggleConversation(conv.id)}
                    >
                      {conv.enabled ? "Desativar" : "Ativar"}
                    </Button>
                    <Users className="h-3 w-3 text-muted-foreground hidden sm:block" />
                    {conv.enabled && <Check className="h-4 w-4 text-green-500 hidden sm:block" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg sm:text-xl"></CardTitle>
                <CardDescription className="text-sm">
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Conteúdo do card aqui */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assistant;
