"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, CalendarDays, Award, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    if (pathname === "/admin") return "dashboard";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/events")) return "events";
    if (pathname.startsWith("/admin/teams")) return "teams";
    if (pathname.startsWith("/admin/settings")) return "settings";
    return "dashboard";
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, events, and platform settings
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Site
          </Link>
        </Button>
      </div>

      <Separator className="my-2" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto p-0 bg-transparent justify-start overflow-auto">
          <TabsTrigger
            value="dashboard"
            asChild
            className="data-[state=active]:bg-secondary px-4 py-2 rounded-md"
          >
            <Link href="/admin" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            asChild
            className="data-[state=active]:bg-secondary px-4 py-2 rounded-md"
          >
            <Link href="/admin/users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="events"
            asChild
            className="data-[state=active]:bg-secondary px-4 py-2 rounded-md"
          >
            <Link href="/admin/events" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Events
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            asChild
            className="data-[state=active]:bg-secondary px-4 py-2 rounded-md"
          >
            <Link href="/admin/teams" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Teams
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            asChild
            className="data-[state=active]:bg-secondary px-4 py-2 rounded-md"
          >
            <Link href="/admin/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
