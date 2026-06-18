// Shape returned by the analytics_overview Postgres RPC. Plain module (no
// "use server") so both the server action and the client panel can import it.

export type Point = { t: string; v: number };
export type Slice = { k: string; v: number };
export type HourSlice = { k: number; v: number };

export type Analytics = {
  messages_total: number;
  conversations_total: number;
  leads_total: number;
  unique_visitors: number;
  msg_series: Point[];
  conv_series: Point[];
  countries: Slice[];
  devices: Slice[];
  browsers: Slice[];
  hours: HourSlice[];
};

export type Bucket = "hour" | "day" | "week";
