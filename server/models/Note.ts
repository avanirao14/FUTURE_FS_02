import mongoose, { Schema, Document } from 'mongoose';

export interface INoteDocument extends Document {
  leadId: mongoose.Types.ObjectId | string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    leadId: { type: Schema.Types.Mixed, required: true, ref: 'Lead' },
    author: { type: String, required: true, default: 'Admin' },
    content: { type: String, required: [true, 'Note content cannot be empty'], trim: true },
  },
  { timestamps: true }
);

export const NoteModel = mongoose.models.Note || mongoose.model<INoteDocument>('Note', NoteSchema);
