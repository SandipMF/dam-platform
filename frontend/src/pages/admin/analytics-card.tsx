interface AnalyticsCardProps {
  title: string;
  value: number;
}

export default function AnalyticsCard({ title, value }: AnalyticsCardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded shadow">
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
