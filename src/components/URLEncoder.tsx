import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Copy, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function URLEncoder() {
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [urlOutput, setUrlOutput] = useState("");

  const encodeURL = () => {
    try {
      const encoded = encodeURIComponent(textInput);
      setUrlOutput(encoded);
      toast.success("Texto codificado a URL");
    } catch (e) {
      toast.error("Error al codificar");
    }
  };

  const decodeURL = () => {
    try {
      const decoded = decodeURIComponent(urlInput);
      setTextOutput(decoded);
      toast.success("URL decodificada a texto");
    } catch (e) {
      toast.error("URL inválida");
    }
  };

  const copyEncoded = () => {
    navigator.clipboard.writeText(urlOutput);
    toast.success("Copiado al portapapeles");
  };

  const copyDecoded = () => {
    navigator.clipboard.writeText(textOutput);
    toast.success("Copiado al portapapeles");
  };

  const clearEncode = () => {
    setTextInput("");
    setUrlOutput("");
  };

  const clearDecode = () => {
    setUrlInput("");
    setTextOutput("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Codificador de URL</CardTitle>
        <CardDescription>
          Codifica y decodifica texto para URLs (URL encoding)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="encode">Codificar</TabsTrigger>
            <TabsTrigger value="decode">Decodificar</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-700">Texto plano</label>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ingresa el texto a codificar...&#10;Ejemplo: nombre@ejemplo.com?parametro=valor&otro=123"
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700">URL codificada</label>
                <Textarea
                  value={urlOutput}
                  readOnly
                  placeholder="El resultado codificado aparecerá aquí..."
                  className="min-h-[250px] font-mono text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={encodeURL}>
                <ArrowRight className="size-4 mr-2" />
                Codificar
              </Button>
              {urlOutput && (
                <Button onClick={copyEncoded} variant="outline">
                  <Copy className="size-4 mr-2" />
                  Copiar
                </Button>
              )}
              <Button onClick={clearEncode} variant="outline">
                <Trash2 className="size-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-700">URL codificada</label>
                <Textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Ingresa la URL codificada a decodificar...&#10;Ejemplo: nombre%40ejemplo.com%3Fparametro%3Dvalor%26otro%3D123"
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700">Texto plano</label>
                <Textarea
                  value={textOutput}
                  readOnly
                  placeholder="El texto decodificado aparecerá aquí..."
                  className="min-h-[250px] font-mono text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={decodeURL}>
                <ArrowLeft className="size-4 mr-2" />
                Decodificar
              </Button>
              {textOutput && (
                <Button onClick={copyDecoded} variant="outline">
                  <Copy className="size-4 mr-2" />
                  Copiar
                </Button>
              )}
              <Button onClick={clearDecode} variant="outline">
                <Trash2 className="size-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
