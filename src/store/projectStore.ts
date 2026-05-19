import { create } from 'zustand';
import { ProjectsAPI } from '../api/projects';
import type { Project } from '../types';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (id: string, fields: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | undefined;
  getProject: (id: string) => Project | undefined;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await ProjectsAPI.fetchAll();
      set({ projects, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  addProject: (project) => {
    set((state) => ({ projects: [project, ...state.projects] }));
    ProjectsAPI.upsert(project).catch(console.error);
  },

  updateProject: (id, updatedFields) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
        ProjectsAPI.upsert(updated).catch(console.error);
        return updated;
      }),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    ProjectsAPI.remove(id).catch(console.error);
  },

  duplicateProject: (id) => {
    const original = get().projects.find((p) => p.id === id);
    if (!original) return undefined;

    const clone: Project = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copia)`,
      status: 'active',
      progress: 0,
      adelantoStatus: 'pending',
      saldoStatus: 'pending',
      updates: [
        {
          id: crypto.randomUUID(),
          message: `Proyecto duplicado desde "${original.name}".`,
          type: 'info',
          date: new Date().toISOString(),
          author: original.devName,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ projects: [clone, ...state.projects] }));
    ProjectsAPI.upsert(clone).catch(console.error);
    return clone;
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  clearProjects: () => set({ projects: [], isLoading: false, error: null }),
}));
