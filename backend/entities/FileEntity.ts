import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "./Project";

@Entity({ name: "files" })
@Index("idx_files_project_type_created", ["projectId", "fileType", "createdAt"])
@Index("idx_files_project_id", ["projectId", "id"])
export class FileEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "project_id" })
  projectId!: string;

  @ManyToOne(() => Project, (p) => p.files, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ type: "text", name: "original_name" })
  originalName!: string;

  @Column({ type: "text", name: "file_type" })
  fileType!: string;

  @Column({ type: "text", name: "mime_type" })
  mimeType!: string;

  @Column({ type: "int", name: "size_bytes" })
  sizeBytes!: number;

  @Column({ type: "text", name: "storage_key", unique: true })
  storageKey!: string;

  @Column({ type: "text", default: "pending" })
  status!: "pending" | "uploaded" | "failed";

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @Column({ type: "timestamptz", name: "uploaded_at", nullable: true })
  uploadedAt!: Date | null;
}
