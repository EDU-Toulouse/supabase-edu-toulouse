"use client";

import { User } from "@supabase/supabase-js";
import { Team } from "@/lib/supabase/teams";
import { Event } from "@/lib/supabase/events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarIcon,
  UsersIcon,
  Award,
  CalendarDays,
  User as UserIcon,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  staggerContainer,
  cardVariants,
  listItemVariants,
} from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";

interface ProfileData {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  discord_username?: string | null;
  is_admin?: boolean | null;
}

interface TeamData {
  id: string;
  created_at: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  owner_id: string;
}

interface EventData {
  id: string;
  created_at: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  max_participants?: number | null;
  status?: string | null;
  game_title?: string | null;
  platform?: string | null;
  prize_pool?: string | null;
  organizer_id: string;
}

interface UserProfileProps {
  user: User;
  profile: ProfileData | null;
  teams: TeamData[];
  events: EventData[];
}

export function UserProfile({
  user,
  profile,
  teams,
  events,
}: UserProfileProps) {
  const prefersReducedMotion = useReducedMotion();
  const username =
    profile?.username ||
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    "User";
  const discordUsername =
    user.user_metadata?.full_name || profile?.discord_username || null;

  const animationProps = (variants: any, delay = 0) =>
    !prefersReducedMotion
      ? {
          variants,
          initial: "hidden",
          animate: "visible",
          transition: { delay },
        }
      : {};

  const staggerProps = (delay = 0.1) =>
    !prefersReducedMotion
      ? {
          variants: staggerContainer,
          initial: "hidden",
          animate: "visible",
          transition: { delayChildren: delay },
        }
      : {};

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-8"
      {...staggerProps(0.1)}
    >
      <motion.div className="md:col-span-1" {...animationProps(fadeIn)}>
        <Card className="overflow-hidden shadow-sm sticky top-20">
          <CardHeader className="flex flex-col items-center space-y-4 pb-4 bg-muted/30">
            <motion.div
              className="w-20 h-20"
              whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
            >
              <UserAvatar user={user} />
            </motion.div>
            <motion.div
              className="space-y-1 text-center"
              {...animationProps(fadeIn, 0.2)}
            >
              <CardTitle className="text-xl">{username}</CardTitle>
              {discordUsername && (
                <CardDescription>Discord: {discordUsername}</CardDescription>
              )}
            </motion.div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 sm:p-6">
            <motion.div className="space-y-3 text-sm" {...staggerProps(0.05)}>
              <motion.div
                className="flex justify-between items-center"
                variants={listItemVariants}
              >
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Member since
                </span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </motion.div>
              <motion.div
                className="flex justify-between items-center"
                variants={listItemVariants}
              >
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Teams
                </span>
                <Badge variant="secondary">{teams.length}</Badge>
              </motion.div>
              <motion.div
                className="flex justify-between items-center"
                variants={listItemVariants}
              >
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Events
                </span>
                <Badge variant="secondary">{events.length}</Badge>
              </motion.div>
            </motion.div>
          </CardContent>
          <Separator />
          <CardFooter className="p-4 sm:p-6 pt-4">
            <LogoutButton />
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div className="md:col-span-3" {...animationProps(fadeIn, 0.1)}>
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="teams" className="flex-1">
              <UsersIcon className="h-4 w-4 mr-2" />
              Your Teams
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Your Events
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="teams" className="pt-6">
              <motion.div
                key="teams-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {teams.length === 0 ? (
                  <EmptyState
                    icon={
                      <UsersIcon className="h-12 w-12 text-muted-foreground" />
                    }
                    title="No Teams Joined"
                    description="You haven't joined or created any teams yet."
                    actionLink="/teams"
                    actionText="Browse Teams"
                  />
                ) : (
                  <motion.div
                    className="grid gap-4 grid-cols-1 lg:grid-cols-2"
                    {...staggerProps(0.1)}
                  >
                    {teams.map((team) => (
                      <motion.div
                        key={team.id}
                        variants={cardVariants}
                        layout
                        layoutId={`profile-team-${team.id}`}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              {team.name}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {team.description || "No description available."}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-end pt-0">
                            <motion.div
                              whileHover={
                                !prefersReducedMotion
                                  ? { scale: 1.05 }
                                  : undefined
                              }
                              whileTap={
                                !prefersReducedMotion
                                  ? { scale: 0.95 }
                                  : undefined
                              }
                            >
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/teams/${team.id}`}>
                                  View Team
                                </Link>
                              </Button>
                            </motion.div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="events" className="pt-6">
              <motion.div
                key="events-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {events.length === 0 ? (
                  <EmptyState
                    icon={
                      <CalendarDays className="h-12 w-12 text-muted-foreground" />
                    }
                    title="No Events Registered"
                    description="You haven't registered for any upcoming events yet."
                    actionLink="/events"
                    actionText="Browse Events"
                  />
                ) : (
                  <motion.div
                    className="grid gap-4 grid-cols-1 lg:grid-cols-2"
                    {...staggerProps(0.1)}
                  >
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        variants={cardVariants}
                        layout
                        layoutId={`profile-event-${event.id}`}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-primary" />
                              {event.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs">
                              <CalendarIcon className="h-3 w-3" />
                              <span>
                                {format(new Date(event.start_date), "PPpp")}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-end pt-0">
                            <motion.div
                              whileHover={
                                !prefersReducedMotion
                                  ? { scale: 1.05 }
                                  : undefined
                              }
                              whileTap={
                                !prefersReducedMotion
                                  ? { scale: 0.95 }
                                  : undefined
                              }
                            >
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/events/${event.id}`}>
                                  View Event
                                </Link>
                              </Button>
                            </motion.div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLink,
  actionText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLink: string;
  actionText: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, scale: 0.9 } : undefined}
      animate={!prefersReducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-muted-foreground">{icon}</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 text-sm max-w-xs">
            {description}
          </p>
          <motion.div
            whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
            whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
          >
            <Button asChild>
              <Link href={actionLink}>{actionText}</Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
