export interface AppProps {
  title?: string;
}

export function App({ title = 'check-app-frontend' }: AppProps) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  );
}