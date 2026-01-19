"use client";

import { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/dates";
import {
  createImportJobAction,
  getImportJobsAction,
  getImportJobByIdAction,
} from "@/server/actions/import.actions";
import type { ImportJob } from "@prisma/client";

interface ImportJobExtended extends ImportJob {
  queueProgress?: number;
  queueState?: string;
}

const statusLabels = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
};

const statusIcons = {
  PENDING: Clock,
  PROCESSING: Loader2,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export function ImportContent() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<ImportJobExtended[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState({
    date: "",
    amount: "",
    description: "",
    type: "",
    category: "",
    account: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const jobsData = await getImportJobsAction();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!activeJobId) return;

    const interval = setInterval(async () => {
      try {
        const job = await getImportJobByIdAction(activeJobId);
        if (job) {
          setJobs((prev) =>
            prev.map((j) => (j.id === job.id ? job : j))
          );

          if (job.status === "COMPLETED" || job.status === "FAILED") {
            setActiveJobId(null);
            loadJobs();
          }
        }
      } catch (error) {
        console.error("Error checking job status:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobId, loadJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
      });

      const headers = parsed.meta.fields || [];
      setCsvHeaders(headers);
      setCsvPreview(parsed.data as Record<string, string>[]);

      const guessMapping = {
        date: headers.find((h) =>
          /fecha|date|day/i.test(h)
        ) || "",
        amount: headers.find((h) =>
          /monto|amount|valor|value|total/i.test(h)
        ) || "",
        description: headers.find((h) =>
          /descripcion|description|concepto|note/i.test(h)
        ) || "",
        type: headers.find((h) =>
          /tipo|type|category|categoria/i.test(h)
        ) || "",
        category: "",
        account: "",
      };

      setMapping(guessMapping);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvFile) {
      toast.error("Selecciona un archivo CSV");
      return;
    }

    if (!mapping.date || !mapping.amount) {
      toast.error("Mapea al menos los campos Fecha y Monto");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;

        const job = await createImportJobAction(
          csvFile.name,
          csvData,
          mapping
        );

        toast.success("Importación iniciada");
        setActiveJobId(job.id);
        setCsvFile(null);
        setCsvHeaders([]);
        setCsvPreview([]);
        setMapping({
          date: "",
          amount: "",
          description: "",
          type: "",
          category: "",
          account: "",
        });
        loadJobs();
      };

      reader.readAsText(csvFile);
    } catch (error) {
      toast.error("Error al iniciar la importación");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar CSV</h1>
        <p className="text-muted-foreground">
          Importa transacciones desde un archivo CSV
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subir Archivo</CardTitle>
          <CardDescription>
            Selecciona un archivo CSV con tus transacciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <span className="text-sm font-medium">
                {csvFile ? csvFile.name : "Haz clic para seleccionar un archivo CSV"}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Máximo 10MB
              </span>
            </label>
          </div>

          {csvHeaders.length > 0 && (
            <>
              {/* Column Mapping */}
              <div className="space-y-4">
                <h3 className="font-medium">Mapeo de Columnas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Select
                      value={mapping.date}
                      onValueChange={(v) =>
                        setMapping((prev) => ({ ...prev, date: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Monto *</Label>
                    <Select
                      value={mapping.amount}
                      onValueChange={(v) =>
                        setMapping((prev) => ({ ...prev, amount: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Select
                      value={mapping.description || "none"}
                      onValueChange={(v) =>
                        setMapping((prev) => ({ ...prev, description: v === "none" ? "" : v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo (Ingreso/Gasto)</Label>
                    <Select
                      value={mapping.type || "none"}
                      onValueChange={(v) =>
                        setMapping((prev) => ({ ...prev, type: v === "none" ? "" : v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Vista Previa (primeras 5 filas)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted">
                          {csvHeaders.map((h) => (
                            <th key={h} className="p-2 border text-left">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i}>
                            {csvHeaders.map((h) => (
                              <td key={h} className="p-2 border">
                                {row[h] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={isUploading || !mapping.date || !mapping.amount}
                className="w-full"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Iniciar Importación
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Historial de Importaciones</CardTitle>
            <CardDescription>
              Tus importaciones recientes
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ImportHistorySkeleton />
          ) : jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay importaciones previas
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const StatusIcon = statusIcons[job.status];
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`h-5 w-5 ${
                          job.status === "PROCESSING" ? "animate-spin" : ""
                        }`}
                      />
                      <div>
                        <p className="font-medium">{job.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {job.status === "PROCESSING" && (
                        <div className="w-24">
                          <Progress
                            value={job.queueProgress || 0}
                            className="h-2"
                          />
                        </div>
                      )}

                      {job.status === "COMPLETED" && (
                        <div className="text-sm text-muted-foreground">
                          {job.successRows} ok / {job.errorRows} errores
                        </div>
                      )}

                      <Badge
                        variant="secondary"
                        className={statusColors[job.status]}
                      >
                        {statusLabels[job.status]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImportHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
