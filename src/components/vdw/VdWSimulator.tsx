'use client';

import { useState, useMemo, useCallback } from 'react';
import { GAS_DB, type Gas } from './VdWEngine';
import TabBar from '@/components/shared/TabBar';
import VdW2DPanel from './VdW2DPanel';
import VdW3DPanel from './VdW3DPanel';

const TABS = [
  { id: '2d', label: 'P-V Isotherms' },
  { id: '3d', label: '3D P-V-T Surface' },
];

export default function VdWSimulator() {
  const [tab, setTab] = useState('2d');
  const [gasId, setGasId] = useState('co2');

  const gas = useMemo(() => GAS_DB.find((g) => g.id === gasId)!, [gasId]);

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
      <div className="flex-1 min-h-0">
        {tab === '2d' ? (
          <VdW2DPanel gas={gas} gasId={gasId} onGasChange={setGasId} />
        ) : (
          <VdW3DPanel gas={gas} gasId={gasId} onGasChange={setGasId} />
        )}
      </div>
    </div>
  );
}
