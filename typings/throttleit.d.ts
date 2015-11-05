declare var throttle: Throttle;
declare module 'throttleit' {
  export = throttle;
}
interface Throttle {
  (fn: Function, delay: number): any;
}
