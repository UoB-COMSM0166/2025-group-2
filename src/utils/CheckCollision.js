export function checkCollision(a, b) {
	return dist(a.x, a.y, b.x, b.y) < a.d / 2 + b.d / 2;
}
