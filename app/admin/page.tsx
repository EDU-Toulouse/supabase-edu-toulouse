"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/supabase/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createBrowserClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { User } from "@supabase/supabase-js";
import {
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Add state for stats if needed later
  // const [stats, setStats] = useState({ eventCount: 0, teamCount: 0, userCount: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUser = await getUser();
        if (!currentUser) {
          redirect("/login");
          return;
        }
        setUser(currentUser);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUser.id)
          .single();

        if (profileError)
          throw new Error(`Profile fetch failed: ${profileError.message}`);

        if (!profile?.is_admin) {
          setError("Access denied. You must be an administrator.");
          setIsAdmin(false);
          // Optional: redirect after a delay or show message permanently
          // setTimeout(() => redirect("/"), 3000);
        } else {
          setIsAdmin(true);
          // Fetch stats here if needed
          // const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
          // setStats({ ... });
        }
      } catch (err: any) {
        console.error("[ Client ] Error checking admin status:", err);
        setError(err.message || "Failed to verify admin status.");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // supabase client dependency is stable

  const animationProps = (variants: any, delay = 0) =>
    !prefersReducedMotion
      ? {
          variants,
          initial: "hidden",
          animate: "visible",
          transition: { delay },
        }
      : {};

  return (
    <PageTransitionWrapper>
      <div className="py-8">
        <motion.div {...animationProps(fadeIn)}>
          <AdminHeader />
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <motion.div {...animationProps(fadeIn, 0.1)} className="mt-8">
            <Alert variant={isAdmin ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isAdmin ? "Status" : "Access Denied"}</AlertTitle>
              <AlertDescription>
                {error}
                {!isAdmin && (
                  <div className="mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/">Go to Homepage</Link>
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!loading && !error && isAdmin && user && (
          <motion.div
            className="mt-8 space-y-6"
            {...animationProps(staggerContainer, 0.1)}
          >
            <motion.div {...animationProps(fadeIn, 0.1)}>
              <h2 className="text-xl font-semibold tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground">
                Welcome, {user.email}. Manage your platform resources here.
              </p>
            </motion.div>
            <motion.div {...animationProps(fadeIn, 0.2)}>
              <Separator className="my-4" />
            </motion.div>

            {/* Quick Actions / Stats Cards */}
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              {...animationProps(staggerContainer, 0.2)} // Stagger cards
            >
              <motion.div {...animationProps(fadeIn, 0.3)}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Manage Events
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {/* Add event count here if fetched */}
                    {/* <div className="text-2xl font-bold">+5</div> */}
                    <CardDescription className="text-xs text-muted-foreground mb-4">
                      View, create, and manage events.
                    </CardDescription>
                    <Button asChild size="sm">
                      <Link href="/admin/events">Go to Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...animationProps(fadeIn, 0.4)}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Manage Teams
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {/* Add team count here if fetched */}
                    <CardDescription className="text-xs text-muted-foreground mb-4">
                      View and manage teams.
                    </CardDescription>
                    <Button asChild size="sm">
                      <Link href="/admin/teams">Go to Teams</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...animationProps(fadeIn, 0.5)}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Site Settings
                    </CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs text-muted-foreground mb-4">
                      Configure platform settings (Placeholder).
                    </CardDescription>
                    <Button size="sm" disabled>
                      Configure
                    </Button>{" "}
                    {/* Placeholder */}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransitionWrapper>
  );
}
