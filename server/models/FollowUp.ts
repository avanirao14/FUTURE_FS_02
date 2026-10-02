import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUpDocument extends Document {
  leadId: mongoose.Types.ObjectId | string;
  leadName: string;
  leadCompany: string;
  title: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  completedAt?: Date | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUpDocument>(
  {
    leadId: { type: Schema.Types.Mixed, required: true, ref: 'Lead' },
    leadName: { type: String, required: true },
    leadCompany: { type: String, required: true },
    title: { type: String, required: [true, 'Follow-up title is required'], trim: true },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const FollowUpModel = mongoose.models.FollowUp || mongoose.model<IFollowUpDocument>('FollowUp', FollowUpSchema);
