import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Keeps the selected project id in the URL (?project=ID); defaults to the first project. */
export default function useProjectSelection(projects) {
  const [params, setParams] = useSearchParams();
  const fromUrl = Number(params.get('project')) || null;
  const valid = projects?.some((p) => p.id === fromUrl);
  const projectId = valid ? fromUrl : projects?.[0]?.id ?? null;

  useEffect(() => {
    if (projects?.length && !valid) setParams({ project: projects[0].id }, { replace: true });
  }, [projects, valid, setParams]);

  const setProjectId = (id) => setParams({ project: id });
  return [projectId, setProjectId];
}
