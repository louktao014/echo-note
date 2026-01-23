import { SupabaseService } from './supabse/supabase.service';
import { ITranscript } from './model/transcript.mode';
export declare class TranscriptService {
    private supabase;
    constructor(supabase: SupabaseService);
    thaiDateToISO(thaiDate: string): string;
    saveTranscript(content: ITranscript): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    getTranscripts(): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<any[]>>;
    deleteTranscript(id: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
}
