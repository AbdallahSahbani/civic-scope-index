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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      media_affiliations: {
        Row: {
          context_description: string | null
          created_at: string
          end_date: string | null
          financial_flow:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id: string
          organization_id: string
          person_id: string
          relationship_type: Database["public"]["Enums"]["affiliation_type"]
          routing_context:
            | Database["public"]["Enums"]["routing_context_type"]
            | null
          source_id: string | null
          start_date: string | null
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          context_description?: string | null
          created_at?: string
          end_date?: string | null
          financial_flow?:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id?: string
          organization_id: string
          person_id: string
          relationship_type: Database["public"]["Enums"]["affiliation_type"]
          routing_context?:
            | Database["public"]["Enums"]["routing_context_type"]
            | null
          source_id?: string | null
          start_date?: string | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          context_description?: string | null
          created_at?: string
          end_date?: string | null
          financial_flow?:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id?: string
          organization_id?: string
          person_id?: string
          relationship_type?: Database["public"]["Enums"]["affiliation_type"]
          routing_context?:
            | Database["public"]["Enums"]["routing_context_type"]
            | null
          source_id?: string | null
          start_date?: string | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "media_affiliations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_affiliations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_affiliations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_donation_routing: {
        Row: {
          control_relationship: string | null
          created_at: string
          destination_entity_id: string | null
          destination_name: string
          entity_id: string
          id: string
          routing_type: string
          snapshot_date: string | null
          source_id: string | null
          source_url: string | null
        }
        Insert: {
          control_relationship?: string | null
          created_at?: string
          destination_entity_id?: string | null
          destination_name: string
          entity_id: string
          id?: string
          routing_type: string
          snapshot_date?: string | null
          source_id?: string | null
          source_url?: string | null
        }
        Update: {
          control_relationship?: string | null
          created_at?: string
          destination_entity_id?: string | null
          destination_name?: string
          entity_id?: string
          id?: string
          routing_type?: string
          snapshot_date?: string | null
          source_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_donation_routing_destination_entity_id_fkey"
            columns: ["destination_entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_donation_routing_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_donation_routing_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_entities: {
        Row: {
          active_status: boolean
          audience_size_band:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          business_entity:
            | Database["public"]["Enums"]["business_entity_type"]
            | null
          country: string
          created_at: string
          declared_role: Database["public"]["Enums"]["declared_role"] | null
          declared_scope: Database["public"]["Enums"]["declared_scope"] | null
          description: string | null
          distribution_channels: string[] | null
          entity_type: Database["public"]["Enums"]["media_entity_type"]
          fcc_license_id: string | null
          first_seen_at: string | null
          headquarters_city: string | null
          headquarters_state: string | null
          id: string
          last_verified_at: string | null
          legal_name: string | null
          logo_url: string | null
          monetization_methods: string[] | null
          name: string
          ownership_type: Database["public"]["Enums"]["ownership_type"] | null
          parent_company: string | null
          primary_alias: string | null
          primary_platform: Database["public"]["Enums"]["media_platform"] | null
          primary_platforms:
            | Database["public"]["Enums"]["media_platform"][]
            | null
          revenue_band: Database["public"]["Enums"]["revenue_band"] | null
          sec_cik: string | null
          updated_at: string
        }
        Insert: {
          active_status?: boolean
          audience_size_band?:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          business_entity?:
            | Database["public"]["Enums"]["business_entity_type"]
            | null
          country?: string
          created_at?: string
          declared_role?: Database["public"]["Enums"]["declared_role"] | null
          declared_scope?: Database["public"]["Enums"]["declared_scope"] | null
          description?: string | null
          distribution_channels?: string[] | null
          entity_type: Database["public"]["Enums"]["media_entity_type"]
          fcc_license_id?: string | null
          first_seen_at?: string | null
          headquarters_city?: string | null
          headquarters_state?: string | null
          id?: string
          last_verified_at?: string | null
          legal_name?: string | null
          logo_url?: string | null
          monetization_methods?: string[] | null
          name: string
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          parent_company?: string | null
          primary_alias?: string | null
          primary_platform?:
            | Database["public"]["Enums"]["media_platform"]
            | null
          primary_platforms?:
            | Database["public"]["Enums"]["media_platform"][]
            | null
          revenue_band?: Database["public"]["Enums"]["revenue_band"] | null
          sec_cik?: string | null
          updated_at?: string
        }
        Update: {
          active_status?: boolean
          audience_size_band?:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          business_entity?:
            | Database["public"]["Enums"]["business_entity_type"]
            | null
          country?: string
          created_at?: string
          declared_role?: Database["public"]["Enums"]["declared_role"] | null
          declared_scope?: Database["public"]["Enums"]["declared_scope"] | null
          description?: string | null
          distribution_channels?: string[] | null
          entity_type?: Database["public"]["Enums"]["media_entity_type"]
          fcc_license_id?: string | null
          first_seen_at?: string | null
          headquarters_city?: string | null
          headquarters_state?: string | null
          id?: string
          last_verified_at?: string | null
          legal_name?: string | null
          logo_url?: string | null
          monetization_methods?: string[] | null
          name?: string
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          parent_company?: string | null
          primary_alias?: string | null
          primary_platform?:
            | Database["public"]["Enums"]["media_platform"]
            | null
          primary_platforms?:
            | Database["public"]["Enums"]["media_platform"][]
            | null
          revenue_band?: Database["public"]["Enums"]["revenue_band"] | null
          sec_cik?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_entity_sources: {
        Row: {
          created_at: string
          entity_id: string
          field_name: string
          id: string
          source_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          field_name: string
          id?: string
          source_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          field_name?: string
          id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_entity_sources_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_entity_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_legal_records: {
        Row: {
          case_exists: boolean
          court_name: string | null
          created_at: string
          entity_id: string
          id: string
          jurisdiction: string | null
          record_date: string | null
          record_type: string
          record_url: string | null
          source_id: string | null
        }
        Insert: {
          case_exists?: boolean
          court_name?: string | null
          created_at?: string
          entity_id: string
          id?: string
          jurisdiction?: string | null
          record_date?: string | null
          record_type: string
          record_url?: string | null
          source_id?: string | null
        }
        Update: {
          case_exists?: boolean
          court_name?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          jurisdiction?: string | null
          record_date?: string | null
          record_type?: string
          record_url?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_legal_records_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_legal_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_platform_verifications: {
        Row: {
          created_at: string
          entity_id: string
          follower_count_band:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          id: string
          platform: Database["public"]["Enums"]["media_platform"]
          platform_handle: string | null
          platform_url: string | null
          source_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          follower_count_band?:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          id?: string
          platform: Database["public"]["Enums"]["media_platform"]
          platform_handle?: string | null
          platform_url?: string | null
          source_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          follower_count_band?:
            | Database["public"]["Enums"]["audience_size_band"]
            | null
          id?: string
          platform?: Database["public"]["Enums"]["media_platform"]
          platform_handle?: string | null
          platform_url?: string | null
          source_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_platform_verifications_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_platform_verifications_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_public_filings: {
        Row: {
          created_at: string
          description: string | null
          entity_id: string
          filing_date: string | null
          filing_id: string | null
          filing_type: string
          filing_url: string | null
          id: string
          source_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_id: string
          filing_date?: string | null
          filing_id?: string | null
          filing_type: string
          filing_url?: string | null
          id?: string
          source_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_id?: string
          filing_date?: string | null
          filing_id?: string | null
          filing_type?: string
          filing_url?: string | null
          id?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_public_filings_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_public_filings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sources: {
        Row: {
          checksum: string | null
          created_at: string
          id: string
          raw_data: Json | null
          retrieved_at: string
          source_title: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          id?: string
          raw_data?: Json | null
          retrieved_at?: string
          source_title?: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          id?: string
          raw_data?: Json | null
          retrieved_at?: string
          source_title?: string | null
          source_type?: Database["public"]["Enums"]["source_type"]
          source_url?: string
        }
        Relationships: []
      }
      media_sponsorships: {
        Row: {
          context: string | null
          created_at: string
          disclosure_status: string | null
          end_date: string | null
          entity_id: string
          financial_flow:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id: string
          notes: string | null
          relationship_type: string
          source_id: string | null
          source_url: string | null
          sponsor_entity_id: string | null
          sponsor_name: string
          start_date: string | null
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          disclosure_status?: string | null
          end_date?: string | null
          entity_id: string
          financial_flow?:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id?: string
          notes?: string | null
          relationship_type: string
          source_id?: string | null
          source_url?: string | null
          sponsor_entity_id?: string | null
          sponsor_name: string
          start_date?: string | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          context?: string | null
          created_at?: string
          disclosure_status?: string | null
          end_date?: string | null
          entity_id?: string
          financial_flow?:
            | Database["public"]["Enums"]["financial_flow_type"]
            | null
          id?: string
          notes?: string | null
          relationship_type?: string
          source_id?: string | null
          source_url?: string | null
          sponsor_entity_id?: string | null
          sponsor_name?: string
          start_date?: string | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "media_sponsorships_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_sponsorships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_sponsorships_sponsor_entity_id_fkey"
            columns: ["sponsor_entity_id"]
            isOneToOne: false
            referencedRelation: "media_entities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      affiliation_type: "employee" | "contractor" | "contributor" | "former"
      audience_size_band:
        | "UNDER_100K"
        | "BETWEEN_100K_1M"
        | "BETWEEN_1M_10M"
        | "OVER_10M"
      business_entity_type: "LLC" | "INC" | "NONE" | "UNKNOWN"
      declared_role: "journalist" | "commentator" | "podcaster" | "activist"
      declared_scope: "news" | "opinion" | "mixed"
      financial_flow_type: "none" | "indirect" | "direct" | "unknown"
      media_entity_type: "CORPORATE_MEDIA" | "INDEPENDENT_FIGURE" | "HYBRID"
      media_platform: "TV" | "DIGITAL" | "PODCAST" | "RADIO" | "SOCIAL"
      ownership_type: "PUBLIC" | "PRIVATE" | "SUBSIDIARY"
      revenue_band: "UNDER_100M" | "BETWEEN_100M_1B" | "OVER_1B"
      routing_context_type:
        | "donations"
        | "security"
        | "content"
        | "employment"
        | "legal"
        | "advertising"
        | "academic"
      source_type:
        | "SEC"
        | "FCC"
        | "FEC"
        | "IRS"
        | "PLATFORM"
        | "COURT"
        | "STATE_REGISTRY"
        | "MANUAL"
      verification_status: "verified" | "unverified" | "disputed"
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
    Enums: {
      affiliation_type: ["employee", "contractor", "contributor", "former"],
      audience_size_band: [
        "UNDER_100K",
        "BETWEEN_100K_1M",
        "BETWEEN_1M_10M",
        "OVER_10M",
      ],
      business_entity_type: ["LLC", "INC", "NONE", "UNKNOWN"],
      declared_role: ["journalist", "commentator", "podcaster", "activist"],
      declared_scope: ["news", "opinion", "mixed"],
      financial_flow_type: ["none", "indirect", "direct", "unknown"],
      media_entity_type: ["CORPORATE_MEDIA", "INDEPENDENT_FIGURE", "HYBRID"],
      media_platform: ["TV", "DIGITAL", "PODCAST", "RADIO", "SOCIAL"],
      ownership_type: ["PUBLIC", "PRIVATE", "SUBSIDIARY"],
      revenue_band: ["UNDER_100M", "BETWEEN_100M_1B", "OVER_1B"],
      routing_context_type: [
        "donations",
        "security",
        "content",
        "employment",
        "legal",
        "advertising",
        "academic",
      ],
      source_type: [
        "SEC",
        "FCC",
        "FEC",
        "IRS",
        "PLATFORM",
        "COURT",
        "STATE_REGISTRY",
        "MANUAL",
      ],
      verification_status: ["verified", "unverified", "disputed"],
    },
  },
} as const
