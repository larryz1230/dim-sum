import { supabaseAdmin } from "./SupabaseAdmin";

export type ProfileSummary = {
    id: string;
    username: string;
    rating: number;
    wins: number;
    losses: number;
}

export async function getProfilesByIds(userIds: string[]) : Promise<ProfileSummary[]> {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, username, rating, wins, losses")
        .in("id", userIds);

    if (error) {
        throw new Error(`Failed to fetch profiles: ${error.message}`);
    }

    return data ?? [];
}