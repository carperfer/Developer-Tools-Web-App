import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Copy, Trash2, Lock, Unlock, Hash } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";

export function Encryptor() {
  // AES Encryption
  const [aesText, setAesText] = useState("");
  const [aesKey, setAesKey] = useState("");
  const [aesEncrypted, setAesEncrypted] = useState("");
  const [aesDecrypted, setAesDecrypted] = useState("");
  const [aesEncryptedInput, setAesEncryptedInput] = useState("");

  // Hashing
  const [hashText, setHashText] = useState("");
  const [hashAlgorithm, setHashAlgorithm] = useState<"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">("SHA-256");
  const [hashOutput, setHashOutput] = useState("");

  // Classical Cipher
  const [classicalText, setClassicalText] = useState("");
  const [classicalKey, setClassicalKey] = useState("13");
  const [classicalOutput, setClassicalOutput] = useState("");

  // AES Encryption using Web Crypto API
  const encryptAES = async () => {
    try {
      if (!aesText || !aesKey) {
        toast.error("Por favor ingresa texto y clave");
        return;
      }

      // Derive key from password
      const encoder = new TextEncoder();
      const keyMaterial = encoder.encode(aesKey);
      const key = await crypto.subtle.digest("SHA-256", keyMaterial);
      
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encoder.encode(aesText)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64
      const base64 = btoa(String.fromCharCode(...combined));
      setAesEncrypted(base64);
      toast.success("Texto encriptado con AES-256-GCM");
    } catch (e) {
      toast.error("Error al encriptar");
      console.error(e);
    }
  };

  const decryptAES = async () => {
    try {
      if (!aesEncryptedInput || !aesKey) {
        toast.error("Por favor ingresa texto encriptado y clave");
        return;
      }

      // Derive key from password
      const encoder = new TextEncoder();
      const keyMaterial = encoder.encode(aesKey);
      const key = await crypto.subtle.digest("SHA-256", keyMaterial);
      
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      // Decode base64
      const combined = Uint8Array.from(atob(aesEncryptedInput), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const text = decoder.decode(decrypted);
      setAesDecrypted(text);
      toast.success("Texto desencriptado correctamente");
    } catch (e) {
      toast.error("Error al desencriptar. Verifica la clave");
      console.error(e);
    }
  };

  // Hashing
  const generateHash = async () => {
    try {
      if (!hashText) {
        toast.error("Por favor ingresa texto");
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(hashText);
      const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashOutput(hashHex);
      toast.success(`Hash ${hashAlgorithm} generado`);
    } catch (e) {
      toast.error("Error al generar hash");
    }
  };

  // ROT13 / Caesar Cipher
  const caesarEncrypt = () => {
    try {
      if (!classicalText) {
        toast.error("Por favor ingresa texto");
        return;
      }

      const shift = parseInt(classicalKey) || 0;
      let result = "";
      
      for (let i = 0; i < classicalText.length; i++) {
        let char = classicalText[i];
        
        if (char.match(/[a-z]/i)) {
          const code = classicalText.charCodeAt(i);
          
          // Uppercase letters
          if (code >= 65 && code <= 90) {
            char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
          }
          // Lowercase letters
          else if (code >= 97 && code <= 122) {
            char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
          }
        }
        
        result += char;
      }
      
      setClassicalOutput(result);
      toast.success(`Texto cifrado con desplazamiento ${shift}`);
    } catch (e) {
      toast.error("Error al cifrar");
    }
  };

  const caesarDecrypt = () => {
    try {
      if (!classicalText) {
        toast.error("Por favor ingresa texto");
        return;
      }

      const shift = parseInt(classicalKey) || 0;
      let result = "";
      
      for (let i = 0; i < classicalText.length; i++) {
        let char = classicalText[i];
        
        if (char.match(/[a-z]/i)) {
          const code = classicalText.charCodeAt(i);
          
          // Uppercase letters
          if (code >= 65 && code <= 90) {
            char = String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
          }
          // Lowercase letters
          else if (code >= 97 && code <= 122) {
            char = String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
          }
        }
        
        result += char;
      }
      
      setClassicalOutput(result);
      toast.success(`Texto descifrado con desplazamiento ${shift}`);
    } catch (e) {
      toast.error("Error al descifrar");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encriptación y Hashing</CardTitle>
        <CardDescription>
          Encripta, desencripta y genera hashes con diferentes algoritmos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="aes">AES (Encriptación)</TabsTrigger>
            <TabsTrigger value="hash">Hash</TabsTrigger>
            <TabsTrigger value="caesar">Cifrado César</TabsTrigger>
          </TabsList>

          {/* AES Encryption */}
          <TabsContent value="aes" className="space-y-6">
            <Alert>
              <AlertDescription className="text-sm">
                🔒 Encriptación AES-256-GCM. Los datos no se envían a ningún servidor, todo se procesa en tu navegador.
              </AlertDescription>
            </Alert>

            {/* Encrypt */}
            <div className="space-y-4 pb-6 border-b">
              <h3 className="flex items-center gap-2">
                <Lock className="size-4" />
                Encriptar
              </h3>
              
              <div className="space-y-2">
                <Label>Texto a encriptar</Label>
                <Textarea
                  value={aesText}
                  onChange={(e) => setAesText(e.target.value)}
                  placeholder="Ingresa el texto a encriptar..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Clave secreta</Label>
                <Input
                  type="password"
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value)}
                  placeholder="Ingresa una clave segura..."
                />
              </div>

              <Button onClick={encryptAES}>
                <Lock className="size-4 mr-2" />
                Encriptar
              </Button>

              {aesEncrypted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Texto encriptado</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(aesEncrypted);
                        toast.success("Copiado");
                      }}
                    >
                      <Copy className="size-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={aesEncrypted}
                    readOnly
                    className="min-h-[120px] font-mono text-sm bg-slate-50"
                  />
                </div>
              )}
            </div>

            {/* Decrypt */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Unlock className="size-4" />
                Desencriptar
              </h3>

              <div className="space-y-2">
                <Label>Texto encriptado</Label>
                <Textarea
                  value={aesEncryptedInput}
                  onChange={(e) => setAesEncryptedInput(e.target.value)}
                  placeholder="Pega el texto encriptado aquí..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Clave secreta</Label>
                <Input
                  type="password"
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value)}
                  placeholder="Ingresa la clave usada para encriptar..."
                />
              </div>

              <Button onClick={decryptAES}>
                <Unlock className="size-4 mr-2" />
                Desencriptar
              </Button>

              {aesDecrypted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Texto desencriptado</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(aesDecrypted);
                        toast.success("Copiado");
                      }}
                    >
                      <Copy className="size-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={aesDecrypted}
                    readOnly
                    className="min-h-[120px] font-mono text-sm bg-slate-50"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Hashing */}
          <TabsContent value="hash" className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                🔐 Los hashes son unidireccionales y no pueden ser revertidos. Útil para verificar integridad de datos.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Texto a hashear</Label>
              <Textarea
                value={hashText}
                onChange={(e) => setHashText(e.target.value)}
                placeholder="Ingresa el texto para generar el hash..."
                className="min-h-[150px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Algoritmo</Label>
              <Select value={hashAlgorithm} onValueChange={(v: any) => setHashAlgorithm(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA-1">SHA-1</SelectItem>
                  <SelectItem value="SHA-256">SHA-256</SelectItem>
                  <SelectItem value="SHA-384">SHA-384</SelectItem>
                  <SelectItem value="SHA-512">SHA-512</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateHash}>
              <Hash className="size-4 mr-2" />
              Generar Hash
            </Button>

            {hashOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hash generado ({hashAlgorithm})</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(hashOutput);
                      toast.success("Copiado");
                    }}
                  >
                    <Copy className="size-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={hashOutput}
                  readOnly
                  className="min-h-[100px] font-mono text-sm bg-slate-50"
                />
              </div>
            )}
          </TabsContent>

          {/* Caesar Cipher */}
          <TabsContent value="caesar" className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                📜 Cifrado César: un cifrado simple por sustitución. ROT13 usa desplazamiento 13.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Texto</Label>
              <Textarea
                value={classicalText}
                onChange={(e) => setClassicalText(e.target.value)}
                placeholder="Ingresa el texto..."
                className="min-h-[150px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Desplazamiento (1-25, usa 13 para ROT13)</Label>
              <Input
                type="number"
                min="1"
                max="25"
                value={classicalKey}
                onChange={(e) => setClassicalKey(e.target.value)}
                placeholder="13"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={caesarEncrypt}>
                <Lock className="size-4 mr-2" />
                Cifrar
              </Button>
              <Button onClick={caesarDecrypt} variant="outline">
                <Unlock className="size-4 mr-2" />
                Descifrar
              </Button>
            </div>

            {classicalOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Resultado</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(classicalOutput);
                      toast.success("Copiado");
                    }}
                  >
                    <Copy className="size-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={classicalOutput}
                  readOnly
                  className="min-h-[150px] font-mono text-sm bg-slate-50"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
