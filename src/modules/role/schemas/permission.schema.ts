import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ModuleType } from '../../../enums/module-type.enum';
import { PermissionType } from '../../../enums/permission.enum';

type ModulePermissionsDocument = ModulePermissions & Document;
@Schema()
class ModulePermissions {
  @Prop({
    type: String,
    enum: Object.values(ModuleType),
    required: true
  })
  module: ModuleType;

  @Prop({
    type: Array,
    enum: Object.values(PermissionType),
  })
  permissions: PermissionType[];  

}

const ModulePermissionsSchema = SchemaFactory.createForClass(ModulePermissions);

export type PermissionDocument = Permission & Document;

@Schema()
export class Permission {
  @Prop()
  permission_id: string;

  @Prop({required: true})
  role_id: string;

  @Prop({
    type: [ModulePermissionsSchema],
  })
  module_permissions: ModulePermissionsDocument[];

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

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({ permission_id: 1 }, { unique: true });