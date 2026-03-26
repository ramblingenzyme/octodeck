import { useId } from "preact/hooks";
import type { ColumnType } from "@/types";
import type { ServerFilteredMap, ClientFilterMap } from "@/utils/queryFilter";
import { COLUMN_FILTERS } from "@/utils/queryFilter";
import { cleanId } from "@/utils/id";
import styles from "./FilterHelpPopover.module.css";

interface FilterHelpPopoverProps {
  columnType: ColumnType;
}

export const FilterHelpPopover = ({ columnType }: FilterHelpPopoverProps) => {
  const id = useId();
  const popoverId = `filter-help-${cleanId(id)}`;
  const anchorName = `--filter-help-${cleanId(id)}`;

  const filterMap = COLUMN_FILTERS[columnType];

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        popovertarget={popoverId}
        style={{ anchorName } as React.CSSProperties}
        aria-label="Filter syntax help"
      >
        ?
      </button>
      <div
        id={popoverId}
        popover="auto"
        className={styles.popover}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        <p className={styles.heading}>Filter syntax — {filterMap.name}</p>
        {"serverFiltered" in filterMap ? (
          <ServerFilteredContent filterMap={filterMap} />
        ) : (
          <ClientFilterContent filterMap={filterMap} />
        )}
      </div>
    </>
  );
};

const ServerFilteredContent = ({ filterMap }: { filterMap: ServerFilteredMap }) => {
  const { serverFiltered } = filterMap;
  return (
    <>
      <p className={styles.groupLabel}>GitHub Search API</p>
      <dl className={styles.filterList}>
        {serverFiltered.examples.map(({ key, description }) => (
          <div key={key} className={styles.filterRow}>
            <dt className={styles.filterKey}>{key}</dt>
            <dd className={styles.filterDesc}>{description}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.textSearch}>Prefix with - to negate (e.g. -label:wontfix)</p>
      <a href={serverFiltered.docsUrl} target="_blank" rel="noreferrer" className={styles.docsLink}>
        Full syntax docs ↗
      </a>
    </>
  );
};

const ClientFilterContent = ({ filterMap }: { filterMap: ClientFilterMap<unknown> }) => {
  const serverFilters = Object.entries(filterMap.filters).filter(
    ([, def]) => def.scope === "server",
  );
  const clientFilters = Object.entries(filterMap.filters).filter(
    ([, def]) => def.scope === "client",
  );
  return (
    <>
      {serverFilters.length > 0 && (
        <section>
          <p className={styles.groupLabel}>API filters</p>
          <dl className={styles.filterList}>
            {serverFilters.map(([key, def]) => (
              <div key={key} className={styles.filterRow}>
                <dt className={styles.filterKey}>{key}:</dt>
                <dd className={styles.filterDesc}>{def.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {clientFilters.length > 0 && (
        <section>
          <p className={styles.groupLabel}>Local filters</p>
          <dl className={styles.filterList}>
            {clientFilters.map(([key, def]) => (
              <div key={key} className={styles.filterRow}>
                <dt className={styles.filterKey}>{key}:</dt>
                <dd className={styles.filterDesc}>{def.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {filterMap.textSearchFields.length > 0 && (
        <p className={styles.textSearch}>
          Bare text searches {filterMap.textSearchFields.join(", ")}
        </p>
      )}
      <p className={styles.textSearch}>
        {serverFilters.length > 0
          ? "Prefix local filters with - to negate; negation is not supported for API filters"
          : "Prefix with - to negate (e.g. -status:failure)"}
      </p>
    </>
  );
};
