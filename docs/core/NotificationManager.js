// NotificationManager.js
export class NotificationManager {
	constructor(duration = 3000) {
		// Lasts 3000 milliseconds = 3 seconds
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
		let y = 20; // Notifications are displayed at the top of the screen, with the initial y coordinate
		// Iterate through the notifications, starting with the last one displayed at the top
		for (let i = this.notifications.length - 1; i >= 0; i--) {
			const note = this.notifications[i];
			// If the notification has not expired, it is drawn.
			if (currentTime - note.time < this.duration) {
				push();
				textAlign(CENTER, TOP);
				textSize(16);
				fill(0);
				text(note.message, width / 2, y);
				pop();
				y += 30; // The next notification goes 30 pixels down
			} else {
				// Delete overdue notice
				this.notifications.splice(i, 1);
			}
			while (this.notifications.length > 5) {
				this.notifications.shift();
			}
		}
	}
}
