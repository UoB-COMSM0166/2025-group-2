import {
	FireIncident,
	FogIncident,
	FreezeIncident,
	RainIncident,
	WindIncident,
} from '../incidents/index.js';

export class IncidentManager {
	constructor(board, gameArea, endLine) {
		this.game = board;
		this.gameArea = gameArea;
		this.endLine = endLine;

		this.incidents = {
			Wind: new WindIncident(board),
			Fog: new FogIncident(board, gameArea, endLine),
			Freeze: new FreezeIncident(board),
			Fire: new FireIncident(board),
			Rain: new RainIncident(board, gameArea),
		};
		this.activeIncidents = [];
		this.isWarning = false;
		this.warningStartTime = 0;
		this.pendingIncident = null;

		this.incidentInterval = null;
		this.shieldOn = false; //check if the sheild is on
	}

	startIncident() {
		//start random incident
		this.incidentInterval = setInterval(() => {
			this.randomIncident();
		}, this.getRandomInterval());
	}

	getRandomInterval() {
		return Math.floor(Math.random() * (20000 - 15000) + 15000);
	}

	randomIncident() {
		const incidentNames = Object.keys(this.incidents);
		if (incidentNames.length === 0) {
			return;
		}

		const randomIndex = Math.floor(Math.random() * incidentNames.length);
		const incident = incidentNames[randomIndex];

		this.activateIncident(incident);
	}

	update() {
		// Update all events to ensure they are using the latest game references
		for (const incidentName in this.incidents) {
			this.incidents[incidentName].game = this.game;
		}

		if (this.isWarning) {
			let elapsed = millis() - this.warningStartTime;
			if (elapsed < 2000) {
				this.showWarning();
			} else {
				this.isWarning = false;
				if (this.pendingIncident) {
					this.pendingIncident.enable();
					this.activeIncidents.push(this.pendingIncident);
					this.pendingIncident = null;
				}
			}
		}
		const visibleIncidents = this.activeIncidents.filter(i => i.name !== 'Rain');
		if (visibleIncidents.length > 0) {
			let incidentMap = new Map();

			visibleIncidents.forEach(i => {
				if (!incidentMap.has(i.name)) {
					incidentMap.set(i.name, i.timeLeft);
				}
			});

			let labels = Array.from(incidentMap.entries())
				.map(([name, timeLeft]) => `${name} Effect Time Left: ${timeLeft}`)
				.join('\n ');

			fill('#6B4F3F');
			textSize(20);

			if (this.game.mode === 'double') {
				const nextFruitArea = this.game.nextFruitArea;
				const labelX = nextFruitArea.x + nextFruitArea.w * 2 + 50;
				const labelY = nextFruitArea.y + 25;
				text(labels, labelX, labelY);
			} else {
				const gameArea = this.gameArea;
				text(labels, gameArea.x + gameArea.w / 2, gameArea.y - 30);
			}
		}

		this.activeIncidents.forEach(incident => incident.update());
	}

	activateIncident(incidentName, fromPlayer = false) {
		if (this.shieldOn) {
			return;
		}

		const incident = this.incidents[incidentName];
		if (!incident) {
			return;
		}

		incident.game = this.game;
		incident.manager = this;
		incident.name = incidentName;

		const existing = this.activeIncidents.find(i => i.name === incidentName);
		if (existing) {
			existing.timeLeft += incident.duration;
			this.pendingIncident = existing;
			this.timeIncreasedByPlayer = fromPlayer;
		} else {
			this.pendingIncident = incident;
			this.timeIncreasedByPlayer = false;
		}

		this.isWarning = true;
		this.warningStartTime = millis();
	}

	deactivateIncident(incidentName) {
		const incident = this.incidents[incidentName];
		if (incident) {
			incident.disable();
			this.activeIncidents = this.activeIncidents.filter(incident => {
				return incident.name !== incidentName;
			});
		}
	}

	pauseActiveIncidents() {
		this.shieldOn = true;
		this.activeIncidents.forEach(incident => incident.pause());
	}

	resumePausedIncidents() {
		this.shieldOn = false;
		this.activeIncidents.forEach(incident => incident.resume());
	}

	showWarning() {
		push();
		textAlign(CENTER, CENTER);
		textSize(30);
		fill(255, 0, 0);
		let warningText = '';
		if (this.timeIncreasedByPlayer) {
			warningText = `${this.pendingIncident.name} Time Left Increased!`;
		} else {
			warningText = `${this.pendingIncident.name} Incident Coming!`;
		}

		text(warningText, this.gameArea.x + this.gameArea.w / 2, this.gameArea.y - 60);

		pop();
	}

	stopAllIncidents() {
		if (this.incidentInterval) {
			clearInterval(this.incidentInterval);
		}

		// Deactivate any active incidents
		this.activeIncidents.forEach(incident => {
			if (incident && incident.name) {
				this.deactivateIncident(incident.name);
			}
		});

		this.activeIncidents = [];
	}

	reset() {
		this.stopAllIncidents(); // Stop all active incidents and clear the incident interval

		// Reset flags
		this.isWarning = false;
		this.warningStartTime = 0;
		this.pendingIncident = null;
		this.shieldOn = false;
		this.activeIncidents = [];

		// Restart random incident generation immediately after reset
		this.startIncident();
	}
}
