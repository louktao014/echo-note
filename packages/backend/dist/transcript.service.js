"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("./supabse/supabase.service");
let TranscriptService = class TranscriptService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    thaiDateToISO(thaiDate) {
        const [datePart, timePart] = thaiDate.split(' ');
        const [d, m, y] = datePart.split('/').map(Number);
        const adYear = y - 543;
        return `${adYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${timePart}`;
    }
    async saveTranscript(content) {
        const raw = {
            user_id: +content.user_id,
            sub_ject: content.sub_ject,
            content: content.content,
            created_at: this.thaiDateToISO(content.created_at),
            updated_at: this.thaiDateToISO(content.updated_at),
        };
        return this.supabase.getClient().from('transcripts').insert(raw);
    }
    async getTranscripts() {
        return this.supabase.getClient().from('transcripts').select('*');
    }
    async deleteTranscript(id) {
        return this.supabase.getClient().from('transcripts').delete().eq('id', id);
    }
};
exports.TranscriptService = TranscriptService;
exports.TranscriptService = TranscriptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TranscriptService);
//# sourceMappingURL=transcript.service.js.map