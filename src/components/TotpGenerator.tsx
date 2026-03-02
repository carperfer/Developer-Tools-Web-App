import { useEffect, useMemo, useState } from "react";
import { generateSecret, generateSync, generateURI } from "otplib";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Copy, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function TotpGenerator() {
  const [authenticatorUrl, setAuthenticatorUrl] = useState("");
  const [token, setToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [generationError, setGenerationError] = useState("");

  const parsedOtpAuth = useMemo(() => {
    const value = authenticatorUrl.trim();

    if (!value) {
      return {
        otpAuthUrl: "",
        secret: "",
        period: 30,
        digits: 6,
        error: "",
      };
    }

    try {
      const parsedUrl = new URL(value);

      if (parsedUrl.protocol !== "otpauth:") {
        return {
          otpAuthUrl: "",
          secret: "",
          period: 30,
          digits: 6,
          error: "La URL debe iniciar con otpauth://",
        };
      }

      if (parsedUrl.hostname.toLowerCase() !== "totp") {
        return {
          otpAuthUrl: "",
          secret: "",
          period: 30,
          digits: 6,
          error: "Solo se admite otpauth://totp/...",
        };
      }

      const secret = parsedUrl.searchParams.get("secret")?.replace(/\s+/g, "") ?? "";
      if (!secret) {
        return {
          otpAuthUrl: "",
          secret: "",
          period: 30,
          digits: 6,
          error: "La URL no contiene el parámetro secret",
        };
      }

      const rawPeriod = Number(parsedUrl.searchParams.get("period") ?? "30");
      const period = Number.isFinite(rawPeriod) && rawPeriod > 0 ? rawPeriod : 30;

      const rawDigits = Number(parsedUrl.searchParams.get("digits") ?? "6");
      const digits = rawDigits === 6 || rawDigits === 7 || rawDigits === 8 ? rawDigits : 6;

      return {
        otpAuthUrl: value,
        secret,
        period,
        digits,
        error: "",
      };
    } catch {
      return {
        otpAuthUrl: "",
        secret: "",
        period: 30,
        digits: 6,
        error: "URL inválida",
      };
    }
  }, [authenticatorUrl]);

  useEffect(() => {
    const updateToken = () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remaining = parsedOtpAuth.period - (nowInSeconds % parsedOtpAuth.period);
      setSecondsLeft(remaining === 0 ? parsedOtpAuth.period : remaining);

      if (!parsedOtpAuth.otpAuthUrl || parsedOtpAuth.error) {
        setToken("");
        setGenerationError("");
        return;
      }

      try {
        const nextToken = generateSync({
          strategy: "totp",
          secret: parsedOtpAuth.secret,
          period: parsedOtpAuth.period,
          digits: parsedOtpAuth.digits,
        });
        setToken(nextToken);
        setGenerationError("");
      } catch (error) {
        setToken("");
        setGenerationError(error instanceof Error ? error.message : "No se pudo generar el código");
      }
    };

    updateToken();
    const intervalId = setInterval(updateToken, 1000);

    return () => clearInterval(intervalId);
  }, [parsedOtpAuth]);

  useEffect(() => {
    let isMounted = true;

    const generateQr = async () => {
      if (!parsedOtpAuth.otpAuthUrl || parsedOtpAuth.error || generationError) {
        setQrDataUrl("");
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(parsedOtpAuth.otpAuthUrl, {
          width: 220,
          margin: 1,
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (isMounted) {
          setQrDataUrl("");
        }
      }
    };

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [parsedOtpAuth, generationError]);

  const copyToken = () => {
    if (!token) {
      return;
    }

    navigator.clipboard.writeText(token);
    toast.success("Código TOTP copiado");
  };

  const copyOtpAuthUrl = () => {
    if (!parsedOtpAuth.otpAuthUrl) {
      return;
    }

    navigator.clipboard.writeText(parsedOtpAuth.otpAuthUrl);
    toast.success("URI OTP copiada");
  };

  const regenerateUrl = () => {
    const randomSeed = generateSecret({ length: 20 });
    const demoUrl = generateURI({
      strategy: "totp",
      issuer: "Developer Tools",
      label: "usuario",
      secret: randomSeed,
      period: 30,
      digits: 6,
    });
    setAuthenticatorUrl(demoUrl);
    toast.success("URL de Authenticator generada");
  };

  const progressValue = (secondsLeft / parsedOtpAuth.period) * 100;
  const errorMessage = parsedOtpAuth.error || generationError;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador TOTP</CardTitle>
        <CardDescription>
          Pega una URL de Authenticator (otpauth://...) para generar el código temporal y el QR
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-slate-700">URL de Authenticator</label>
          <div className="flex gap-2">
            <Input
              value={authenticatorUrl}
              onChange={(event) => setAuthenticatorUrl(event.target.value)}
              placeholder="Ejemplo: otpauth://totp/Google:usuario?secret=...&issuer=Google"
              className="font-mono"
            />
            <Button onClick={regenerateUrl} variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Generar URL
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 border rounded-md p-4 bg-slate-50">
            <div>
              <p className="text-slate-600 text-sm">Código actual</p>
              <p className="font-mono text-4xl tracking-widest text-slate-900">
                {token || "------"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-600">Válido por {secondsLeft}s</p>
              <Progress value={progressValue} className="h-2" />
            </div>

            <Button onClick={copyToken} variant="outline" disabled={!token}>
              <Copy className="size-4 mr-2" />
              Copiar código
            </Button>
          </div>

          <div className="space-y-3 border rounded-md p-4 bg-slate-50">
            <p className="text-slate-600 text-sm">QR para importar en otra app</p>
            <div className="min-h-[220px] flex items-center justify-center rounded-md bg-white border">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR TOTP" className="size-[220px]" />
              ) : (
                <p className="text-sm text-slate-500 px-4 text-center">
                  Ingresa una semilla válida para generar el QR
                </p>
              )}
            </div>
            <Button onClick={copyOtpAuthUrl} variant="outline" disabled={!parsedOtpAuth.otpAuthUrl || !!errorMessage}>
              <Copy className="size-4 mr-2" />
              Copiar URI OTP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
