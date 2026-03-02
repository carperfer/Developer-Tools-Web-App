import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Send, Plus, X, Loader2, Copy, IterationCw } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface Header {
  id: string;
  key: string;
  value: string;
}

interface RequestResult {
  id: number;
  status: number | null;
  response: string;
  duration: number;
  error?: string;
}

export function ApiTester() {
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([
    { id: "1", key: "Content-Type", value: "application/json" }
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  
  // Loop functionality
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopCount, setLoopCount] = useState(5);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);
  const [loopResults, setLoopResults] = useState<RequestResult[]>([]);

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: "", value: "" }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeader = (id: string, field: "key" | "value", value: string) => {
    setHeaders(headers.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const sendRequest = async () => {
    if (!url) {
      toast.error("Por favor ingresa una URL");
      return;
    }

    if (loopEnabled) {
      await sendMultipleRequests();
    } else {
      await sendSingleRequest();
    }
  };

  const sendSingleRequest = async () => {
    setLoading(true);
    setResponse("");
    setStatusCode(null);
    setResponseHeaders({});
    setCurrentIteration(0);
    setTotalIterations(0);
    setLoopResults([]);

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      if (method === "POST" && body) {
        options.body = body;
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const endTime = performance.now();
      const responseText = await res.text();
      
      setStatusCode(res.status);
      
      // Extract response headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      setResponseHeaders(resHeaders);

      try {
        const json = JSON.parse(responseText);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(responseText);
      }

      toast.success(`Petición completada en ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
      toast.error("Error en la petición");
    } finally {
      setLoading(false);
    }
  };

  const sendMultipleRequests = async () => {
    setLoading(true);
    setResponse("");
    setStatusCode(null);
    setResponseHeaders({});
    setLoopResults([]);
    setTotalIterations(loopCount);

    const results: RequestResult[] = [];

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      if (method === "POST" && body) {
        options.body = body;
      }

      for (let i = 0; i < loopCount; i++) {
        setCurrentIteration(i + 1);
        
        try {
          const startTime = performance.now();
          const res = await fetch(url, options);
          const endTime = performance.now();
          const responseText = await res.text();
          
          let formattedResponse = responseText;
          try {
            const json = JSON.parse(responseText);
            formattedResponse = JSON.stringify(json, null, 2);
          } catch {
            // Keep as plain text
          }

          results.push({
            id: i + 1,
            status: res.status,
            response: formattedResponse,
            duration: Math.round(endTime - startTime)
          });
        } catch (error) {
          results.push({
            id: i + 1,
            status: null,
            response: "",
            duration: 0,
            error: error instanceof Error ? error.message : "Error desconocido"
          });
        }
      }

      setLoopResults(results);
      
      // Calculate statistics
      const successCount = results.filter(r => r.status && r.status >= 200 && r.status < 300).length;
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      
      setResponse(`Completadas ${loopCount} peticiones:\n✓ Exitosas: ${successCount}/${loopCount}\n⏱ Tiempo promedio: ${Math.round(avgDuration)}ms`);
      
      toast.success(`${loopCount} peticiones completadas`);
    } catch (error) {
      toast.error("Error en las peticiones");
    } finally {
      setLoading(false);
      setCurrentIteration(0);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    toast.success("Respuesta copiada");
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
        <CardDescription>
          Realiza peticiones HTTP GET y POST con headers y body personalizables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request Configuration */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={method} onValueChange={(v) => setMethod(v as "GET" | "POST")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.ejemplo.com/endpoint"
              className="flex-1"
            />

            <Button onClick={sendRequest} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {loopEnabled ? `${currentIteration}/${totalIterations}` : "Enviando"}
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {/* Loop Configuration */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={loopEnabled}
                  onCheckedChange={setLoopEnabled}
                  id="loop-mode"
                />
                <Label htmlFor="loop-mode" className="cursor-pointer">
                  Modo bucle
                </Label>
              </div>
              
              {loopEnabled && (
                <div className="flex items-center gap-2">
                  <IterationCw className="size-4 text-slate-600" />
                  <Label htmlFor="loop-count">Repeticiones:</Label>
                  <Input
                    id="loop-count"
                    type="number"
                    min="1"
                    max="100"
                    value={loopCount}
                    onChange={(e) => setLoopCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-20"
                  />
                </div>
              )}
            </div>
            
            {loading && loopEnabled && (
              <Badge variant="secondary">
                {currentIteration} / {totalIterations}
              </Badge>
            )}
          </div>

          <Tabs defaultValue="headers" className="w-full">
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              {method === "POST" && <TabsTrigger value="body">Body</TabsTrigger>}
            </TabsList>

            <TabsContent value="headers" className="space-y-3">
              <div className="space-y-2">
                {headers.map((header) => (
                  <div key={header.id} className="flex gap-2">
                    <Input
                      value={header.key}
                      onChange={(e) => updateHeader(header.id, "key", e.target.value)}
                      placeholder="Header key"
                      className="flex-1"
                    />
                    <Input
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, "value", e.target.value)}
                      placeholder="Header value"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeHeader(header.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={addHeader} size="sm">
                <Plus className="size-4 mr-2" />
                Agregar Header
              </Button>
            </TabsContent>

            {method === "POST" && (
              <TabsContent value="body">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="min-h-[200px] font-mono text-sm"
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Response */}
        {(response || statusCode !== null || loopResults.length > 0) && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Respuesta</span>
                {statusCode !== null && !loopEnabled && (
                  <Badge className={getStatusColor(statusCode)}>
                    {statusCode}
                  </Badge>
                )}
              </div>
              {response && (
                <Button variant="outline" size="sm" onClick={copyResponse}>
                  <Copy className="size-4 mr-2" />
                  Copiar
                </Button>
              )}
            </div>

            <Tabs defaultValue={loopResults.length > 0 ? "results" : "body"} className="w-full">
              <TabsList>
                {loopResults.length > 0 && <TabsTrigger value="results">Resultados del Bucle</TabsTrigger>}
                <TabsTrigger value="body">Body</TabsTrigger>
                {!loopEnabled && <TabsTrigger value="headers">Headers</TabsTrigger>}
              </TabsList>

              {loopResults.length > 0 && (
                <TabsContent value="results">
                  <div className="bg-slate-50 rounded-md p-4 max-h-[400px] overflow-y-auto">
                    <div className="space-y-3">
                      {loopResults.map((result) => (
                        <div
                          key={result.id}
                          className="bg-white p-3 rounded border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-600">Petición #{result.id}</span>
                            <div className="flex items-center gap-2">
                              {result.status && (
                                <Badge className={getStatusColor(result.status)}>
                                  {result.status}
                                </Badge>
                              )}
                              <Badge variant="secondary">{result.duration}ms</Badge>
                            </div>
                          </div>
                          {result.error && (
                            <p className="text-red-600 text-sm font-mono">Error: {result.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="body">
                <Textarea
                  value={response}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-slate-50"
                />
              </TabsContent>

              {!loopEnabled && (
                <TabsContent value="headers">
                  <div className="bg-slate-50 rounded-md p-4 min-h-[300px]">
                    {Object.entries(responseHeaders).length > 0 ? (
                      <div className="space-y-2 font-mono text-sm">
                        {Object.entries(responseHeaders).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-slate-600">{key}:</span>
                            <span className="text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No hay headers de respuesta</p>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}