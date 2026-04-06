import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentUploads, getGetRecentUploadsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Image as ImageIcon, Video, Users, HardDriveUpload, Cpu, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetDashboardStats({
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Uploads"
            value={stats?.totalUploads}
            loading={statsLoading}
            icon={<HardDriveUpload className="w-5 h-5 text-primary" />}
          />
          <StatCard
            title="Images Processed"
            value={stats?.imageCount}
            loading={statsLoading}
            icon={<ImageIcon className="w-5 h-5 text-blue-400" />}
          />
          <StatCard
            title="Videos Processed"
            value={stats?.videoCount}
            loading={statsLoading}
            icon={<Video className="w-5 h-5 text-purple-400" />}
          />
          <StatCard
            title="Active Users"
            value={stats?.totalUsers}
            loading={statsLoading}
            icon={<Users className="w-5 h-5 text-green-400" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Uploads Table */}
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
                          <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-8"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-20"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-24"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-secondary rounded w-12"></div></td>
                        </tr>
                      ))
                    ) : uploadsError ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-destructive font-mono">
                          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                          Failed to load recent operations
                        </td>
                      </tr>
                    ) : uploads?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-mono">
                          No recent operations recorded
                        </td>
                      </tr>
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
                          <td className="px-4 py-3 font-mono">USR_{upload.userId}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                            {format(new Date(upload.createdAt), "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="px-4 py-3">
                            <a 
                              href={upload.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:underline font-mono text-xs"
                            >
                              VIEW_LINK
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* System Status Panel */}
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
                        <span className={`w-3 h-3 rounded-full ${stats?.botStatus === 'online' ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.6)]'}`} />
                        <span className="text-xl font-bold uppercase tracking-wider font-mono">
                          {stats?.botStatus || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground mb-2 font-mono">Diagnostics</div>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uptime</span>
                          <span>99.9%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latency</span>
                          <span className="text-green-400">24ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Memory</span>
                          <span>128MB / 512MB</span>
                        </div>
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

function StatCard({ 
  title, 
  value, 
  loading, 
  icon 
}: { 
  title: string; 
  value?: number; 
  loading: boolean;
  icon: React.ReactNode;
}) {
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
          <div className="text-3xl font-bold font-mono tracking-tight">{value?.toLocaleString() || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
