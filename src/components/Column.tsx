import { useState, useEffect, useRef } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { ColumnConfig, PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from '@/types';
import { useColumnData } from '@/hooks/useColumnData';
import styles from './Column.module.css';
import { ColumnHeader } from './ColumnHeader';
import { ColumnConfirmDelete } from './ColumnConfirmDelete';
import { PRCard } from './cards/PRCard';
import { IssueCard } from './cards/IssueCard';
import { CICard } from './cards/CICard';
import { NotifCard } from './cards/NotifCard';
import { ActivityCard } from './cards/ActivityCard';
import { ColumnSettingsModal } from './ColumnSettingsModal';

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const Column = ({ col, onRemove }: ColumnProps) => {
  const [confirming, setConfirming] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dropEdge, setDropEdge] = useState<'left' | 'right' | null>(null);
  const ref = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const { data, isLoading, isFetching, error, refetch } = useColumnData(col);
  const prevFetching = useRef(false);

  useEffect(() => {
    if (prevFetching.current && !isFetching) {
      setLastUpdated(new Date());
    }
    prevFetching.current = isFetching;
  }, [isFetching]);

  // Re-render every minute so the relative time stays accurate.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: () => ({ columnId: col.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: () => ({ columnId: col.id }),
      canDrop: ({ source }) => source.data.columnId !== col.id,
      onDragEnter: ({ location }) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        setDropEdge(location.current.input.clientX < mid ? 'left' : 'right');
      },
      onDrag: ({ location }) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        setDropEdge(location.current.input.clientX < mid ? 'left' : 'right');
      },
      onDragLeave: () => setDropEdge(null),
      onDrop: () => setDropEdge(null),
    });
    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [col.id]);

  const handleRefresh = () => {
    refetch();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
  };

  const renderCard = (item: PRItem | IssueItem | CIItem | NotifItem | ActivityItem) => {
    switch (col.type) {
      case 'prs':
        return <PRCard key={item.id} item={item as PRItem} />;
      case 'issues':
        return <IssueCard key={item.id} item={item as IssueItem} />;
      case 'ci':
        return <CICard key={item.id} item={item as CIItem} />;
      case 'notifications':
        return <NotifCard key={item.id} item={item as NotifItem} />;
      case 'activity':
        return <ActivityCard key={item.id} item={item as ActivityItem} />;
    }
  };

  const columnClass = [
    styles.column,
    styles[col.type],
    isDragging ? styles.columnDragging : '',
    dropEdge === 'left' ? styles.dropLeft : '',
    dropEdge === 'right' ? styles.dropRight : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={ref} className={columnClass} aria-label={col.title}>
      <ColumnHeader
        col={col}
        handleRef={handleRef}
        itemCount={data.length}
        isFetching={isFetching}
        spinning={spinning}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onOpenSettings={() => setShowSettings(true)}
        onConfirmRemove={() => setConfirming(true)}
      />

      {col.query && (
        <div className={styles.colQuery} title={col.query}>
          <span className={styles.colQueryText}>{col.query}</span>
          <button
            className={styles.colQueryEdit}
            onClick={() => setShowSettings(true)}
            aria-label="Edit filter query"
          >
            edit
          </button>
        </div>
      )}

      {confirming && (
        <ColumnConfirmDelete
          col={col}
          onCancel={() => setConfirming(false)}
          onConfirm={() => onRemove(col.id)}
        />
      )}

      <div className={styles.colBody}>
        {isLoading && (
          <div className={styles.skeletonWrapper} aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        )}
        {error && !isLoading && (
          <div className={styles.errorState} role="alert">
            {error}
          </div>
        )}
        {!isLoading && !error && data.map((item) => renderCard(item))}
      </div>

      {showSettings && <ColumnSettingsModal col={col} onClose={() => setShowSettings(false)} />}
    </section>
  );
};
