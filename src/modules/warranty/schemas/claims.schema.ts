import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClaimStatus } from 'src/enums/claim-status.enum';

export type ClaimDocument = Claim & Document;

@Schema()
export class Claim {

  @Prop({required: true})
  claim_id: string;

  @Prop({required: true})
  warranty_id: string;

  @Prop({required: true})
  complaint_id: string;

  @Prop({required: true})
  claim_valid: boolean;

  @Prop({
    type: String,
    enum: Object.values(ClaimStatus),
    default: ClaimStatus.Pending,
  })
  claim_status: ClaimStatus;

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  created_by: string;

  @Prop()
  updated_at: string;

  @Prop()
  updated_by: string;

  @Prop({ default: 1 })
  status?: number;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
ClaimSchema.index({ claim_id: 1 }, { unique: true });