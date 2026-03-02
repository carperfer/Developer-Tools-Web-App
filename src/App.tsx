import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { JsonFormatter } from "./components/JsonFormatter";
import { Base64Converter } from "./components/Base64Converter";
import { URLEncoder } from "./components/URLEncoder";
import { JWTValidator } from "./components/JWTValidator";
import { Encryptor } from "./components/Encryptor";
import { ApiTester } from "./components/ApiTester";
import { CodeDiff } from "./components/CodeDiff";
import { TotpGenerator } from "./components/TotpGenerator";
import { Clock3, Code2, FileJson, GitCompare, Globe, Link, KeyRound, Shield } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-slate-900 mb-2">Herramientas para Desarrolladores</h1>
          <p className="text-slate-600">Suite de utilidades para trabajar con JSON, Base64 y APIs</p>
        </header>

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="flex w-full mb-6 overflow-x-auto justify-start">
            <TabsTrigger value="json" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <FileJson className="size-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="base64" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Code2 className="size-4" />
              Base64
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Link className="size-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="jwt" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <KeyRound className="size-4" />
              JWT
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Shield className="size-4" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Globe className="size-4" />
              API Tester
            </TabsTrigger>
            <TabsTrigger value="diff" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <GitCompare className="size-4" />
              Diff
            </TabsTrigger>
            <TabsTrigger value="totp" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Clock3 className="size-4" />
              TOTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json">
            <JsonFormatter />
          </TabsContent>

          <TabsContent value="base64">
            <Base64Converter />
          </TabsContent>

          <TabsContent value="url">
            <URLEncoder />
          </TabsContent>

          <TabsContent value="jwt">
            <JWTValidator />
          </TabsContent>

          <TabsContent value="crypto">
            <Encryptor />
          </TabsContent>

          <TabsContent value="api">
            <ApiTester />
          </TabsContent>

          <TabsContent value="diff">
            <CodeDiff />
          </TabsContent>

          <TabsContent value="totp">
            <TotpGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}