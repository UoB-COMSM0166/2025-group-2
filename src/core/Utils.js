export function checkCollision(a, b) {
	return dist(a.x, a.y, b.x, b.y) < 2 + a.d
}
