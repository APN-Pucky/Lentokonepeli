
export function rm(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}
export const LOG = true;
export function log(...s: any) {
  if (LOG) console.log(s);
}