export type ScriptureRef = string;

export interface QidaseReadings {
  psalm: ScriptureRef;
  gospel: ScriptureRef;
  epistle?: ScriptureRef;
  catholicEpistle?: ScriptureRef;
  acts?: ScriptureRef;
}

export interface DayReadings {
  gregorianMonth: number;
  gregorianDay: number;
  gregorianDate: string;
  ethiopianDate: string;
  morning: ScriptureRef[];
  qidase: QidaseReadings;
  evening: ScriptureRef[];
  ana: number | null;
}
