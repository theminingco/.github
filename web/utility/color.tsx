

// TODO: color scheme
const colors = [
  "#16a34a", "#a1ca62", "#fff095", "#f49b59", "#d43d51",
  "#56b04f", "#c2d771", "#fdd47b", "#ed7d51", "#7ebd57",
  "#e1e382", "#f9b867", "#e25e4f",
];


export function getColor(index: number): string {
  return colors[index % colors.length];
}
