import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getFreshAccessToken(userId: string): Promise<string | null> {
    try {
      const supabase = createClient(cookies());
      const { data: userData, error } = await supabase
        .from('user_auth')
        .select("refresh_token")
        .eq('user_id', userId)
        .single();
  
      if (error || !userData?.refresh_token) {
        console.error("Error getting refresh token: ", error);
        return null;
      }
  
      const response = await fetch('https://anilist.co/api/v2/oauth/token', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: userData.refresh_token,
          client_id: process.env.ANILIST_CLIENT_ID,
          client_secret: process.env.ANILIST_CLIENT_SECRET,
        }),
      });
  
      if (!response.ok) {
        console.error('Token refresh failed with status:', response.status);
        return null;
      }
  
      const tokens = await response.json();
      console.log('Token refresh response received');
  
      if (!tokens.access_token) {
        throw new Error('Failed to refresh access token');
      }
  
      // Calculate the actual expiry time from the expires_in value
      // Converting from seconds to milliseconds and getting a Date
      const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;
  
      // Update database with new tokens and expiry
      const { error: updateError } = await supabase
        .from('user_auth')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || userData.refresh_token, // Use existing if not provided
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
  
      if (updateError) {
        console.error('Error updating tokens in database:', updateError);
      } else {
        console.log('Successfully updated tokens in database with expiry:', new Date(expiresAt * 1000).toISOString());
      }
  
      return tokens.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }
