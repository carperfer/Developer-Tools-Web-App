import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Copy, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function Base64Converter() {
  const [textInput, setTextInput] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [base64Output, setBase64Output] = useState("");

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(textInput);
      setBase64Output(encoded);
      toast.success("Texto codificado a Base64");
    } catch (e) {
      toast.error("Error al codificar");
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = atob(base64Input);
      setTextOutput(decoded);
      toast.success("Base64 decodificado a texto");
    } catch (e) {
      toast.error("Base64 inválido");
    }
  };

  const copyEncoded = () => {
    navigator.clipboard.writeText(base64Output);
    toast.success("Copiado al portapapeles");
  };

  const copyDecoded = () => {
    navigator.clipboard.writeText(textOutput);
    toast.success("Copiado al portapapeles");
  };

  const clearEncode = () => {
    setTextInput("");
    setBase64Output("");
  };

  const clearDecode = () => {
    setBase64Input("");
    setTextOutput("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversor Base64</CardTitle>
        <CardDescription>
          Codifica y decodifica texto en Base64
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
                  placeholder="Ingresa el texto a codificar..."
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700">Base64</label>
                <Textarea
                  value={base64Output}
                  readOnly
                  placeholder="El resultado en Base64 aparecerá aquí..."
                  className="min-h-[250px] font-mono text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={encodeToBase64}>
                <ArrowRight className="size-4 mr-2" />
                Codificar
              </Button>
              {base64Output && (
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
                <label className="text-slate-700">Base64</label>
                <Textarea
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder="Ingresa el Base64 a decodificar..."
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
              <Button onClick={decodeFromBase64}>
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
