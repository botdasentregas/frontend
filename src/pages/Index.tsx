// Update this page (the content is just a fallback if you fail to update the page)

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Bem-vindo ao Windsurf</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Seu assistente inteligente para entregas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm sm:text-base">
              Comece a usar o Windsurf para otimizar suas entregas e melhorar sua experiência.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
