// @vitest-environment jsdom
import type { ComponentType, ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import type { AgenticRunK8s } from '../../models/agenticrun';
import { renderWithProviders, screen, within } from '../../test-render';
import RunListPage from './RunListPage';

let visibleNames: string[] | undefined;

vi.mock('@openshift-console/dynamic-plugin-sdk', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  k8sDelete: vi.fn(),
  ListPageBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ListPageFilter: () => null,
  ListPageHeader: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  TableData: ({ id, children }: { id: string; children: ReactNode }) => (
    <td data-test={`cell-${id}`}>{children}</td>
  ),
  useListPageFilter: (runs: AgenticRunK8s[] | undefined) => [
    runs,
    visibleNames ? runs?.filter((run) => visibleNames?.includes(run.metadata.name)) : runs,
    vi.fn(),
  ],
  VirtualizedTable: ({
    columns,
    data,
    Row,
  }: {
    columns: { id: string; title: string }[];
    data: AgenticRunK8s[] | undefined;
    Row: ComponentType<{ obj: AgenticRunK8s; activeColumnIDs: Set<string> }>;
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map(({ id, title }) => (
            <th key={id}>{title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((obj) => (
          <tr key={obj.metadata.name}>
            <Row activeColumnIDs={new Set(columns.map(({ id }) => id))} obj={obj} />
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('../AgenticLayout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./AgenticCapabilitiesToggle', () => ({ default: () => null }));

const makeRun = (name: string, targetCluster?: string): AgenticRunK8s => ({
  apiVersion: 'agentic.openshift.io/v1alpha1',
  kind: 'AgenticRun',
  metadata: { name, namespace: 'default' },
  spec: { request: 'Help', ...(targetCluster !== undefined ? { targetCluster } : {}) },
});

const watch = vi.mocked(useK8sWatchResource);

const renderRuns = (runs: AgenticRunK8s[]) => {
  watch.mockReturnValue([runs, true, undefined]);
  return renderWithProviders(<RunListPage />);
};

afterEach(() => {
  visibleNames = undefined;
  vi.clearAllMocks();
});

describe('RunListPage columns', () => {
  test.each([undefined, 'remote-cluster'])(
    'renders the supported columns (%s)',
    (targetCluster) => {
      renderRuns([makeRun('first', targetCluster)]);

      const expectedColumns = [
        'Name',
        ...(targetCluster ? ['Target cluster'] : []),
        'Trigger domain',
        'Status',
        'Tokens (in / out)',
        'Created',
        '',
      ];
      expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(
        expectedColumns,
      );
      expect(screen.getAllByRole('cell')).toHaveLength(expectedColumns.length);
    },
  );
});

describe('RunListPage target cluster column', () => {
  test('is hidden when no run has the field', () => {
    renderRuns([makeRun('first'), makeRun('second')]);

    expect(screen.queryByRole('columnheader', { name: 'Target cluster' })).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('cell-target-cluster')).toHaveLength(0);
  });

  test('shows the value and a dash for missing or blank values', () => {
    renderRuns([
      makeRun('present', 'remote-cluster'),
      makeRun('missing'),
      makeRun('blank', ''),
      makeRun('whitespace', '   '),
    ]);

    expect(screen.getByRole('columnheader', { name: 'Target cluster' })).toBeInTheDocument();
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByTestId('cell-target-cluster')).toHaveTextContent('remote-cluster');
    rows.slice(1).forEach((row) => {
      expect(within(row).getByTestId('cell-target-cluster')).toHaveTextContent(/^-$/);
    });
  });

  test('updates the column when watched runs change', () => {
    const { rerender } = renderRuns([makeRun('first')]);
    expect(screen.queryByRole('columnheader', { name: 'Target cluster' })).not.toBeInTheDocument();

    watch.mockReturnValue([[makeRun('first', 'remote-cluster')], true, undefined]);
    rerender(<RunListPage />);
    expect(screen.getByRole('columnheader', { name: 'Target cluster' })).toBeInTheDocument();
    expect(screen.getByTestId('cell-target-cluster')).toHaveTextContent('remote-cluster');

    watch.mockReturnValue([[makeRun('first', '   ')], true, undefined]);
    rerender(<RunListPage />);
    expect(screen.queryByRole('columnheader', { name: 'Target cluster' })).not.toBeInTheDocument();
  });

  test('hides the column when all values are empty or whitespace', () => {
    renderRuns([makeRun('blank', ''), makeRun('whitespace', '   '), makeRun('missing')]);

    expect(screen.queryByRole('columnheader', { name: 'Target cluster' })).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('cell-target-cluster')).toHaveLength(0);
  });

  test('keeps the column when the run with the field is filtered out', () => {
    visibleNames = ['missing'];
    renderRuns([makeRun('present', 'remote-cluster'), makeRun('missing')]);

    expect(screen.getByRole('columnheader', { name: 'Target cluster' })).toBeInTheDocument();
    expect(screen.getByTestId('cell-target-cluster')).toHaveTextContent('-');
    expect(screen.queryByText('remote-cluster')).not.toBeInTheDocument();
  });
});
