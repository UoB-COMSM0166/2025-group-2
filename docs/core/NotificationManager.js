export class NotificationManager {
	constructor(duration = 3000) {
		this.notifications = [];
		this.duration = duration;
	}

	// Add a new notification that records the current time
	addNotification(message) {
		this.notifications.push({ message, time: millis() });
	}

	// Update and draw notifications
	update() {
		const currentTime = millis();
		let y = 20;
		for (let i = this.notifications.length - 1; i >= 0; i--) {
			const note = this.notifications[i];
			// If the notification has not expired, it is drawn.
			if (currentTime - note.time < this.duration) {
				push();
				textAlign(RIGHT, TOP);
				textSize(16);
				fill(0);
				text(note.message, width - 20, y);
				pop();
				y += 30;
			} else {
				this.notifications.splice(i, 1);
			}
			while (this.notifications.length > 5) {
				this.notifications.shift();
			}
		}
	}
}
