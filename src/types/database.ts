export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          title: string;
          destination: string | null;
          start_date: string;
          end_date: string;
          last_updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          destination?: string | null;
          start_date: string;
          end_date: string;
          last_updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          destination?: string | null;
          start_date?: string;
          end_date?: string;
          last_updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_members: {
        Row: {
          trip_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          trip_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          trip_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trip_days: {
        Row: {
          id: string;
          trip_id: string;
          date: string;
          title: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          date: string;
          title?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          date?: string;
          title?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_items: {
        Row: {
          id: string;
          trip_id: string;
          place_id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          image_url: string | null;
          note: string;
          list_type: string;
          trip_day_id: string | null;
          order_index: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          place_id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          image_url?: string | null;
          note?: string;
          list_type?: string;
          trip_day_id?: string | null;
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          place_id?: string;
          name?: string;
          address?: string;
          lat?: number;
          lng?: number;
          image_url?: string | null;
          note?: string;
          list_type?: string;
          trip_day_id?: string | null;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_trip_with_owner: {
        Args: {
          p_title: string;
          p_start_date: string;
          p_end_date: string;
          p_destination?: string | null;
        };
        Returns: Database["public"]["Tables"]["trips"]["Row"];
      };
      get_my_trips_with_member_count: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          title: string;
          destination: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
          role: string;
          member_count: number;
        }[];
      };
      touch_trip_updated_at: {
        Args: {
          p_trip_id: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
