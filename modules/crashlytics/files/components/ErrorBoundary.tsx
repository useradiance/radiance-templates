import { Component, type ErrorInfo, type ReactNode } from 'react';

import { StateView } from '@/components/ui/StateView';
import { recordError } from '@/lib/crashlytics';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Catches render-time crashes, reports them and offers a way back instead of showing a blank
 * screen. Wrap route groups, not the whole app, so a failure stays local.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    recordError(error, { componentStack: info.componentStack ?? 'unknown' });
  }

  render() {
    if (this.state.hasError) {
      return <StateView kind="error" onAction={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
