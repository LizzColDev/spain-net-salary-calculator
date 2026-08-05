"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { captureException } from "@/lib/monitoring";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => {
    captureException(error, { boundary: "app" });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>No se ha podido cargar la calculadora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Ha ocurrido un error inesperado. Puedes reintentar sin perder la configuración guardada en este navegador.</p>
          <Button onClick={reset}>Reintentar</Button>
        </CardContent>
      </Card>
    </main>
  );
}
