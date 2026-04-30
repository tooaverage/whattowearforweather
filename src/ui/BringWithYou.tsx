interface Props {
  message: string | null;
}

export function BringWithYou({ message }: Props) {
  if (!message) return null;
  return (
    <section className="rounded-2xl bg-amber-300/10 p-4 ring-1 ring-amber-200/20">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-200">
        Bring with you
      </h2>
      <p className="mt-1 text-sm text-amber-100">{message}</p>
    </section>
  );
}
