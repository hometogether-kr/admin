import type { ReactNode } from "react";

export type AdminTableColumn = {
  readonly key: string;
  readonly kind?: "text" | "identifier" | "actions";
  readonly label: string;
};

export type AdminTableRow = {
  readonly cells: readonly ReactNode[];
  readonly key: string;
};

type TableShellProps = {
  readonly caption: string;
  readonly columns: readonly AdminTableColumn[];
  readonly empty?: ReactNode;
  readonly rows: readonly AdminTableRow[];
};

const CELL_CLASSES = {
  text: "text-left",
  identifier: "admin-break-anywhere text-left font-mono tabular-nums",
  actions: "text-right",
} as const satisfies Record<
  NonNullable<AdminTableColumn["kind"]>,
  string
>;

export function TableShell({
  caption,
  columns,
  empty = "표시할 항목이 없습니다.",
  rows,
}: TableShellProps) {
  return (
    <div className="min-w-0 rounded-panel border border-line bg-surface">
      <div
        aria-label={`${caption} 가로 스크롤 영역`}
        className="admin-focus max-w-full overflow-x-auto rounded-panel"
        data-table-scroller="true"
        role="region"
        tabIndex={0}
      >
        <table
          className={[
            "w-full border-collapse text-body",
            rows.length > 0 ? "min-w-table" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-subtle text-label text-ink-subtle">
            <tr>
              {columns.map((column) => (
                <th
                  className={[
                    "border-b border-line px-4 py-3 font-semibold",
                    CELL_CLASSES[column.kind ?? "text"],
                  ].join(" ")}
                  key={column.key}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-ink-subtle"
                  colSpan={columns.length}
                >
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr className="hover:bg-surface-subtle" key={row.key}>
                  {columns.map((column, columnIndex) => (
                    <td
                      className={[
                        "max-w-80 px-4 py-3 align-top text-ink",
                        CELL_CLASSES[column.kind ?? "text"],
                      ].join(" ")}
                      key={column.key}
                    >
                      {row.cells[columnIndex]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
