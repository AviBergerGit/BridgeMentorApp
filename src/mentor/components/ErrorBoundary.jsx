import React from 'react';
import { ErrorScreen } from './ErrorScreen.jsx';

export class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  render(){
    if (this.state.err) return <ErrorScreen onRetry={() => this.setState({ err: null })} onHome={this.props.onHome}/>;
    return this.props.children;
  }
}
