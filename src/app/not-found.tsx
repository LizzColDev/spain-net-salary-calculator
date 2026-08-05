
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Página no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">La calculadora principal sigue disponible.</p>
          <Button asChild><Link  href="/">Volver a la calculadora</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
