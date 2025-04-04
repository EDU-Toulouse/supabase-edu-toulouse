import { createClient } from "./server";
import { Database } from "./types";

export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

export async function getTeams() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      throw new Error(`Error fetching teams: ${error.message} (${error.code})`);
    }

    return data as Team[];
  } catch (error) {
    console.error("Error in getTeams:", error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getTeam(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching team:", error);
    throw new Error("Team not found");
  }

  return data as Team;
}

export async function getTeamMembers(teamId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      *,
      profiles:user_id(
        id,
        username,
        avatar_url,
        discord_username
      )
    `
    )
    .eq("team_id", teamId)
    .order("role", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  return data;
}

export async function getUserTeams(userId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        *,
        teams:team_id(*)
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user teams:", error);
      throw new Error(
        `Error fetching user teams: ${error.message} (${error.code})`
      );
    }

    return data.map((item) => item.teams) as Team[];
  } catch (error) {
    console.error("Error in getUserTeams:", error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function createTeam(
  name: string,
  description: string | null,
  ownerId: string
) {
  const supabase = createClient();

  try {
    // Check if profile exists, create one if not
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", ownerId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create one
      const { error: createProfileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: ownerId,
            username: `User-${ownerId.substring(0, 6)}`,
            created_at: new Date().toISOString(),
          },
        ]);

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError);
        throw new Error("Failed to create user profile before team creation");
      }
    }

    // Create the team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert([
        {
          name,
          description,
          owner_id: ownerId,
        },
      ])
      .select()
      .single();

    if (teamError) {
      console.error("Error creating team:", teamError);
      throw new Error(`Failed to create team: ${teamError.message}`);
    }

    // Add the owner as a team member with 'owner' role
    const { error: memberError } = await supabase.from("team_members").insert([
      {
        team_id: teamData.id,
        user_id: ownerId,
        role: "owner",
      },
    ]);

    if (memberError) {
      console.error("Error adding team member:", memberError);
      // Clean up the team if member creation fails
      await supabase.from("teams").delete().eq("id", teamData.id);

      throw new Error(`Failed to add owner to team: ${memberError.message}`);
    }

    return teamData as Team;
  } catch (error) {
    console.error("Team creation failed:", error);
    throw error;
  }
}

export async function createTeamInvitation(teamId: string, inviterId: string) {
  const supabase = createClient();

  // Generate a random code
  const invitationCode = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  // Set expiration date to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("team_invitations")
    .insert([
      {
        team_id: teamId,
        inviter_id: inviterId,
        invitation_code: invitationCode,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    throw new Error("Failed to create invitation");
  }

  return data;
}
