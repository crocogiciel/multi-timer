export interface TimerBlock {
  id: string
  name: string
  duration: number // seconds
}

export interface Sequence {
  id: string
  name: string
  timers: TimerBlock[]
  gapDuration: number     // seconds between timers (0 = none)
  tickLeadTime: number    // seconds before end of timer to tick
  gapTickLeadTime: number // seconds before end of gap to tick (0 = none)
}
