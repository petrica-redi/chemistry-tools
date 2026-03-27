import ToolCard from '@/components/layout/ToolCard';
import { TOOLS } from '@/types';

export default function Home() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-accent-blue)] via-[var(--color-accent-green)] to-[var(--color-accent-purple)] bg-clip-text text-transparent">
          Chemistry Tools
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-sm max-w-xl mx-auto">
          Interactive simulation tools for surface science, catalysis, quantum
          chemistry, and thermodynamics. Built for research and teaching.
        </p>
      </div>

      <div className="grid gap-4">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
