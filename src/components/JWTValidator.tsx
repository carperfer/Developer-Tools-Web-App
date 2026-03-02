import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Copy, Trash2, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
}

export function JWTValidator() {
  const [jwtInput, setJwtInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const decodeJWT = () => {
    try {
      const parts = jwtInput.trim().split('.');
      
      if (parts.length !== 3) {
        throw new Error("El JWT debe tener 3 partes separadas por puntos");
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode header
      const headerJson = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      setDecoded({
        header,
        payload,
        signature
      });

      setIsValid(true);
      setError("");
      toast.success("JWT decodificado correctamente");
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Error al decodificar JWT");
      setDecoded(null);
      toast.error("JWT inválido");
    }
  };

  const copyHeader = () => {
    if (decoded) {
      navigator.clipboard.writeText(JSON.stringify(decoded.header, null, 2));
      toast.success("Header copiado");
    }
  };

  const copyPayload = () => {
    if (decoded) {
      navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
      toast.success("Payload copiado");
    }
  };

  const copySignature = () => {
    if (decoded) {
      navigator.clipboard.writeText(decoded.signature);
      toast.success("Signature copiada");
    }
  };

  const clear = () => {
    setJwtInput("");
    setDecoded(null);
    setIsValid(null);
    setError("");
  };

  const getExpirationStatus = () => {
    if (!decoded?.payload?.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.payload.exp;
    const isExpired = now > exp;

    return {
      isExpired,
      expirationDate: new Date(exp * 1000),
      timeRemaining: exp - now
    };
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 0) return "Expirado";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const expirationStatus = getExpirationStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validador y Decodificador JWT</CardTitle>
        <CardDescription>
          Decodifica y valida tokens JWT (JSON Web Tokens)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-slate-700">Token JWT</label>
          <Textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="Pega tu JWT aquí...&#10;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={decodeJWT}>
            Decodificar JWT
          </Button>
          <Button onClick={clear} variant="outline">
            <Trash2 className="size-4 mr-2" />
            Limpiar
          </Button>
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
                {isValid ? "JWT válido y decodificado" : error}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {decoded && (
          <>
            {/* Token Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
              {decoded.header.alg && (
                <div>
                  <div className="text-slate-600 text-sm">Algoritmo</div>
                  <Badge variant="secondary">{decoded.header.alg}</Badge>
                </div>
              )}
              {decoded.header.typ && (
                <div>
                  <div className="text-slate-600 text-sm">Tipo</div>
                  <Badge variant="secondary">{decoded.header.typ}</Badge>
                </div>
              )}
              {decoded.payload.iss && (
                <div>
                  <div className="text-slate-600 text-sm">Emisor</div>
                  <div className="font-mono text-sm truncate">{decoded.payload.iss}</div>
                </div>
              )}
              {decoded.payload.sub && (
                <div>
                  <div className="text-slate-600 text-sm">Sujeto</div>
                  <div className="font-mono text-sm truncate">{decoded.payload.sub}</div>
                </div>
              )}
            </div>

            {/* Expiration Alert */}
            {expirationStatus && (
              <Alert variant={expirationStatus.isExpired ? "destructive" : "default"}>
                <div className="flex items-start gap-2">
                  {expirationStatus.isExpired ? (
                    <AlertCircle className="size-4 mt-0.5" />
                  ) : (
                    <Clock className="size-4 mt-0.5 text-green-600" />
                  )}
                  <div>
                    <AlertDescription>
                      {expirationStatus.isExpired ? (
                        <>Token expirado el {expirationStatus.expirationDate.toLocaleString()}</>
                      ) : (
                        <>
                          Token válido hasta {expirationStatus.expirationDate.toLocaleString()}
                          <span className="ml-2 text-slate-600">
                            ({formatTimeRemaining(expirationStatus.timeRemaining)} restantes)
                          </span>
                        </>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Decoded Content */}
            <Tabs defaultValue="payload" className="w-full">
              <TabsList>
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="signature">Signature</TabsTrigger>
              </TabsList>

              <TabsContent value="payload" className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700">Contenido del Payload</label>
                  <Button variant="outline" size="sm" onClick={copyPayload}>
                    <Copy className="size-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={JSON.stringify(decoded.payload, null, 2)}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-slate-50"
                />
              </TabsContent>

              <TabsContent value="header" className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700">Contenido del Header</label>
                  <Button variant="outline" size="sm" onClick={copyHeader}>
                    <Copy className="size-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={JSON.stringify(decoded.header, null, 2)}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-slate-50"
                />
              </TabsContent>

              <TabsContent value="signature" className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700">Signature (Base64)</label>
                  <Button variant="outline" size="sm" onClick={copySignature}>
                    <Copy className="size-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={decoded.signature}
                  readOnly
                  className="min-h-[150px] font-mono text-sm bg-slate-50"
                />
                <Alert>
                  <AlertDescription className="text-sm">
                    ⚠️ Este decodificador solo muestra el contenido del JWT. No verifica la firma criptográfica.
                    Para validar la autenticidad del token, necesitas verificar la firma con la clave secreta en el servidor.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
