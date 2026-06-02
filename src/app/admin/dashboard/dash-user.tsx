// src/app/admin/dashboard/dash-user.tsx
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Sesuaikan dengan path component library Anda (misal: shadcn)
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// ==========================================
// DATA DUMMY
// ==========================================

// Data untuk Storage (Pie Chart & Cards)
const storageData = [
  { name: 'Used Storage', value: 342, color: '#3b82f6' }, // Biru (342 GB)
  { name: 'Free Storage', value: 170, color: '#e2e8f0' }, // Abu-abu (170 GB)
]
const totalStorage = 512 // GB
const storageInUsed = 342 // GB

// Data untuk 30 Hari Aktivitas (Line Chart)
// Di-generate singkat sebagai representasi 30 hari
const activityData = Array.from({ length: 30 }, (_, i) => ({
  day: `Hari ${i + 1}`,
  tasks: Math.floor(Math.random() * 15) + 2 // Random 2 - 17 tugas selesai
}))

// Data untuk Table My Task Activity
const taskActivity = [
  { id: "1", task: "Revisi Faktur Pajak PT INL", status: "Completed", date: "2026-06-02", priority: "High" },
  { id: "2", task: "Sinkronisasi Docker Container ArdiarTax", status: "In Progress", date: "2026-06-02", priority: "High" },
  { id: "3", task: "Update Route API Backend", status: "Completed", date: "2026-06-01", priority: "Medium" },
  { id: "4", task: "Review SPT Masa PPN", status: "Pending", date: "2026-05-31", priority: "Low" },
  { id: "5", task: "Slicing halaman Dashboard Admin", status: "In Progress", date: "2026-05-30", priority: "Medium" },
]

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function DashUser() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Selamat datang kembali di panel administrasi Anda.</p>
      </div>

      {/* SECTION 1: CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage in Used</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{storageInUsed} GB</div>
            <p className="text-xs text-muted-foreground mt-1">Menggunakan sekitar {((storageInUsed/totalStorage)*100).toFixed(1)}% dari kapasitas total</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Storage</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStorage} GB</div>
            <p className="text-xs text-muted-foreground mt-1">Sisa ruang penyimpanan terdeteksi: {totalStorage - storageInUsed} GB</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: CHARTS */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        {/* Pie Chart: Data Storage */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Data Storage</CardTitle>
            <CardDescription className="text-xs">Rasio ruang terpakai vs kosong</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} GB`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart: Total Activity */}
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Total Activity per Day</CardTitle>
            <CardDescription className="text-xs">Aktivitas pengerjaan tugas dalam 30 hari kebelakang</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" name="Tasks Completed" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: TABLE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">My Task Activity</CardTitle>
          <CardDescription className="text-xs">Daftar log aktivitas dan status tugas terbaru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taskActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{row.task}</td>
                    <td className="px-4 py-3.5 text-slate-500">{row.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.priority === 'High' ? 'bg-red-50 text-red-600' :
                        row.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        row.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        row.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
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