'use client';

import { useState, useMemo } from 'react';
import { GAS_DB, type Gas } from './VdWEngine';
import TabBar from '@/components/shared/TabBar';
import VdW2DPanel from './VdW2DPanel';
import VdW3DPanel from './VdW3DPanel';
import RelatedTools from '@/components/shared/RelatedTools';
import { CTK_TO_VDW } from '@/lib/connections';

const TABS = [
  { id: '2d', label: 'P-V Isotherms' },
  { id: '3d', label: '3D P-V-T Surface' },
];

// Reverse map: VdW id → CTK id
const VDW_TO_CTK: Record<string, string> = Object.fromEntries(
  Object.entries(CTK_TO_VDW).map(([ctk, vdw]) => [vdw, ctk])
);

interface Props { initialGasId?: string; }

export default function VdWSimulator({ initialGasId }: Props = {}) {
  const [tab, setTab] = useState('2d');
  const validInitial = initialGasId && GAS_DB.find((g) => g.id === initialGasId) ? initialGasId : 'co2';
  const [gasId, setGasId] = useState(validInitial);

  const gas = useMemo(() => GAS_DB.find((g) => g.id === gasId)!, [gasId]);

  const ctkGasId = VDW_TO_CTK[gasId];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b border-[var(--color-border)]">
        <div className="px-5 py-2 border-r border-[var(--color-border)]">
          <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
            (P + a/V²)(V − b) = RT
          </span>
        </div>
        <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          {tab === '2d' ? (
            <VdW2DPanel gas={gas} gasId={gasId} onGasChange={setGasId} />
          ) : (
            <VdW3DPanel gas={gas} gasId={gasId} onGasChange={setGasId} />
          )}
        </div>
        {/* Connection panel on the right */}
        <div
          className="w-[200px] min-w-[200px] overflow-y-auto p-3 border-l bg-[var(--color-bg-tertiary)]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <RelatedTools
            toolId="vdw"
            links={ctkGasId ? { ctk: `?gasA=${ctkGasId}` } : {}}
          />
        </div>
      </div>
    </div>
  );
}
