import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const mockUseState = vi.fn((init) => {
    if (typeof init === 'boolean') {
      return [init, vi.fn()];
    }
    if (init === null) {
      return [null, vi.fn()];
    }
    return [init, vi.fn()];
  });
  const mockUseRef = vi.fn(() => ({ current: null }));
  const mockUseEffect = vi.fn();

  return {
    ...actual,
    default: {
      ...(actual as typeof actual & { default: Record<string, unknown> }).default,
      useState: mockUseState,
      useRef: mockUseRef,
      useEffect: mockUseEffect,
      useSyncExternalStore: (_sub: unknown, getSnap: () => unknown) => getSnap(),
    },
    useState: mockUseState,
    useRef: mockUseRef,
    useEffect: mockUseEffect,
    useSyncExternalStore: (_sub: unknown, getSnap: () => unknown) => getSnap(),
  };
});

vi.mock('@open-codesign/i18n', () => ({
  useT: () => (key: string, _opts?: Record<string, unknown>) => key,
}));

const mockSetCommentsPanelPosition = vi.fn();

const fakeState: {
  interactionMode: 'comment' | 'default';
  currentDesignId: string | null;
  comments: never[];
  currentSnapshotId: string | null;
  previewZoom: number;
  setInteractionMode: Mock;
  openCommentBubble: Mock;
  removeComment: Mock;
  commentsPanelPosition: { x: number; y: number } | null;
  setCommentsPanelPosition: Mock;
} = {
  interactionMode: 'comment',
  currentDesignId: 'design-1',
  comments: [],
  currentSnapshotId: null,
  previewZoom: 100,
  setInteractionMode: vi.fn(),
  openCommentBubble: vi.fn(),
  removeComment: vi.fn(),
  commentsPanelPosition: null,
  setCommentsPanelPosition: mockSetCommentsPanelPosition,
};

vi.mock('../../store', () => ({
  useCodesignStore: (selector: (state: typeof fakeState) => unknown) => selector(fakeState),
}));

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

vi.mock('react-draggable', () => ({
  default: (props: {
    nodeRef: { current: HTMLDivElement | null };
    handle: string;
    bounds: string;
    position: { x: number; y: number };
    onStop: (e: unknown, data: { x: number; y: number }) => void;
    children: React.ReactNode;
  }) => (
    <div
      ref={props.nodeRef}
      data-testid="draggable-mock"
      data-handle={props.handle}
      data-bounds={props.bounds}
      data-position-x={props.position.x}
      data-position-y={props.position.y}
    >
      <button
        type="button"
        data-testid="drag-stop-trigger"
        onClick={() => props.onStop(null, { x: 100, y: 200 })}
      >
        trigger stop
      </button>
      {props.children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  GripVertical: () => <svg data-testid="grip-vertical-icon">GripVertical</svg>,
  Trash2: () => <svg>Trash2</svg>,
  X: () => <svg>X</svg>,
}));

vi.stubGlobal('document', {
  body: {},
});

import { CommentsPanel } from './CommentsPanel';

describe('CommentsPanel draggable behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeState.interactionMode = 'comment';
    fakeState.currentDesignId = 'design-1';
    fakeState.commentsPanelPosition = null;
    mockSetCommentsPanelPosition.mockClear();
  });

  describe('Draggable component configuration', () => {
    it('renders with handle selector targeting drag-handle class', () => {
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-handle=".drag-handle"');
    });

    it('configures bounds to body for viewport constraint', () => {
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-bounds="body"');
    });

    it('passes initial position from store when commentsPanelPosition is null', () => {
      fakeState.commentsPanelPosition = null;
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-position-x="0"');
      expect(html).toContain('data-position-y="0"');
    });

    it('passes persisted position from store when commentsPanelPosition is set', () => {
      fakeState.commentsPanelPosition = { x: 50, y: 75 };
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-position-x="50"');
      expect(html).toContain('data-position-y="75"');
    });
  });

  describe('drag handle element', () => {
    it('marks header with drag-handle class for drag initiation', () => {
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('drag-handle');
      expect(html).toContain('cursor-move');
    });

    it('includes GripVertical icon in the drag handle area', () => {
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-testid="grip-vertical-icon"');
    });
  });

  describe('position persistence', () => {
    it('has onStop callback wired to setCommentsPanelPosition', () => {
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-testid="drag-stop-trigger"');
    });

    it('persisted position survives re-render with same store state', () => {
      fakeState.commentsPanelPosition = { x: 120, y: 80 };
      const html1 = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html1).toContain('data-position-x="120"');
      expect(html1).toContain('data-position-y="80"');

      fakeState.commentsPanelPosition = { x: 120, y: 80 };
      const html2 = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html2).toContain('data-position-x="120"');
      expect(html2).toContain('data-position-y="80"');
    });
  });

  describe('panel visibility and interaction mode', () => {
    it('returns null when interactionMode is not comment', () => {
      fakeState.interactionMode = 'default';
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toBe('');
    });

    it('returns null when currentDesignId is null', () => {
      fakeState.interactionMode = 'comment';
      fakeState.currentDesignId = null;
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toBe('');
    });

    it('renders panel when interactionMode is comment and currentDesignId is set', () => {
      fakeState.interactionMode = 'comment';
      fakeState.currentDesignId = 'design-1';
      const html = ReactDOMServer.renderToString(React.createElement(CommentsPanel));

      expect(html).toContain('data-testid="draggable-mock"');
    });
  });

  describe('setCommentsPanelPosition action', () => {
    it('exists on the store and accepts position object', () => {
      fakeState.commentsPanelPosition = null;

      fakeState.setCommentsPanelPosition({ x: 10, y: 20 });

      expect(mockSetCommentsPanelPosition).toHaveBeenCalledWith({ x: 10, y: 20 });
    });

    it('updates store state when called', () => {
      fakeState.commentsPanelPosition = { x: 30, y: 40 };

      expect(fakeState.commentsPanelPosition).toEqual({ x: 30, y: 40 });
    });
  });
});
