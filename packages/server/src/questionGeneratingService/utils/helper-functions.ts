export function findIndicesOfLargestElements(arr: number[]): number[] {
  if (arr.length === 0) {
    return []; // Return an empty array for an empty input array
  }

  let max = arr[0];
  const indices: number[] = [0]; // Initialize with the first index

  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];

    if (current > max) {
      max = current;
      indices.length = 0; // Clear the indices array
      indices.push(i);
    } else if (current === max) {
      indices.push(i);
    }
  }

  return indices;
}
