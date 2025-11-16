export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string | null
          campaign_version: string | null
          cost_per_deal: number | null
          cost_per_lead: number | null
          created_at: string | null
          data_provider: string | null
          duplicate_rate: number | null
          duplicates_found: number | null
          file_name: string | null
          file_size_kb: number | null
          id: string
          lead_source: string | null
          market: string | null
          new_leads_count: number | null
          notes: string | null
          processing_time_seconds: number | null
          roi_score: number | null
          skip_trace_needed: number | null
          skip_trace_savings: number | null
          state: string | null
          status: string | null
          total_called: number | null
          total_contacted: number | null
          total_deals: number | null
          total_interested: number | null
          total_records: number | null
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          campaign_name: string
          campaign_type?: string | null
          campaign_version?: string | null
          cost_per_deal?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          data_provider?: string | null
          duplicate_rate?: number | null
          duplicates_found?: number | null
          file_name?: string | null
          file_size_kb?: number | null
          id?: string
          lead_source?: string | null
          market?: string | null
          new_leads_count?: number | null
          notes?: string | null
          processing_time_seconds?: number | null
          roi_score?: number | null
          skip_trace_needed?: number | null
          skip_trace_savings?: number | null
          state?: string | null
          status?: string | null
          total_called?: number | null
          total_contacted?: number | null
          total_deals?: number | null
          total_interested?: number | null
          total_records?: number | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          campaign_name?: string
          campaign_type?: string | null
          campaign_version?: string | null
          cost_per_deal?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          data_provider?: string | null
          duplicate_rate?: number | null
          duplicates_found?: number | null
          file_name?: string | null
          file_size_kb?: number | null
          id?: string
          lead_source?: string | null
          market?: string | null
          new_leads_count?: number | null
          notes?: string | null
          processing_time_seconds?: number | null
          roi_score?: number | null
          skip_trace_needed?: number | null
          skip_trace_savings?: number | null
          state?: string | null
          status?: string | null
          total_called?: number | null
          total_contacted?: number | null
          total_deals?: number | null
          total_interested?: number | null
          total_records?: number | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      column_mapping_templates: {
        Row: {
          column_mappings: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          is_active: boolean | null
          last_used_at: string | null
          parcel_id_type: string | null
          sample_headers: Json | null
          source_type: string | null
          state: string | null
          template_name: string
          usage_count: number | null
        }
        Insert: {
          column_mappings: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          last_used_at?: string | null
          parcel_id_type?: string | null
          sample_headers?: Json | null
          source_type?: string | null
          state?: string | null
          template_name: string
          usage_count?: number | null
        }
        Update: {
          column_mappings?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          last_used_at?: string | null
          parcel_id_type?: string | null
          sample_headers?: Json | null
          source_type?: string | null
          state?: string | null
          template_name?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      duplicate_log: {
        Row: {
          campaign_id: string | null
          detected_at: string | null
          duplicate_address: string | null
          duplicate_market: string | null
          duplicate_owner_name: string | null
          duplicate_parcel_id: string | null
          duplicate_state: string | null
          id: string
          lead_id: string | null
          match_confidence: number | null
          match_type: string | null
          matched_on: string | null
          original_campaign_name: string | null
          original_lead_id: string | null
          original_status: string | null
          original_upload_date: string | null
        }
        Insert: {
          campaign_id?: string | null
          detected_at?: string | null
          duplicate_address?: string | null
          duplicate_market?: string | null
          duplicate_owner_name?: string | null
          duplicate_parcel_id?: string | null
          duplicate_state?: string | null
          id?: string
          lead_id?: string | null
          match_confidence?: number | null
          match_type?: string | null
          matched_on?: string | null
          original_campaign_name?: string | null
          original_lead_id?: string | null
          original_status?: string | null
          original_upload_date?: string | null
        }
        Update: {
          campaign_id?: string | null
          detected_at?: string | null
          duplicate_address?: string | null
          duplicate_market?: string | null
          duplicate_owner_name?: string | null
          duplicate_parcel_id?: string | null
          duplicate_state?: string | null
          id?: string
          lead_id?: string | null
          match_confidence?: number | null
          match_type?: string | null
          matched_on?: string | null
          original_campaign_name?: string | null
          original_lead_id?: string | null
          original_status?: string | null
          original_upload_date?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          bathrooms: number | null
          bedrooms: number | null
          calltools_lead_id: string | null
          campaign_id: string
          city: string
          contact_attempts: number | null
          county: string | null
          created_at: string | null
          created_by: string | null
          data_provider: string | null
          data_source: string | null
          disposition: string | null
          email: string | null
          email_2: string | null
          email_3: string | null
          email_4: string | null
          estimated_value: number | null
          external_id_1: string | null
          external_id_2: string | null
          ghl_contact_id: string | null
          group_list: string | null
          id: string
          interested_in_selling: boolean | null
          is_deleted: boolean | null
          last_contact_date: string | null
          last_contact_method: string | null
          last_sale_date: string | null
          last_sale_price: number | null
          last_synced_at: string | null
          list_name: string | null
          lot_size: number | null
          market: string | null
          next_follow_up_date: string | null
          normalized_address: string
          notes: string | null
          original_address: string
          owner_city: string | null
          owner_first_name: string | null
          owner_full_name: string | null
          owner_last_name: string | null
          owner_mailing_address: string | null
          owner_secondary_address: string | null
          owner_state: string | null
          owner_zip_code: string | null
          parcel_id: string | null
          parcel_id_type: string | null
          phone_2: string | null
          phone_3: string | null
          phone_4: string | null
          phone_5: string | null
          phone_number: string | null
          podio_item_id: string | null
          property_type: string | null
          secondary_address: string | null
          skip_trace_date: string | null
          skip_trace_provider: string | null
          skip_trace_status: string | null
          square_footage: number | null
          state: string
          state_full: string | null
          status: string | null
          sync_status: string | null
          updated_at: string | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calltools_lead_id?: string | null
          campaign_id: string
          city: string
          contact_attempts?: number | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          data_provider?: string | null
          data_source?: string | null
          disposition?: string | null
          email?: string | null
          email_2?: string | null
          email_3?: string | null
          email_4?: string | null
          estimated_value?: number | null
          external_id_1?: string | null
          external_id_2?: string | null
          ghl_contact_id?: string | null
          group_list?: string | null
          id?: string
          interested_in_selling?: boolean | null
          is_deleted?: boolean | null
          last_contact_date?: string | null
          last_contact_method?: string | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          last_synced_at?: string | null
          list_name?: string | null
          lot_size?: number | null
          market?: string | null
          next_follow_up_date?: string | null
          normalized_address: string
          notes?: string | null
          original_address: string
          owner_city?: string | null
          owner_first_name?: string | null
          owner_full_name?: string | null
          owner_last_name?: string | null
          owner_mailing_address?: string | null
          owner_secondary_address?: string | null
          owner_state?: string | null
          owner_zip_code?: string | null
          parcel_id?: string | null
          parcel_id_type?: string | null
          phone_2?: string | null
          phone_3?: string | null
          phone_4?: string | null
          phone_5?: string | null
          phone_number?: string | null
          podio_item_id?: string | null
          property_type?: string | null
          secondary_address?: string | null
          skip_trace_date?: string | null
          skip_trace_provider?: string | null
          skip_trace_status?: string | null
          square_footage?: number | null
          state: string
          state_full?: string | null
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calltools_lead_id?: string | null
          campaign_id?: string
          city?: string
          contact_attempts?: number | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          data_provider?: string | null
          data_source?: string | null
          disposition?: string | null
          email?: string | null
          email_2?: string | null
          email_3?: string | null
          email_4?: string | null
          estimated_value?: number | null
          external_id_1?: string | null
          external_id_2?: string | null
          ghl_contact_id?: string | null
          group_list?: string | null
          id?: string
          interested_in_selling?: boolean | null
          is_deleted?: boolean | null
          last_contact_date?: string | null
          last_contact_method?: string | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          last_synced_at?: string | null
          list_name?: string | null
          lot_size?: number | null
          market?: string | null
          next_follow_up_date?: string | null
          normalized_address?: string
          notes?: string | null
          original_address?: string
          owner_city?: string | null
          owner_first_name?: string | null
          owner_full_name?: string | null
          owner_last_name?: string | null
          owner_mailing_address?: string | null
          owner_secondary_address?: string | null
          owner_state?: string | null
          owner_zip_code?: string | null
          parcel_id?: string | null
          parcel_id_type?: string | null
          phone_2?: string | null
          phone_3?: string | null
          phone_4?: string | null
          phone_5?: string | null
          phone_number?: string | null
          podio_item_id?: string | null
          property_type?: string | null
          secondary_address?: string | null
          skip_trace_date?: string | null
          skip_trace_provider?: string | null
          skip_trace_status?: string | null
          square_footage?: number | null
          state?: string
          state_full?: string | null
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          cities: string[] | null
          counties: string[] | null
          created_at: string | null
          id: number
          is_active: boolean | null
          market_code: string
          market_name: string
          parcel_id_format: string | null
          parcel_id_type: string
          state: string
          state_full: string
          updated_at: string | null
        }
        Insert: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          market_code: string
          market_name: string
          parcel_id_format?: string | null
          parcel_id_type: string
          state: string
          state_full: string
          updated_at?: string | null
        }
        Update: {
          cities?: string[] | null
          counties?: string[] | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          market_code?: string
          market_name?: string
          parcel_id_format?: string | null
          parcel_id_type?: string
          state?: string
          state_full?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
