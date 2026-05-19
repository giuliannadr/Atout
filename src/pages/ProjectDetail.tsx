import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckSquare, Layout, GitPullRequest } from 'lucide-react';
import DetailTopbar from '../components/layout/DetailTopbar';
import EditBanner from '../components/project/EditBanner';
import NoticePin from '../components/project/NoticePin';
import ProjectHero from '../components/project/ProjectHero';
import ProjectProgressBar from '../components/project/ProgressBar';
import ProjectTimeline from '../components/project/Timeline';
import ProjectDeliverables from '../components/project/Deliverables';
import ProjectRevisions from '../components/project/Revisions';
import ProjectDocuments from '../components/project/Documents';
import {
  ProjectInfoWidget,
  PaymentWidget,
  AccessesWidget,
  UpdateLogWidget,
  DevContactWidget
} from '../components/project/SidebarWidgets';
import TaskBoard from '../components/tasks/TaskBoard';
import ChangeRequests from '../components/project/ChangeRequests';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNotificationStore } from '../store/notificationStore';
import ConfirmModal from '../components/layout/ConfirmModal';
import type { Project, Task } from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Read project directly from store — any update (including status from topbar) auto-reflects
  const project = useProjectStore(state => state.projects.find(p => p.id === id) ?? null);
  const { updateProject, deleteProject } = useProjectStore();
  const { settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeView, setActiveView] = useState<'project' | 'tasks' | 'changes'>('project');

  // Redirect if project not found (after initial load)
  if (!project && id) {
    // Only redirect once the store has loaded (projects array might be empty during fetch)
    const storeLoaded = useProjectStore.getState().isLoading === false;
    if (storeLoaded) navigate('/');
    return null;
  }

  if (!project) return null;

  const handleUpdate = (fields: Partial<Project>) => {
    if (!id) return;
    updateProject(id, fields);
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteProject(id);
      addNotification('Proyecto eliminado con éxito.');
      navigate('/');
    }
  };

  // Task helpers
  const projectTasks = project.tasks ?? [];
  const addTask = (t: Task) => handleUpdate({ tasks: [...projectTasks, t] });
  const updateTask = (t: Task) => handleUpdate({ tasks: projectTasks.map(x => x.id === t.id ? t : x) });
  const deleteTask = (tid: string) => handleUpdate({ tasks: projectTasks.filter(x => x.id !== tid) });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DetailTopbar
        project={project}
        isEditMode={isEditMode}
        onToggleEdit={() => setIsEditMode(!isEditMode)}
        onDelete={() => setShowDeleteModal(true)}
      />

      {isEditMode && <EditBanner />}

      {/* View switcher */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { key: 'project', label: 'Proyecto', icon: Layout },
            { key: 'tasks',   label: `Tareas${projectTasks.length > 0 ? ` (${projectTasks.length})` : ''}`, icon: CheckSquare },
            { key: 'changes', label: `Cambios${(project.changeRequests?.length ?? 0) > 0 ? ` (${project.changeRequests!.length})` : ''}`, icon: GitPullRequest },
          ].map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.key}
                onClick={() => setActiveView(v.key as typeof activeView)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeView === v.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" /> {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {activeView === 'tasks' && (
          <TaskBoard
            tasks={projectTasks}
            teamMembers={settings.teamMembers ?? []}
            onAdd={addTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}

        {activeView === 'changes' && (
          <div className="max-w-3xl">
            <ChangeRequests
              projectId={project.id}
              changeRequests={project.changeRequests ?? []}
              currency={project.currency}
            />
          </div>
        )}

        {activeView === 'project' && <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna Principal (65%) */}
          <div className="flex-1 lg:w-2/3">
            <NoticePin
              notice={project.notice}
              isEditMode={isEditMode}
              onChange={(val) => handleUpdate({ notice: val })}
            />

            <ProjectHero
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectProgressBar
              progress={project.progress}
              currentStage={project.currentStage}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectTimeline
              phases={project.phases}
              isEditMode={isEditMode}
              onUpdate={(phases) => handleUpdate({ phases })}
            />

            <ProjectDeliverables
              deliverables={project.deliverables}
              isEditMode={isEditMode}
              onUpdate={(deliverables) => handleUpdate({ deliverables })}
            />

            <ProjectRevisions
              revisions={project.revisions}
              isEditMode={isEditMode}
              onUpdate={(revisions) => handleUpdate({ revisions })}
            />

            <ProjectDocuments
              documents={project.documents}
              isEditMode={isEditMode}
              onUpdate={(documents) => handleUpdate({ documents })}
            />
          </div>

          {/* Sidebar (35%) */}
          <div className="lg:w-1/3">
            <ProjectInfoWidget
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <PaymentWidget
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <AccessesWidget
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <UpdateLogWidget
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />

            <DevContactWidget
              project={project}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
            />
          </div>
        </div>}
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="¿Eliminar proyecto?"
        message={`¿Estás seguro de que querés eliminar "${project.name}"? Esta acción borrará todos los datos de forma permanente.`}
        confirmText="Sí, eliminar"
        cancelText="No, cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ProjectDetail;
