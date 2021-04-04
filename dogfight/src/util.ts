
export function rm(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}