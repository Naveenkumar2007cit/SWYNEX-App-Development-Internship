export default function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sz = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sz} animate-spin rounded-full border-4 border-navy-100 border-t-teal-500`} />
      {text && <p className="text-sm text-navy-500">{text}</p>}
    </div>
  );
}
