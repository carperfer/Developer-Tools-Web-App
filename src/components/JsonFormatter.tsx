import { useState } from "react";
import type { ClipboardEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2, XCircle, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError("");
      toast.success("JSON formateado correctamente");
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Error al parsear JSON");
      setOutput("");
      toast.error("JSON inválido");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError("");
      toast.success("JSON minificado correctamente");
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Error al parsear JSON");
      setOutput("");
      toast.error("JSON inválido");
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setIsValid(true);
      setError("");
      toast.success("JSON válido");
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Error al parsear JSON");
      toast.error("JSON inválido");
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    setInput(pastedText);

    try {
      const parsed = JSON.parse(pastedText);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError("");
      toast.success("JSON formateado correctamente");
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Error al parsear JSON");
      setOutput("");
      toast.error("JSON inválido");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copiado al portapapeles");
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formateador y Validador de JSON</CardTitle>
        <CardDescription>
          Valida, formatea y minifica tus documentos JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-700">Entrada JSON</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder='{"nombre": "ejemplo", "valor": 123}'
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-700">Salida</label>
            <Textarea
              value={output}
              readOnly
              placeholder="El JSON formateado aparecerá aquí..."
              className="min-h-[300px] font-mono text-sm bg-slate-50"
            />
          </div>
        </div>

        {isValid !== null && (
          <Alert variant={isValid ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {isValid ? (
                <CheckCircle2 className="size-4 mt-0.5 text-green-600" />
              ) : (
                <XCircle className="size-4 mt-0.5" />
              )}
              <AlertDescription>
                {isValid ? "JSON válido" : error}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={formatJson}>
            Formatear
          </Button>
          <Button onClick={minifyJson} variant="outline">
            Minificar
          </Button>
          <Button onClick={validateJson} variant="outline">
            Validar
          </Button>
          {output && (
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="size-4 mr-2" />
              Copiar
            </Button>
          )}
          <Button onClick={clear} variant="outline">
            <Trash2 className="size-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
