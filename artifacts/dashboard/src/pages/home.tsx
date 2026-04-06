import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentUploads, getGetRecentUploadsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Image as ImageIcon, Video, Users, HardDriveUpload, Cpu, AlertTriangle, Upload, Copy, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef } from "react";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  const { data: uploads, isLoading: uploadsLoading, isError: uploadsError } = useGetRecentUploads({
    query: { queryKey: getGetRecentUploadsQueryKey() }
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">Real-time telemetry and operation metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Uploads" value={stats?.totalUploads} loading={statsLoading} icon={<HardDriveUpload className="w-5 h-5 text-primary" />} />
          <StatCard title="Images Processed" value={stats?.imageCount} loading={statsLoading} icon={<ImageIcon className="w-5 h-5 text-blue-400" />} />
          <StatCard title="Videos Processed" value={stats?.videoCount} loading={statsLoading} icon={<Video className="w-5 h-5 text-purple-400" />} />
          <StatCard title="Active Users" value={stats?.totalUsers} loading={statsLoading} icon={<Users className="w-5 h-5 text-green-400" />} />
        </div>

        <UploadPanel onUploadComplete={() => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentUploadsQueryKey() });
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
              <Activity className="w-4 h-4" />
              Recent Operations
            </h2>
            <Card className="bg-card/50 border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-mono text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">User ID</th>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                      <th className="px-4 py-3 font-medium">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {uploadsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse bg-secondary/10">
                          {[8, 16, 20, 24, 12].map((w, j) => (
                            <td key={j} className="px-4 py-3"><div className={`h-4 bg-secondary rounded w-${w}`}></div></td>
                          ))}
                        </tr>
                      ))
                    ) : uploadsError ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-destructive font-mono"><AlertTriangle className="w-6 h-6 mx-auto mb-2" />Failed to load</td></tr>
                    ) : uploads?.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-mono">No recent operations recorded</td></tr>
                    ) : (
                      uploads?.map((upload) => (
                        <tr key={upload.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-muted-foreground">#{upload.id}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                              upload.fileType === 'image'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {upload.fileType === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {upload.fileType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono">{upload.userId === 0 ? "DASHBOARD" : `USR_${upload.userId}`}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{format(new Date(upload.createdAt), "yyyy-MM-dd HH:mm:ss")}</td>
                          <td className="px-4 py-3">
                            <CopyLink url={upload.fileUrl} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
              <Cpu className="w-4 h-4" />
              Bot Status
            </h2>
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                {statsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                    <div className="h-10 bg-secondary rounded w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 font-mono">Current State</div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${stats?.botStatus === 'online' ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'bg-destructive'}`} />
                        <span className="text-xl font-bold uppercase tracking-wider font-mono">{stats?.botStatus || 'UNKNOWN'}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground mb-2 font-mono">Diagnostics</div>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Uptime</span><span>99.9%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span className="text-green-400">24ms</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Memory</span><span>128MB / 512MB</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function UploadPanel({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch(`${import.meta.env.BASE_URL}api/dashboard/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        setResult({ url: data.url });
        onUploadComplete();
      } else {
        setResult({ url: "", error: data.error || "Upload failed" });
      }
    } catch {
      setResult({ url: "", error: "Network error" });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-2">
        <Upload className="w-4 h-4" />
        Upload File — Get Link
      </h2>
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6 space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/20"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground font-mono">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-mono text-foreground">Drop image or video here, or click to select</p>
                <p className="text-xs text-muted-foreground font-mono">Supports: JPG, PNG, GIF, WebP, MP4, MOV, MKV</p>
              </div>
            )}
          </div>

          {result && (
            <div className={`rounded-lg p-4 font-mono text-sm flex items-center gap-3 ${
              result.error ? "bg-destructive/10 border border-destructive/30 text-destructive" : "bg-primary/10 border border-primary/30"
            }`}>
              {result.error ? (
                <><X className="w-4 h-4 shrink-0" /><span>{result.error}</span></>
              ) : (
                <>
                  <span className="truncate flex-1 text-primary">{result.url}</span>
                  <button
                    onClick={() => copyToClipboard(result.url)}
                    className="shrink-0 hover:text-primary transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a href={result.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-muted-foreground hover:text-primary transition-colors">
                    VIEW
                  </a>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 text-primary hover:underline font-mono text-xs"
      title={url}
    >
      {copied ? <><Check className="w-3 h-3 text-green-400" />COPIED</> : <><Copy className="w-3 h-3" />COPY LINK</>}
    </button>
  );
}

function StatCard({ title, value, loading, icon }: { title: string; value?: number; loading: boolean; icon: React.ReactNode }) {
  return (
    <Card className="bg-card/50 border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="h-8 bg-secondary rounded w-16 animate-pulse"></div>
        ) : (
          <div className="text-3xl font-bold font-mono tracking-tight">{value?.toLocaleString() ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
