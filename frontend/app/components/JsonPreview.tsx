export function JsonPreview(props: { title: string; value: unknown }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{props.title}</h2>
        <p>Raw backend state rendered without reshaping.</p>
      </div>
      <pre className="json-preview">{JSON.stringify(props.value, null, 2)}</pre>
    </div>
  );
}
