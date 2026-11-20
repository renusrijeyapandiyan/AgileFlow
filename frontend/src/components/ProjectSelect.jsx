export default function ProjectSelect({ projects, value, onChange, className = '' }) {
  return (
    <select className={`input w-auto min-w-[200px] ${className}`} value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}
