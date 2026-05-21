import {
    Camera,
    ListTodo,
    LayoutDashboard,
    Database,
    FileText,
    FileText as FileDescription,
    FileText as FileWord,
    Folder,
    HelpCircle,
    PanelTop,
    List,
    FileBarChart,
    Search,
    Settings,
    Users,
    Group,
    Network,
    HardDrive,
    Ship,
    Clipboard,
    LucideIcon
} from "lucide-react";

import Cookies from "js-cookie";

export interface MenuItem {
  title: string
  url: string              // Gunakan 'url' agar cocok dengan properti di NavMain
  icon?: LucideIcon        // Menggunakan LucideIcon agar serasi dengan NavMain
  isActive?: boolean
  items?: {
    title: string
    icon?: LucideIcon
    url: string
  }[]
}

export const menuForSuperAdmin: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        url: "#",
        icon: List,
        items: [
            {
                title: "Task Board",
                icon: ListTodo,
                url: "/admin/activities/task-board",
            },
            {
                title: "Recap Invoices",
                icon: Clipboard,
                url: "/admin/activities/recap-invoices",
            },
        ],
    },
    {
        title: "Goods Export",
        url: "/admin/peb",
        icon: Ship,
    },
    {
        title: "Documents",
        url: "#",
        icon: Folder,
        items: [
            {
                title: "My Documents",
                url: "/admin/documents/my-documents",
            },
            {
                title: "Document Sharing",
                url: "/admin/documents/sharing",
            },
        ],
    },
    {
        title: "Management System",
        url: "#",
        icon: Network,
        items: [
            {
                title: "User Management",
                icon: Users,
                url: "/admin/management/user-management",
            },
            {
                title: "Storage Management",
                icon: HardDrive,
                url: "/admin/management/storage-management",
            },
            {
                title: "Group Management",
                icon: Group,
                url: "/admin/management/group-management",
            },
        ],
    },
]

export const menuForAdmin: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        url: "#",
        icon: List,
        items: [
            {
                title: "Task Board",
                icon: ListTodo,
                url: "/admin/activities/task-board",
            },
            {
                title: "Recap Invoices",
                icon: Clipboard,
                url: "/admin/activities/recap-invoices",
            },
        ],
    },
    {
        title: "Goods Export",
        url: "/admin/peb",
        icon: Ship,
    },
    {
        title: "Documents",
        url: "#",
        icon: Folder,
        items: [
            {
                title: "My Documents",
                url: "/admin/documents/my-documents",
            },
            {
                title: "Document Sharing",
                url: "/admin/documents/sharing",
            },
        ],
    },
    {
        title: "User Management",
        icon: Users,
        url: "/admin/management/user-management",
    },
]

export const menuForUser: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Activities",
        url: "#",
        icon: List,
        items: [
            {
                title: "Task Board",
                icon: ListTodo,
                url: "/admin/activities/task-board",
            },
            {
                title: "Recap Invoices",
                icon: Clipboard,
                url: "/admin/activities/recap-invoices",
            },
        ],
    },
    {
        title: "Goods Export",
        url: "/admin/peb",
        icon: Ship,
    },
    {
        title: "Documents",
        url: "#",
        icon: Folder,
        items: [
            {
                title: "My Documents",
                url: "/admin/documents/my-documents",
            },
            {
                title: "Document Sharing",
                url: "/admin/documents/sharing",
            },
        ],
    },
]