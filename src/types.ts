export interface EducationEntry {
  id: string;
  schoolName: string;
  major: string;
  admissionYear: string;
  admissionMonth: string;
  graduationYear: string;
  graduationMonth: string;
}

export interface WorkEntry {
  id: string;
  companyName: string;
  position: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  description: string;
  achievement: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  year: string;
  month: string;
}

export interface ResumeData {
  id: string;
  fullName: string;
  furigana: string;
  gender: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  educationList: EducationEntry[];
  workList: WorkEntry[];
  technicalSkills: string;
  languageSkills: string;
  certificationsList: CertificationEntry[];
  motivation: string;
  selfPR: string;
  photoUrl: string;
  photoSize: '30x40' | '35x45';
  photoScale?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
  photoBrightness?: number;
  photoContrast?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SQLRecord {
  id: string;
  user_id: string;
  full_name: string;
  furigana: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  education: string;
  work_experience: string;
  skills: string;
  certifications: string;
  motivation: string;
  self_pr: string;
  photo_url: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  timestamp: string;
  type: 'edit' | 'ai' | 'export' | 'photo';
}
