export function mysteryTool(game) {
	const randomEffect = Math.random() > 0.5 ? 'bonus' : 'penalty';
	console.log(`Mystery Tool triggered: ${randomEffect}`);
}
