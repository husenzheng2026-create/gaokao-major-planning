import type { ReactNode } from 'react';
import './app.scss';

type AppProps = {
  children?: ReactNode;
};

export default function App(props: AppProps) {
  return props.children ?? null;
}
