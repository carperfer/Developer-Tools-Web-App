import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

type Operation = {
  type: "equal" | "added" | "removed";
  text: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
};

type DiffRow = {
  type: "equal" | "added" | "removed" | "changed";
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftText: string;
  rightText: string;
};

function buildOperations(leftText: string, rightText: string): Operation[] {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");

  const n = leftLines.length;
  const m = rightLines.length;

  const matrix = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (leftLines[i] === rightLines[j]) {
        matrix[i][j] = matrix[i + 1][j + 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i + 1][j], matrix[i][j + 1]);
      }
    }
  }

  const operations: Operation[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (leftLines[i] === rightLines[j]) {
      operations.push({
        type: "equal",
        text: leftLines[i],
        leftLineNumber: i + 1,
        rightLineNumber: j + 1,
      });
      i++;
      j++;
      continue;
    }

    if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      operations.push({
        type: "removed",
        text: leftLines[i],
        leftLineNumber: i + 1,
      });
      i++;
    } else {
      operations.push({
        type: "added",
        text: rightLines[j],
        rightLineNumber: j + 1,
      });
      j++;
    }
  }

  while (i < n) {
    operations.push({
      type: "removed",
      text: leftLines[i],
      leftLineNumber: i + 1,
    });
    i++;
  }

  while (j < m) {
    operations.push({
      type: "added",
      text: rightLines[j],
      rightLineNumber: j + 1,
    });
    j++;
  }

  return operations;
}

function toDiffRows(operations: Operation[]): DiffRow[] {
  const rows: DiffRow[] = [];

  for (let index = 0; index < operations.length; index++) {
    const current = operations[index];
    const next = operations[index + 1];

    if (current.type === "removed" && next?.type === "added") {
      rows.push({
        type: "changed",
        leftLineNumber: current.leftLineNumber,
        rightLineNumber: next.rightLineNumber,
        leftText: current.text,
        rightText: next.text,
      });
      index++;
      continue;
    }

    if (current.type === "equal") {
      rows.push({
        type: "equal",
        leftLineNumber: current.leftLineNumber,
        rightLineNumber: current.rightLineNumber,
        leftText: current.text,
        rightText: current.text,
      });
      continue;
    }

    if (current.type === "removed") {
      rows.push({
        type: "removed",
        leftLineNumber: current.leftLineNumber,
        leftText: current.text,
        rightText: "",
      });
      continue;
    }

    rows.push({
      type: "added",
      rightLineNumber: current.rightLineNumber,
      leftText: "",
      rightText: current.text,
    });
  }

  return rows;
}

export function CodeDiff() {
  const [leftCode, setLeftCode] = useState("");
  const [rightCode, setRightCode] = useState("");
  const [hasCompared, setHasCompared] = useState(false);

  const rows = useMemo(() => {
    if (!hasCompared) {
      return [];
    }

    const operations = buildOperations(leftCode, rightCode);
    return toDiffRows(operations);
  }, [hasCompared, leftCode, rightCode]);

  const compare = () => {
    if (!leftCode.trim() && !rightCode.trim()) {
      toast.error("Ingresa contenido en ambos paneles para comparar");
      return;
    }

    setHasCompared(true);
    toast.success("Comparación completada");
  };

  const clear = () => {
    setLeftCode("");
    setRightCode("");
    setHasCompared(false);
  };

  const rowClass = (type: DiffRow["type"]) => {
    if (type === "added") {
      return "bg-green-50 text-green-900";
    }

    if (type === "removed") {
      return "bg-red-50 text-red-900";
    }

    if (type === "changed") {
      return "bg-amber-50 text-amber-900";
    }

    return "bg-white text-slate-700";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparador de Código (Diff)</CardTitle>
        <CardDescription>
          Compara dos bloques de código y visualiza las diferencias por línea
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-700">Código A</label>
            <Textarea
              value={leftCode}
              onChange={(event) => setLeftCode(event.target.value)}
              placeholder="Pega aquí el primer código..."
              className="min-h-[260px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-700">Código B</label>
            <Textarea
              value={rightCode}
              onChange={(event) => setRightCode(event.target.value)}
              placeholder="Pega aquí el segundo código..."
              className="min-h-[260px] font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={compare}>Comparar</Button>
          <Button onClick={clear} variant="outline">
            <Trash2 className="size-4 mr-2" />
            Limpiar
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-slate-700">Diferencias</label>
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_80px_1fr] gap-px bg-slate-200 text-xs font-medium text-slate-700">
              <div className="bg-slate-100 px-3 py-2">Línea A</div>
              <div className="bg-slate-100 px-3 py-2">Contenido A</div>
              <div className="bg-slate-100 px-3 py-2">Línea B</div>
              <div className="bg-slate-100 px-3 py-2">Contenido B</div>
            </div>

            <div className="max-h-[320px] overflow-auto">
              {!hasCompared ? (
                <div className="px-3 py-6 text-sm text-slate-500 bg-white">
                  Pulsa "Comparar" para ver las diferencias
                </div>
              ) : rows.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-500 bg-white">
                  No hay diferencias
                </div>
              ) : (
                rows.map((row, index) => (
                  <div
                    key={`${row.leftLineNumber ?? "-"}-${row.rightLineNumber ?? "-"}-${index}`}
                    className={`grid grid-cols-[80px_1fr_80px_1fr] gap-px bg-slate-200 ${rowClass(row.type)}`}
                  >
                    <div className="px-3 py-1.5 bg-inherit text-xs text-right tabular-nums">
                      {row.leftLineNumber ?? ""}
                    </div>
                    <pre className="px-3 py-1.5 bg-inherit text-xs font-mono whitespace-pre-wrap break-all">
                      {row.leftText}
                    </pre>
                    <div className="px-3 py-1.5 bg-inherit text-xs text-right tabular-nums">
                      {row.rightLineNumber ?? ""}
                    </div>
                    <pre className="px-3 py-1.5 bg-inherit text-xs font-mono whitespace-pre-wrap break-all">
                      {row.rightText}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
