type VitalPoint = {
  id: string;
  recorded_at: string;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  notes?: string | null;
};

type MetricKey =
  | "temperature_c"
  | "pulse_bpm"
  | "respiratory_rate"
  | "spo2"
  | "pain_score";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function metricLabel(metric: MetricKey) {
  switch (metric) {
    case "temperature_c":
      return "Temperature °C";
    case "pulse_bpm":
      return "Pulse BPM";
    case "respiratory_rate":
      return "Respiratory Rate";
    case "spo2":
      return "SpO2 %";
    case "pain_score":
      return "Pain Score";
    default:
      return metric;
  }
}

function metricValue(point: VitalPoint, metric: MetricKey): number | null {
  const value = point[metric];
  return typeof value === "number" ? value : null;
}

function buildPolylinePoints(values: Array<number | null>, width: number, height: number) {
  const valid = values.filter((v): v is number => typeof v === "number");
  if (valid.length === 0) return "";

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width / 2;

  return values
    .map((value, index) => {
      if (typeof value !== "number") return null;
      const x = index * stepX;
      const normalized = (value - min) / range;
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

function TrendChartCard({
  title,
  values,
  latest,
}: {
  title: string;
  values: Array<number | null>;
  latest: number | null;
}) {
  const width = 280;
  const height = 90;
  const points = buildPolylinePoints(values, width, height);
  const validCount = values.filter((v) => typeof v === "number").length;

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest: {latest ?? "—"}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {validCount} point{validCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted/30 p-3">
        {points ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-28 w-full"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={points}
              className="text-foreground"
            />
          </svg>
        ) : (
          <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}

export function VitalsTimelineChart({
  vitals,
}: {
  vitals: VitalPoint[];
}) {
  const ordered = [...vitals].reverse();

  const metricKeys: MetricKey[] = [
    "temperature_c",
    "pulse_bpm",
    "respiratory_rate",
    "spo2",
    "pain_score",
  ];

  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Vitals Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Trend view of recorded inpatient vitals over time.
        </p>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No vitals recorded yet.
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {metricKeys.map((metric) => (
              <TrendChartCard
                key={metric}
                title={metricLabel(metric)}
                values={ordered.map((point) => metricValue(point, metric))}
                latest={metricValue(ordered[ordered.length - 1] ?? ordered[0], metric)}
              />
            ))}
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="font-medium">Blood Pressure History</h3>
            <div className="mt-3 space-y-2">
              {ordered.map((point) => (
                <div
                  key={point.id}
                  className="flex flex-col gap-1 rounded-md bg-muted/30 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <span className="text-muted-foreground">
                    {formatDateTime(point.recorded_at)}
                  </span>
                  <span>
                    {point.blood_pressure_systolic ?? "—"} / {point.blood_pressure_diastolic ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}