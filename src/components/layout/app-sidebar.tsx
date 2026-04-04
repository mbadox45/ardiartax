"use client"

import * as React from "react"

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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
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
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
