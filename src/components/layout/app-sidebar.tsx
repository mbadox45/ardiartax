// src/components/layout/app-sidebar.tsx
"use client"

import * as React from "react"
// import Cookies from "js-cookie"

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
  Ship,
  Clipboard
} from "lucide-react";

import { NavDocuments } from "@/components/layout/nav-documents"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// const name = Cookies.get("name") || "Guest"
// const email = Cookies.get("username") || "guest@ardiartax.com"
// const cookieStore = await cookies()

const data = {
  user: {
    name: "Guest",
    email: "guest@ardiartax.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
      title: "Team",
      url: "/admin/teams",
      icon: Users,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: Camera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileWord,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileText,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: FileBarChart,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileDescription,
    },
  ],
}

// Tambahkan Interface untuk Type Safety
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props} variant="inset">
      <SidebarHeader className="bg-cyan-800 text-white rounded-t-md">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <PanelTop className="size-5!" />
                <span className="text-base font-semibold">ArdiarTax</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-cyan-800 text-white">
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter className="bg-cyan-800 text-white rounded-b-md">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
