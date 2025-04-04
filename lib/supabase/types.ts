export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          image_url: string | null;
          start_date: string;
          end_date: string;
          location: string | null;
          max_participants: number | null;
          team_size: number | null;
          is_team_event: boolean;
          registration_deadline: string | null;
          status: "upcoming" | "ongoing" | "completed" | "cancelled";
          organizer_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          image_url?: string | null;
          start_date: string;
          end_date: string;
          location?: string | null;
          max_participants?: number | null;
          team_size?: number | null;
          is_team_event: boolean;
          registration_deadline?: string | null;
          status?: "upcoming" | "ongoing" | "completed" | "cancelled";
          organizer_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          start_date?: string;
          end_date?: string;
          location?: string | null;
          max_participants?: number | null;
          team_size?: number | null;
          is_team_event?: boolean;
          registration_deadline?: string | null;
          status?: "upcoming" | "ongoing" | "completed" | "cancelled";
          organizer_id?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          owner_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          owner_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          owner_id?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          created_at: string;
          team_id: string;
          user_id: string;
          role: "owner" | "captain" | "member";
        };
        Insert: {
          id?: string;
          created_at?: string;
          team_id: string;
          user_id: string;
          role?: "owner" | "captain" | "member";
        };
        Update: {
          id?: string;
          created_at?: string;
          team_id?: string;
          user_id?: string;
          role?: "owner" | "captain" | "member";
        };
      };
      event_registrations: {
        Row: {
          id: string;
          created_at: string;
          event_id: string;
          user_id: string | null;
          team_id: string | null;
          status: "pending" | "confirmed" | "rejected" | "cancelled";
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_id: string;
          user_id?: string | null;
          team_id?: string | null;
          status?: "pending" | "confirmed" | "rejected" | "cancelled";
        };
        Update: {
          id?: string;
          created_at?: string;
          event_id?: string;
          user_id?: string | null;
          team_id?: string | null;
          status?: "pending" | "confirmed" | "rejected" | "cancelled";
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string | null;
          avatar_url: string | null;
          discord_username: string | null;
          discord_id: string | null;
          bio: string | null;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          username?: string | null;
          avatar_url?: string | null;
          discord_username?: string | null;
          discord_id?: string | null;
          bio?: string | null;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string | null;
          avatar_url?: string | null;
          discord_username?: string | null;
          discord_id?: string | null;
          bio?: string | null;
          is_admin?: boolean;
        };
      };
      team_invitations: {
        Row: {
          id: string;
          created_at: string;
          team_id: string;
          inviter_id: string;
          invitee_id: string | null;
          invitation_code: string;
          expires_at: string;
          status: "pending" | "accepted" | "rejected" | "expired";
        };
        Insert: {
          id?: string;
          created_at?: string;
          team_id: string;
          inviter_id: string;
          invitee_id?: string | null;
          invitation_code: string;
          expires_at: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
        };
        Update: {
          id?: string;
          created_at?: string;
          team_id?: string;
          inviter_id?: string;
          invitee_id?: string | null;
          invitation_code?: string;
          expires_at?: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
