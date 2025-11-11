import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Project } from "../types";

export function useProjects(userId?: string, userRole?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let q;
    if (userRole === "owner" || userRole === "manager") {
      // Owners and managers see all projects
      q = query(collection(db, "projects"));
    } else {
      // Staff only see projects they're assigned to
      q = query(
        collection(db, "projects"),
        where("assignedStaff", "array-contains", userId)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, userRole]);

  const addProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, "projects", projectId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
  };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "projects", projectId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProject({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Project);
      } else {
        setProject(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  return { project, loading };
}
