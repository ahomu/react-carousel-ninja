declare var debounce: Debounce;
declare module 'debounce' {
  export = debounce;
}
interface Debounce {
  (fn: Function, delay: number): any;
}
