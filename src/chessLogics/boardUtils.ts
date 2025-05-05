function isBlack(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export { isBlack };
