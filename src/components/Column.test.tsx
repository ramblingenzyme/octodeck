import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';

afterEach(cleanup);
import userEvent from '@testing-library/user-event';
import { Column } from './Column';
import type { ColumnConfig } from '@/types';

const noop = () => {};

function makeCol(type: ColumnConfig['type'], title = 'Test Column'): ColumnConfig {
  return { id: "col-1", type, title };
}

function renderColumn(col: ColumnConfig, overrides: Partial<{
  onRemove: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}> = {}) {
  return render(
    <Provider store={store}>
      <Column
        col={col}
        onRemove={overrides.onRemove ?? noop}
        onMoveLeft={noop}
        onMoveRight={noop}
        isFirst={overrides.isFirst ?? false}
        isLast={overrides.isLast ?? false}
      />
    </Provider>
  );
}

describe('Column card type switching', () => {
  it('renders PR cards for prs type', () => {
    renderColumn(makeCol('prs', 'PRs'));
    // PR cards contain a draft/review structure; check for review label
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders Issue cards for issues type', () => {
    renderColumn(makeCol('issues', 'Issues'));
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders CI cards for ci type', () => {
    renderColumn(makeCol('ci', 'CI'));
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders Notification cards for notifications type', () => {
    renderColumn(makeCol('notifications', 'Notifs'));
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders Activity cards for activity type', () => {
    renderColumn(makeCol('activity', 'Activity'));
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });
});

describe('Column header', () => {
  it('shows the column title', () => {
    renderColumn(makeCol('prs', 'My Pull Requests'));
    expect(screen.getByText('My Pull Requests')).toBeTruthy();
  });
});

describe('Column move buttons', () => {
  it('move-left button is disabled when isFirst is true', () => {
    renderColumn(makeCol('prs'), { isFirst: true });
    const btn = screen.getByRole('button', { name: /move left/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('move-right button is disabled when isLast is true', () => {
    renderColumn(makeCol('prs'), { isLast: true });
    const btn = screen.getByRole('button', { name: /move right/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Column remove confirmation', () => {
  it('calls onRemove after confirming removal', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderColumn(makeCol('prs', 'My PRs'), { onRemove });

    await user.click(screen.getByRole('button', { name: /remove column/i }));
    expect(screen.getByRole('alert')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /yes, remove/i }));
    expect(onRemove).toHaveBeenCalledWith("col-1");
  });
});
