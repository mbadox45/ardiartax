"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar 
} from 'recharts'
import { 
  Server, Users, HardDrive, 
  Activity, LayoutGrid 
} from 'lucide-react'
import { dashboardService } from "@/lib/api/dashboard.service"


// ==========================================
// DATA DUMMY SUPERADMIN
// ==========================================

// 1. Data Server Storage (Global)
const serverStorageData = [
  { name: 'Used Server', value: 6400, color: '#ef4444' }, // Merah (6.4 TB)
  { name: 'Free Server', value: 3600, color: '#22c55e' }, // Hijau (3.6 TB)
]
const totalServerCapacity = "10 TB"
const usedServerCapacity = "6.4 TB"

// 2. Data Folder per Group (Bar Chart)
const folderByGroupData = [
  { group: 'Finance', folders: 42 },
  { group: 'IT Support', folders: 85 },
  { group: 'Marketing', folders: 28 },
  { group: 'HRD', folders: 15 },
  { group: 'Legal', folders: 22 },
]

// 3. Global Activity Trend (Line Chart - 30 Hari)
const globalActivityData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  actions: Math.floor(Math.random() * 100) + 50 // Aktivitas lebih tinggi untuk global
}))

// 4. Tabel Aktivitas Keseluruhan User
const allUserActivity = [
  { id: "1", user: "Budi Santoso", task: "Upload Dokumen SPT 2025", group: "Finance", status: "Success", date: "2026-06-02 14:20" },
  { id: "2", user: "Siti Aminah", task: "Delete Folder Project Alpha", group: "IT Support", status: "Warning", date: "2026-06-02 13:05" },
  { id: "3", user: "Andi Wijaya", task: "Shared Folder 'Klien A' to Marketing", group: "Marketing", status: "Success", date: "2026-06-02 11:45" },
  { id: "4", user: "Rina Putri", task: "Update Access Level - Group HRD", group: "Superadmin", status: "System", date: "2026-06-02 09:30" },
  { id: "5", user: "Eko Prasetyo", task: "Download Backup Database", group: "IT Support", status: "Success", date: "2026-06-01 17:10" },
]

interface folderGroups {
  group_name: string
  count: number
}
export default function DashSuperadmin() {
  const [globalUsedStorage, setGlobalUsedStorage] = useState<string | "0 B">("0 B")
  const [serverCapacity, setServerCapacity] = useState<string | "0 B">("0 B")
  const [totalGroups, setTotalGroups] = useState<number>(0)
  const [sharedFolders, setSharedFolders] = useState<number>(0)
  const [totalActivities, setTotalActivities] = useState<string | "-">("-")
  const [sharedFolderGroups, setSharedFolderGroups] = useState<folderGroups[]>([])

  useEffect(() => {
    const fetchStorageStats = async () => {
      try {
        const stats = await dashboardService.getStorageStats()
        
        const card = stats.cards
        setGlobalUsedStorage(`${card.global_used_storage.total} ${card.global_used_storage.formatted}`)
        setServerCapacity(`${card.server_capacity.total} ${card.server_capacity.formatted}`)
        setTotalGroups(card.total_groups)
        setSharedFolders(card.shared_folders)

        const chartData = stats.charts
        setSharedFolderGroups(chartData.shared_folders_by_group)
      } catch (error) {
        console.error("Gagal mengambil data statistik dashboard:", error)
      }
    }
    fetchStorageStats()
  }, [])
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Superadmin Console</h1>
        <p className="text-muted-foreground">Monitor infrastruktur server dan aktivitas seluruh departemen.</p>
      </div>

      {/* SECTION 1: 5 CARDS SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Server Storage */}
        <Card className="shadow-sm border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-blue-600">Server Capacity</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverCapacity}</div>
            <p className="text-[10px] text-blue-500 font-medium">Used: {globalUsedStorage}</p>
          </CardContent>
        </Card>

        {/* Total Storage In Use (Global) */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Global Used</CardTitle>
            <HardDrive className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalUsedStorage}</div>
            <p className="text-[10px] text-red-500 font-medium">64% Consumption</p>
          </CardContent>
        </Card>

        {/* Total Groups */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-[10px] text-muted-foreground">Active Departements</p>
          </CardContent>
        </Card>

        {/* Total Shared Folders */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Shared Folders</CardTitle>
            <LayoutGrid className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedFolders}</div>
            <p className="text-[10px] text-emerald-600 font-medium">+12 Baru minggu ini</p>
          </CardContent>
        </Card>

        {/* Total Activity */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Today Actions</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-[10px] text-muted-foreground">Total server requests</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: CHARTS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Pie Chart: Server Storage Health */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Server Health</CardTitle>
            <CardDescription className="text-xs">Distribusi ruang penyimpanan global</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serverStorageData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {serverStorageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Folders per Group */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Shared Folders by Group</CardTitle>
            <CardDescription className="text-xs">Distribusi folder per departemen</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sharedFolderGroups} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="group_name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart: Global Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Server Traffic (30D)</CardTitle>
            <CardDescription className="text-xs">Tren aktivitas sistem keseluruhan</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" hide />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="actions" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: ALL USER ACTIVITY TABLE */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Global User Activity Log</CardTitle>
            <CardDescription className="text-xs">Aktivitas real-time dari seluruh pengguna sistem</CardDescription>
          </div>
          <button className="text-xs font-medium text-blue-600 hover:underline">Download CSV</button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-100 text-slate-500 font-bold border-b">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUserActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.user}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {row.group}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.task}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{row.date}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        row.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                        row.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}