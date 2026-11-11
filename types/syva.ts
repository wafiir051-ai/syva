// types/syva.ts
export type SubjectCategory = 'TKJ_IT' | 'BIOLOGI' | 'FISIKA' | 'MATEMATIKA' | 'SEJARAH' | 'UMUM';
export type AssetType = 'PC_GAMING' | 'ORGAN_HEART' | 'COLOSSEUM' | 'EARTH_GRAVITY' | 'GEOMETRY_MATH' | 'CUSTOM';

export interface SyvaAnnotation {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  position: [number, number, number];
}

export interface SyvaNode {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  assetType: AssetType;
  customGlbUrl?: string;
  color: string;
  position: [number, number, number];
  annotations?: SyvaAnnotation[];
}

export interface SyvaModule {
  id: string;
  title: string;
  category: SubjectCategory;
  description: string;
  nodes: SyvaNode[];
  quizzes?: any[];
}